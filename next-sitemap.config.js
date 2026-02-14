/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://example.com',
  // CRA outputs to build/; next-sitemap expects Next.js manifests unless output is "export"
  output: 'export',
  sourceDir: 'build',
  outDir: 'build',
  // Routes from src/App.js (client-side routes – CRA only has index.html, so we list them explicitly)
  additionalPaths: async () => [
    { loc: '/', priority: 1, changefreq: 'daily' },
    { loc: '/login', priority: 0.8, changefreq: 'monthly' },
    { loc: '/register', priority: 0.8, changefreq: 'monthly' },
    { loc: '/fullchat', priority: 0.7, changefreq: 'daily' },
    { loc: '/edituserinfo', priority: 0.6, changefreq: 'monthly' },
  ],
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/', disallow: ['/admin'] },
    ],
  },
  generateIndexSitemap: false,
};
