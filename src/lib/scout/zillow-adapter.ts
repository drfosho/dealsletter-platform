const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!
const RAPIDAPI_HOST = process.env.RAPIDAPI_ZILLOW_HOST || 'zillow-property-data1.p.rapidapi.com'

export type ZillowProperty = {
  zpid: string
  address: string
  city: string
  state: string
  zipCode: string
  price: number
  bedrooms: number
  bathrooms: number
  livingArea: number
  lotSize: number | null
  yearBuilt: number | null
  propertyType: string
  daysOnMarket: number
  zestimate: number | null
  rentZestimate: number | null
  listingUrl: string
  latitude: number | null
  longitude: number | null
  homeStatus: string
  description: string | null
  photos: string[]
}

export async function searchZillowProperties(params: {
  city?: string
  zipCodes?: string[]
  maxPrice: number
  minBeds: number
  propertyTypes: string[]
  listingType?: 'sale' | 'fsbo' | 'all'
  maxItems?: number
}): Promise<ZillowProperty[]> {
  const results: ZillowProperty[] = []
  const listingType = params.listingType || 'sale'

  const searchTargets: Array<{ search?: string; zipcodes?: string[] }> = []

  if (params.city) {
    searchTargets.push({ search: params.city })
  }
  if (params.zipCodes && params.zipCodes.length > 0) {
    for (let i = 0; i < params.zipCodes.length; i += 5) {
      searchTargets.push({ zipcodes: params.zipCodes.slice(i, i + 5) })
    }
  }

  for (const target of searchTargets.slice(0, 3)) {
    try {
      // Temporarily strip filters and limit to 5 items to confirm the upstream
      // shape during integration. Restore once the response shape is verified.
      const body: Record<string, unknown> = {
        type: listingType,
        max_items: 5,
        filters: {},
      }

      if (target.search) body.search = target.search
      if (target.zipcodes) body.zipcodes = target.zipcodes

      const res = await fetch(
        `https://${RAPIDAPI_HOST}/v1/properties`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST,
          },
          body: JSON.stringify(body),
        }
      )

      console.log('[Zillow] Response status:', res.status)
      const rawText = await res.text()
      console.log('[Zillow] Raw response first 500 chars:', rawText.slice(0, 500))

      if (!res.ok) {
        console.error('[Zillow] Search failed:', res.status, rawText.slice(0, 500))
        continue
      }

      let data: any
      try {
        data = JSON.parse(rawText)
      } catch {
        console.error('[Zillow] Failed to parse response as JSON')
        continue
      }

      if (data.job_id) {
        const jobResults = await pollZillowJob(data.job_id)
        results.push(...jobResults)
      } else if (data.properties || data.results) {
        const props = data.properties || data.results || []
        results.push(...props.map(normalizeZillowProperty))
      }
    } catch (err) {
      console.error('[Zillow] Search error:', err)
    }
  }

  return results
}

async function pollZillowJob(jobId: string, maxAttempts = 10): Promise<ZillowProperty[]> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 3000))

    try {
      const res = await fetch(
        `https://${RAPIDAPI_HOST}/v1/results/${jobId}`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST,
          },
        }
      )

      if (!res.ok) continue
      const data = await res.json()

      if (data.status === 'complete' || data.properties || data.results) {
        const props = data.properties || data.results || []
        return props.map(normalizeZillowProperty)
      }
    } catch (err) {
      console.error('[Zillow] Poll error:', err)
    }
  }
  return []
}

function normalizeZillowProperty(raw: any): ZillowProperty {
  return {
    zpid: String(raw.zpid || raw.id || ''),
    address: raw.address?.streetAddress || raw.address || '',
    city: raw.address?.city || raw.city || '',
    state: raw.address?.state || raw.state || '',
    zipCode: raw.address?.zipcode || raw.zipCode || '',
    price: raw.price || raw.listingPrice || 0,
    bedrooms: raw.bedrooms || raw.beds || 0,
    bathrooms: raw.bathrooms || raw.baths || 0,
    livingArea: raw.livingArea || raw.sqft || 0,
    lotSize: raw.lotSize || null,
    yearBuilt: raw.yearBuilt || null,
    propertyType: raw.propertyType || raw.homeType || 'SingleFamily',
    daysOnMarket: raw.daysOnMarket || raw.timeOnZillow || 0,
    zestimate: raw.zestimate || null,
    rentZestimate: raw.rentZestimate || null,
    listingUrl: raw.url || raw.listingUrl ||
      (raw.zpid ? `https://www.zillow.com/homedetails/${raw.zpid}_zpid/` : ''),
    latitude: raw.latitude || raw.lat || null,
    longitude: raw.longitude || raw.lng || null,
    homeStatus: raw.homeStatus || raw.status || 'FOR_SALE',
    description: raw.description || null,
    photos: raw.photos || raw.images || [],
  }
}
