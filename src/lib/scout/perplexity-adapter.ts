const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY!

export type PerplexityDeal = {
  address: string
  city: string
  state: string
  price: number | null
  description: string
  listingUrl: string
  source: string
}

export async function searchOffMarketDeals(params: {
  metro: string
  strategy: string
  maxPrice: number
  propertyTypes: string[]
}): Promise<PerplexityDeal[]> {
  const propertyTypeStr = params.propertyTypes.join(' or ')
  const strategyContext = {
    'BRRRR': 'distressed properties needing renovation, motivated sellers, below market value',
    'Fix & Flip': 'fixer-uppers, foreclosures, estate sales, properties needing cosmetic work',
    'Buy & Hold': 'rental properties, turnkey homes, multi-family properties',
    'House Hack': 'duplexes, triplexes, fourplexes, properties with ADUs or in-law suites',
  }[params.strategy] || 'investment properties'

  const prompt = `Find real estate investment deals in ${params.metro} that match these criteria:
- Property type: ${propertyTypeStr}
- Maximum price: $${params.maxPrice.toLocaleString()}
- Looking for: ${strategyContext}
- Sources: Zillow FSBO, Craigslist, Facebook Marketplace, local auction sites, ForSaleByOwner.com

For each property found, provide:
1. Full street address
2. City and state
3. Asking price
4. Brief description
5. Direct listing URL

Return as a JSON array with fields: address, city, state, price, description, listing_url, source
Return only valid JSON, no markdown.`

  try {
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a real estate deal finder. Search the web for investment properties and return results as clean JSON only. No markdown, no explanations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.1,
        search_recency_filter: 'week',
        return_citations: true,
      }),
    })

    if (!res.ok) {
      console.error('[Perplexity] Search failed:', res.status, await res.text())
      return []
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''

    const citations = data.citations || []

    let deals: any[] = []
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        deals = JSON.parse(jsonMatch[0])
      }
    } catch {
      console.error('[Perplexity] JSON parse failed, content:', content.slice(0, 200))
      return []
    }

    return deals.map((d: any, i: number) => ({
      address: d.address || '',
      city: d.city || params.metro.split(',')[0],
      state: d.state || params.metro.split(',')[1]?.trim() || '',
      price: d.price ? parseInt(String(d.price).replace(/[^0-9]/g, '')) : null,
      description: d.description || '',
      listingUrl: d.listing_url || citations[i] || '',
      source: d.source || 'Perplexity Search',
    })).filter((d: PerplexityDeal) => d.address && d.address.length > 5)
  } catch (err) {
    console.error('[Perplexity] Error:', err)
    return []
  }
}
