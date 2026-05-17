// REQUIRED env vars:
//   - NEXT_PUBLIC_SUPABASE_URL
//   - SUPABASE_SERVICE_ROLE_KEY  (service role key from Supabase dashboard)
//   - RAPIDAPI_KEY               (for Zillow adapter)
//   - PERPLEXITY_API_KEY         (for off-market search)
//   - RESEND_API_KEY             (for nightly email)
//   - NEXT_PUBLIC_APP_URL        (used for analysis fetch + email links)
// Add SUPABASE_SERVICE_ROLE_KEY to Vercel:
//   Settings → Environment Variables → SUPABASE_SERVICE_ROLE_KEY

import { inngest } from '@/lib/inngest'
import { createServerClient } from '@supabase/ssr'
import { searchZillowProperties } from './zillow-adapter'
import { searchOffMarketDeals } from './perplexity-adapter'
import { scoreAgainstCriteria } from './scoring-engine'
import type { ScoutConfig, ScoutResult } from './types'

// Service-role Supabase client for server jobs. Cookies are stubbed since the
// job runs outside any request context.
function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export const scoutNightlyRun = inngest.createFunction(
  {
    id: 'scout-nightly-run',
    name: 'Deal Scout Nightly Run',
    concurrency: { limit: 5 },
    triggers: [
      { cron: 'TZ=America/Los_Angeles 0 2 * * *' }, // 2 AM PT nightly
      { event: 'scout/manual.trigger' },
    ],
  },
  async ({ step, logger, event }) => {
    logger.info('Scout run start', { source: event?.name || 'cron' })

    const configs = await step.run('fetch-active-configs', async () => {
      const supabase = createServiceClient()
      const { data, error } = await supabase
        .from('scout_configs')
        .select('*')
        .eq('enabled', true)

      if (error) {
        logger.error('Failed to fetch scout configs:', error)
        return []
      }
      logger.info(`Found ${data?.length || 0} active scout configs`)
      return (data || []) as ScoutConfig[]
    })

    if (configs.length === 0) return { processed: 0 }

    const results = await Promise.allSettled(
      configs.map(config =>
        step.run(`process-user-${config.user_id}`, () => processUserConfig(config, logger))
      )
    )

    const succeeded = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    logger.info(`Scout run complete: ${succeeded} succeeded, ${failed} failed`)
    return { processed: configs.length, succeeded, failed }
  }
)

async function processUserConfig(config: ScoutConfig, logger: any) {
  const supabase = createServiceClient()
  logger.info(`Processing scout for user ${config.user_id}`)

  const allCandidates: any[] = []

  for (const metro of config.target_metros.slice(0, 5)) {
    const [city, state] = metro.split(',').map(s => s.trim())

    try {
      const zillowProps = await searchZillowProperties({
        city: `${city} ${state}`,
        zipCodes: config.zip_codes || undefined,
        maxPrice: config.max_purchase_price || 500000,
        minBeds: config.min_beds || 2,
        propertyTypes: config.property_types,
        maxItems: 15,
      })

      for (const prop of zillowProps) {
        allCandidates.push({
          address: prop.address,
          city: prop.city || city,
          state: prop.state || state,
          metro,
          price: prop.price,
          beds: prop.bedrooms,
          baths: prop.bathrooms,
          sqft: prop.livingArea,
          propertyType: prop.propertyType,
          daysOnMarket: prop.daysOnMarket,
          listingUrl: prop.listingUrl,
          source: 'zillow',
          description: prop.description,
          zestimate: prop.zestimate,
          rentZestimate: prop.rentZestimate,
        })
      }
      logger.info(`[${metro}] Zillow: ${zillowProps.length} properties found`)
    } catch (err) {
      logger.error(`[${metro}] Zillow search failed:`, err)
    }

    if (config.strategy === 'BRRRR' || config.strategy === 'Fix & Flip') {
      try {
        const offMarket = await searchOffMarketDeals({
          metro,
          strategy: config.strategy,
          maxPrice: config.max_purchase_price || 500000,
          propertyTypes: config.property_types,
        })

        for (const prop of offMarket) {
          if (prop.address && prop.price) {
            allCandidates.push({
              address: prop.address,
              city: prop.city,
              state: prop.state,
              metro,
              price: prop.price,
              beds: 0,
              baths: 0,
              sqft: 0,
              propertyType: config.property_types[0] || 'SFR',
              daysOnMarket: 0,
              listingUrl: prop.listingUrl,
              source: 'perplexity',
              description: prop.description,
              zestimate: null,
              rentZestimate: null,
            })
          }
        }
        logger.info(`[${metro}] Perplexity: ${offMarket.length} off-market leads found`)
      } catch (err) {
        logger.error(`[${metro}] Perplexity search failed:`, err)
      }
    }
  }

  logger.info(`Total candidates before scoring: ${allCandidates.length}`)

  const scored = allCandidates.map(c => scoreAgainstCriteria(c, config))
  const passed = scored.filter(c => c.passedFilters)

  logger.info(`Candidates passing filters: ${passed.length}`)

  if (passed.length === 0) return { dealsFound: 0 }

  const toAnalyze = passed.slice(0, 5)
  const analyzedDeals: ScoutResult[] = []

  for (const candidate of toAnalyze) {
    try {
      const fullAddress = `${candidate.address}, ${candidate.city}, ${candidate.state}`

      const analysisRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://dealsletter.io'}/api/analysis/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Scout-Run': 'true',
          },
          body: JSON.stringify({
            address: fullAddress,
            strategy: {
              'BRRRR': 'brrrr',
              'Fix & Flip': 'flip',
              'Buy & Hold': 'rental',
              'House Hack': 'house-hack',
            }[config.strategy] || 'rental',
            purchasePrice: candidate.price,
            downPayment: Math.round(candidate.price * 0.2),
            loanTerms: { interestRate: 7.5, loanTerm: 30, loanType: 'conventional', points: 0 },
            closingCostsPercent: 3,
            monthlyRent: candidate.rentZestimate || undefined,
          }),
        }
      )

      if (!analysisRes.ok || !analysisRes.body) {
        logger.warn(`Analysis failed for ${fullAddress}: ${analysisRes.status}`)
        continue
      }

      const reader = analysisRes.body.getReader()
      const decoder = new TextDecoder()
      let raw = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        raw += decoder.decode(value, { stream: true })
      }

      let dealScore: number | null = null
      let capRate: number | null = null
      let coc: number | null = null
      let cashFlow: number | null = null
      let arv: number | null = null
      let signal: string | null = null
      let aiSummary: string | null = null

      for (const line of raw.split('\n')) {
        if (line.startsWith('RESULT:')) {
          try {
            const result = JSON.parse(line.slice(7))
            dealScore = result.dealScore ?? null
            capRate = result.metrics?.capRate ?? null
            coc = result.metrics?.cashOnCash ?? null
            cashFlow = result.cashFlow?.monthly ?? result.cashFlow?.monthlyCashFlow ?? null
            arv = result.metrics?.arvEstimate ?? null
            aiSummary = result.narrative ?? result.recommendation ?? null
            signal = dealScore != null
              ? dealScore >= 8 ? 'STRONG BUY' : dealScore >= 6 ? 'BUY' : dealScore >= 4 ? 'WATCH' : 'PASS'
              : null
          } catch {}
        }
      }

      if (config.min_deal_score && (dealScore || 0) < config.min_deal_score) {
        logger.info(`${fullAddress} scored ${dealScore} below min ${config.min_deal_score}, skipping`)
        continue
      }

      analyzedDeals.push({
        user_id: config.user_id,
        address: candidate.address,
        city: candidate.city,
        state: candidate.state,
        metro: candidate.metro,
        strategy: config.strategy,
        deal_score: dealScore,
        cap_rate: capRate,
        coc,
        purchase_price: candidate.price,
        arv,
        rehab_estimate: null,
        monthly_cash_flow: cashFlow,
        days_on_market: candidate.daysOnMarket,
        property_type: candidate.propertyType,
        beds: candidate.beds,
        baths: candidate.baths,
        sqft: candidate.sqft,
        signal,
        ai_summary: aiSummary,
        listing_url: candidate.listingUrl,
        is_read: false,
        is_saved: false,
        run_date: new Date().toISOString(),
      })

      logger.info(`Analyzed ${fullAddress}: score ${dealScore}, signal ${signal}`)
    } catch (err) {
      logger.error(`Analysis error for ${candidate.address}:`, err)
    }
  }

  if (analyzedDeals.length > 0) {
    const { error } = await supabase
      .from('scout_results')
      .insert(analyzedDeals)

    if (error) {
      logger.error('Failed to save scout results:', error)
    } else {
      logger.info(`Saved ${analyzedDeals.length} deals for user ${config.user_id}`)
    }
  }

  if (analyzedDeals.length > 0) {
    await sendScoutEmail(config.user_id, analyzedDeals, supabase, logger)
  }

  return { dealsFound: analyzedDeals.length }
}

async function sendScoutEmail(
  userId: string,
  deals: ScoutResult[],
  supabase: any,
  logger: any
) {
  try {
    const { data: { user } } = await supabase.auth.admin.getUserById(userId)
    if (!user?.email) return

    const topDeal = deals[0]
    const dealCount = deals.length

    const dealCards = deals.map(d => `
      <div style="background:#13121d;border:1px solid rgba(127,119,221,0.2);border-radius:12px;padding:18px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
          <div>
            <div style="font-size:15px;font-weight:600;color:#f0eeff;">${d.address}</div>
            <div style="font-size:12px;color:#6b6690;margin-top:2px;">${d.city}, ${d.state} · ${d.strategy}</div>
          </div>
          <span style="background:${d.deal_score && d.deal_score >= 7 ? 'rgba(29,158,117,0.15)' : 'rgba(239,159,39,0.15)'};color:${d.deal_score && d.deal_score >= 7 ? '#1D9E75' : '#EF9F27'};border-radius:6px;padding:3px 10px;font-size:12px;font-weight:600;">
            ${d.deal_score?.toFixed(1) || '—'}/10
          </span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px;">
          <div><div style="font-size:10px;color:#3a3758;text-transform:uppercase;">Price</div><div style="font-size:14px;font-weight:600;color:#f0eeff;">$${Math.round(d.purchase_price / 1000)}K</div></div>
          <div><div style="font-size:10px;color:#3a3758;text-transform:uppercase;">Cap Rate</div><div style="font-size:14px;font-weight:600;color:#7F77DD;">${d.cap_rate?.toFixed(1) || '—'}%</div></div>
          <div><div style="font-size:10px;color:#3a3758;text-transform:uppercase;">CoC</div><div style="font-size:14px;font-weight:600;color:#7F77DD;">${d.coc?.toFixed(1) || '—'}%</div></div>
          <div><div style="font-size:10px;color:#3a3758;text-transform:uppercase;">CF/Mo</div><div style="font-size:14px;font-weight:600;color:${(d.monthly_cash_flow || 0) >= 0 ? '#1D9E75' : '#f09595'};">$${d.monthly_cash_flow?.toLocaleString() || '—'}</div></div>
        </div>
        ${d.ai_summary ? `<div style="font-size:13px;color:#9994b8;line-height:1.5;margin-bottom:12px;">${d.ai_summary.slice(0, 200)}${d.ai_summary.length > 200 ? '...' : ''}</div>` : ''}
        ${d.listing_url ? `<a href="${d.listing_url}" style="display:inline-block;background:rgba(83,74,183,0.15);border:1px solid rgba(127,119,221,0.3);border-radius:8px;padding:7px 14px;font-size:12px;color:#9994b8;text-decoration:none;">View listing →</a>` : ''}
      </div>
    `).join('')

    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: 'Scout <kevin@dealsletter.io>',
      to: user.email,
      subject: `Scout found ${dealCount} deal${dealCount === 1 ? '' : 's'} tonight — top score ${topDeal.deal_score?.toFixed(1)}/10`,
      html: `
        <div style="background:#0d0d14;min-height:100vh;padding:40px 20px;font-family:-apple-system,sans-serif;">
          <div style="max-width:600px;margin:0 auto;">

            <div style="margin-bottom:32px;">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#534AB7;margin-bottom:8px;">DEALSLETTER SCOUT</div>
              <h1 style="font-size:28px;font-weight:700;color:#f0eeff;margin:0 0 10px;letter-spacing:-0.5px;">
                ${dealCount} deal${dealCount === 1 ? '' : 's'} found tonight
              </h1>
              <p style="font-size:15px;color:#6b6690;margin:0;line-height:1.6;">
                Scout scanned your target markets and ran full AI underwriting on the top candidates.
              </p>
            </div>

            ${dealCards}

            <div style="margin-top:24px;text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dealsletter.io'}/v3/scout"
                style="display:inline-block;background:#534AB7;color:#f0eeff;border-radius:10px;padding:13px 28px;font-size:15px;font-weight:600;text-decoration:none;">
                View all deals in Scout →
              </a>
            </div>

            <div style="margin-top:32px;padding-top:24px;border-top:1px solid rgba(127,119,221,0.1);text-align:center;font-size:12px;color:#3a3758;">
              Dealsletter Scout · Runs nightly at 2 AM PT<br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dealsletter.io'}/v3/profile" style="color:#534AB7;">Manage preferences</a>
            </div>
          </div>
        </div>
      `,
    })

    logger.info(`Scout email sent to ${user.email}`)
  } catch (err) {
    logger.error('Failed to send scout email:', err)
  }
}
