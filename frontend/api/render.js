import { htmlTemplate } from './_template.js';

let cachedSettings = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 30000; // 30-second in-memory cache for ultra-fast TTFB

function extractGoogleToken(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  const metaMatch = trimmed.match(/content=["']([^"']+)["']/i);
  if (metaMatch && metaMatch[1]) return metaMatch[1].trim();
  if (trimmed.toLowerCase().startsWith('google-site-verification=')) {
    return trimmed.slice('google-site-verification='.length).trim();
  }
  return trimmed;
}

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
  
  // If relative or unset, construct from request headers
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers['host'] || 'localhost:8000';
  const prefix = envUrl ? envUrl.replace(/\/+$/, '') : '/api/v1';
  return `${proto}://${host}${prefix}`;
}

async function fetchPublicSettings(req) {
  const now = Date.now();
  if (cachedSettings && (now - lastFetchTime < CACHE_TTL_MS)) {
    return cachedSettings;
  }

  const baseUrl = resolveApiBaseUrl(req);
  const targetUrl = baseUrl.endsWith('/api/v1') 
    ? `${baseUrl}/public/settings` 
    : (baseUrl.includes('/api/v1') ? `${baseUrl}/public/settings` : `${baseUrl}/api/v1/public/settings`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      cachedSettings = data?.data || data;
      lastFetchTime = now;
      return cachedSettings;
    }
  } catch (err) {
    console.warn('[api/render] Fetching settings failed:', err.message);
  }

  return cachedSettings;
}

async function fetchItemData(baseUrl, endpoint) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const targetUrl = baseUrl.endsWith('/api/v1') 
      ? `${baseUrl}${endpoint}` 
      : (baseUrl.includes('/api/v1') ? `${baseUrl}${endpoint}` : `${baseUrl}/api/v1${endpoint}`);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const json = await res.json();
      return json?.data || json;
    }
  } catch (err) {
    // Fail silently to fallback
  }
  return null;
}

export default async function handler(req, res) {
  // Allow only GET / HEAD
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const baseUrl = resolveApiBaseUrl(req);
    const settings = await fetchPublicSettings(req);
    let html = htmlTemplate;

    // Determine requested route
    const rawUrl = req.url || '/';
    const cleanPath = rawUrl.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';

    let pageTitle = '';
    let pageDesc = '';
    let pageKeywords = '';
    let pageOgImage = '';

    const articleMatch = cleanPath.match(/^\/articles\/([a-zA-Z0-9_-]+)$/);
    const supplementMatch = cleanPath.match(/^\/supplements\/([a-zA-Z0-9_-]+)$/);

    if (articleMatch) {
      const slug = articleMatch[1];
      const article = await fetchItemData(baseUrl, `/public/articles/${slug}`);
      if (article) {
        pageTitle = article.seo_title
          ? (article.seo_title.toLowerCase().includes('mediclime') ? article.seo_title : `${article.seo_title} | Mediclime`)
          : `${article.title} | Mediclime`;
        pageDesc = article.seo_description || article.excerpt || article.subtitle || `Evidence-based clinical review of ${article.title} on Mediclime.`;
        pageKeywords = article.meta_keywords || `${article.title}, clinical review, medical guide, evidence-based medicine`;
        pageOgImage = article.og_image || article.featured_image_url || '';
      }
    } else if (supplementMatch) {
      const slug = supplementMatch[1];
      const product = await fetchItemData(baseUrl, `/public/products/${slug}`);
      if (product) {
        pageTitle = product.seo_title
          ? (product.seo_title.toLowerCase().includes('mediclime') ? product.seo_title : `${product.seo_title} | Mediclime`)
          : `${product.name} — ${product.brand} Review & Clinical Facts | Mediclime`;
        pageDesc = product.seo_description || product.short_description || `Independent clinical evaluation of ${product.name} by ${product.brand}.`;
        pageKeywords = product.meta_keywords || `${product.name}, ${product.brand}, supplements, nutraceuticals, ingredients`;
        pageOgImage = product.featured_image_url || '';
      }
    } else if (cleanPath === '/articles') {
      pageTitle = 'Health Articles & Clinical Medical Guides | Mediclime';
      pageDesc = 'Explore peer-reviewed health articles, clinical nutrition guides, and physician-reviewed protocols on Mediclime.';
      pageKeywords = 'health articles, clinical guides, medical reviews, evidence-based wellness';
    } else if (cleanPath === '/supplements') {
      pageTitle = 'Nutraceutical Directory & Supplement Audits | Mediclime';
      pageDesc = 'Independent clinical supplement evaluations, ingredient bioavailability breakdowns, and transparent third-party lab verification guides.';
      pageKeywords = 'supplements, nutraceutical directory, supplement reviews, lab tested vitamins';
    } else if (cleanPath === '/supplements/compare') {
      pageTitle = 'Interactive Supplement Comparison Matrix | Mediclime';
      pageDesc = 'Compare dietary supplements, bioactives, clinical dosages, lab certifications, and prices side-by-side with Mediclime.';
    } else if (cleanPath === '/health') {
      pageTitle = 'Health Condition Hubs & Clinical Wellness Guides | Mediclime';
      pageDesc = 'Explore clinical guides and evidence-backed lifestyle and nutrient recommendations across key health focus areas on Mediclime.';
    } else if (cleanPath === '/authors') {
      pageTitle = 'Medical Advisory Board & Clinical Authors | Mediclime';
      pageDesc = 'Meet the practicing physicians, neurologists, pharmacologists, and registered dietitians who write and peer-review all medical guides on Mediclime.';
    }

    // Default site fallbacks if specific page metadata was not populated
    if (!pageTitle) {
      pageTitle = settings?.default_meta_title || (settings?.site_name ? `${settings.site_name} — ${settings.site_tagline || 'Evidence-Led Health'}` : 'Mediclime — Evidence-Led Health');
    }
    if (!pageDesc) {
      pageDesc = settings?.default_meta_description || settings?.site_description || 'Mediclime is an evidence-first medical publishing platform combining peer-reviewed clinical summaries and supplement facts.';
    }
    if (!pageKeywords) {
      pageKeywords = settings?.default_meta_keywords || 'medical blog, health guides, supplements, clinical nutrition, evidence-based wellness';
    }

    // Apply verification tokens and favicon from settings
    if (settings) {
      const googleToken = extractGoogleToken(settings.google_search_console_verification);
      const bingToken = extractBingToken(settings.bing_webmaster_verification);

      if (googleToken) {
        if (html.includes('name="google-site-verification"')) {
          html = html.replace(
            /<meta name="google-site-verification"[^>]*>/i,
            `<meta name="google-site-verification" content="${googleToken}" />`
          );
        } else {
          html = html.replace('</head>', `    <meta name="google-site-verification" content="${googleToken}" />\n  </head>`);
        }
      }

      if (bingToken) {
        if (html.includes('name="msvalidate.01"')) {
          html = html.replace(
            /<meta name="msvalidate.01"[^>]*>/i,
            `<meta name="msvalidate.01" content="${bingToken}" />`
          );
        } else {
          html = html.replace('</head>', `    <meta name="msvalidate.01" content="${bingToken}" />\n  </head>`);
        }
      }

      if (settings.favicon_url) {
        html = html.replace(/<link rel="icon"[^>]*>/i, `<link rel="icon" href="${settings.favicon_url}" />`);
      }
    }

    // Inject Title, Meta Description, Keywords, and OpenGraph into HTML
    html = html.replace(/<title>.*?<\/title>/i, `<title>${pageTitle}</title>`);
    html = html.replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${pageDesc.replace(/"/g, '&quot;')}" />`);

    // Inject keywords meta tag
    if (html.includes('name="keywords"')) {
      html = html.replace(/<meta name="keywords"[^>]*>/i, `<meta name="keywords" content="${pageKeywords.replace(/"/g, '&quot;')}" />`);
    } else {
      html = html.replace('</head>', `    <meta name="keywords" content="${pageKeywords.replace(/"/g, '&quot;')}" />\n  </head>`);
    }

    // Inject OpenGraph / Twitter meta tags
    const extraMeta = `
    <meta property="og:title" content="${pageTitle.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${pageDesc.replace(/"/g, '&quot;')}" />
    ${pageOgImage ? `<meta property="og:image" content="${pageOgImage}" />` : ''}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${pageTitle.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${pageDesc.replace(/"/g, '&quot;')}" />
  `;
    html = html.replace('</head>', `${extraMeta}\n  </head>`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
    return res.status(200).send(html);
  } catch (err) {
    console.error('[api/render] Unexpected error:', err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(htmlTemplate);
  }
}
