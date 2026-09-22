export default function robots() {
  const base = process.env.SITE_URL || 'https://bmgrammar.example';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/admin', '/api/', '/login', '/register', '/forgot-password', '/reset-password'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
