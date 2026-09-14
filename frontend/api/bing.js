function extractBingToken(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  const metaMatch = trimmed.match(/content=["']([^"']+)["']/i);
  if (metaMatch && metaMatch[1]) return metaMatch[1].trim();
  const xmlMatch = trimmed.match(/<user>([^<]+)<\/user>/i);
  if (xmlMatch && xmlMatch[1]) return xmlMatch[1].trim();
  if (trimmed.toLowerCase().startsWith('msvalidate.01=')) {
    return trimmed.slice('msvalidate.01='.length).trim();
  }
  return trimmed;
}

function resolveApiBaseUrl(req) {
  let envUrl = process.env.VITE_API_URL || process.env.API_URL || process.env.BACKEND_URL || '';
  if (envUrl && envUrl.startsWith('http')) {
    return envUrl.replace(/\/+$/, '');
  }
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers['host'] || 'localhost:8000';
  const prefix = envUrl ? envUrl.replace(/\/+$/, '') : '/api/v1';
  return `${proto}://${host}${prefix}`;
}

export default async function handler(req, res) {
  let token = '';
  try {
    const baseUrl = resolveApiBaseUrl(req);
    const targetUrl = baseUrl.endsWith('/api/v1') 
      ? `${baseUrl}/public/settings` 
      : (baseUrl.includes('/api/v1') ? `${baseUrl}/public/settings` : `${baseUrl}/api/v1/public/settings`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const apiRes = await fetch(targetUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (apiRes.ok) {
      const data = await apiRes.json();
      const raw = data?.data?.bing_webmaster_verification || '';
      token = extractBingToken(raw);
    }
  } catch (err) {
    console.warn('[api/bing] Error resolving Bing token:', err.message);
  }

  const xml = `<?xml version="1.0"?>\n<users>\n\t<user>${token}</user>\n</users>\n`;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
  return res.status(200).send(xml);
}
