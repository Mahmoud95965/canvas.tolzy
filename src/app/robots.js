export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account/', '/api/'],
    },
    sitemap: 'https://tolzy.me/sitemap.xml',
  }
}
