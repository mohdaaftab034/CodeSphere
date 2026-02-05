/**
 * Serverless function to generate sitemap.xml dynamically
 * Vercel automatically maps this to /api/sitemap endpoint
 */
export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Define your site URLs here
  const urls = [
    { loc: 'https://www.codespheres.tech/', changefreq: 'weekly', priority: '1.0' },
    { loc: 'https://www.codespheres.tech/notes', changefreq: 'daily', priority: '0.9' },
    { loc: 'https://www.codespheres.tech/interview-questions', changefreq: 'daily', priority: '0.9' },
    { loc: 'https://www.codespheres.tech/roadmaps', changefreq: 'weekly', priority: '0.8' },
    { loc: 'https://www.codespheres.tech/about', changefreq: 'monthly', priority: '0.7' },
  ];

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  // Set proper headers for XML sitemap
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, must-revalidate');
  res.status(200).send(sitemap);
}
