import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/v2/analyze',
        '/v2/dashboard',
        '/v2/account',
        '/api/',
      ],
    },
    sitemap: 'https://dealsletter.io/sitemap.xml',
  }
}
