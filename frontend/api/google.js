export default function handler(req, res) {
  // Extract token from query or URL
  const token = req.query.token || '';
  const filename = `google${token}.html`;
  const body = `google-site-verification: ${filename}\n`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.status(200).send(body);
}
