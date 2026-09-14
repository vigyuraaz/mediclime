import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPublicSettings } from '../api/settings';

const DEFAULT_SETTINGS = {
  site_name: 'Mediclime',
  site_name_highlight: 'clime',
  site_tagline: 'Evidence-Led Health',
  site_description: 'Mediclime is an evidence-first medical publishing platform combining peer-reviewed clinical summaries, third-party verified nutraceutical facts, and daily therapeutic protocols.',
  logo_url: '',
  favicon_url: '',
  announcement_enabled: true,
  announcement_text: 'Clinical Evidence-First Editorial • Updated Medical Research 2026',
  default_meta_title: 'Mediclime — Evidence-Based Health & Supplement Reviews',
  default_meta_description: 'Evidence-based medical publishing platform providing peer-reviewed clinical guides, supplement facts, and therapeutic wellness protocols.',
  default_meta_keywords: 'medical blog, health guides, supplements, clinical nutrition, evidence-based wellness, neuropathy',
  google_search_console_verification: '',
  bing_webmaster_verification: '',
  contact_email: 'support@mediclime.com',
  contact_phone: '+1 (800) 555-0199',
  footer_copyright: 'Mediclime Clinical Publishing Group. All rights reserved.',
  social_twitter: 'https://twitter.com',
  social_facebook: 'https://facebook.com',
  social_instagram: 'https://instagram.com',
  social_youtube: 'https://youtube.com',
  social_linkedin: 'https://linkedin.com',
  primary_color: '#094749',
  accent_color: '#F43F5E',
};

// Clean and extract token from any verification format (HTML meta tag, TXT string, or raw token)
function extractGoogleVerificationToken(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  // If full meta tag pasted: <meta name="google-site-verification" content="XYZ" />
  const metaMatch = trimmed.match(/content=["']([^"']+)["']/i);
  if (metaMatch && metaMatch[1]) return metaMatch[1].trim();
  // If google-site-verification=XYZ
  if (trimmed.toLowerCase().startsWith('google-site-verification=')) {
    return trimmed.slice('google-site-verification='.length).trim();
  }
  return trimmed;
}

// Clean and extract token for Bing Webmaster Tools (meta tag, XML user tag, or raw code)
function extractBingVerificationToken(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  // If meta tag pasted: <meta name="msvalidate.01" content="XYZ" />
  const metaMatch = trimmed.match(/content=["']([^"']+)["']/i);
  if (metaMatch && metaMatch[1]) return metaMatch[1].trim();
  // If XML format: <user>XYZ</user>
  const xmlMatch = trimmed.match(/<user>([^<]+)<\/user>/i);
  if (xmlMatch && xmlMatch[1]) return xmlMatch[1].trim();
  // If msvalidate.01=XYZ
  if (trimmed.toLowerCase().startsWith('msvalidate.01=')) {
    return trimmed.slice('msvalidate.01='.length).trim();
  }
  return trimmed;
}

const SiteContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
  reloadSettings: async () => {},
  setLocalSettings: () => {},
});

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await getPublicSettings();
      if (data) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.warn('Using default site settings due to fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Update favicon if custom one is provided
  useEffect(() => {
    if (settings.favicon_url) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.favicon_url;
    }
  }, [settings.favicon_url]);

  // Inject/Update Google Search Console verification meta tag in head
  useEffect(() => {
    const token = extractGoogleVerificationToken(settings.google_search_console_verification);
    let meta = document.querySelector('meta[name="google-site-verification"]');
    if (token) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'google-site-verification');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', token);
    } else if (meta) {
      meta.remove();
    }
  }, [settings.google_search_console_verification]);

  // Inject/Update Bing Webmaster Tools verification meta tag in head
  useEffect(() => {
    const token = extractBingVerificationToken(settings.bing_webmaster_verification);
    let meta = document.querySelector('meta[name="msvalidate.01"]');
    if (token) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'msvalidate.01');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', token);
    } else if (meta) {
      meta.remove();
    }
  }, [settings.bing_webmaster_verification]);


  const setLocalSettings = useCallback((updated) => {
    setSettings(prev => ({ ...prev, ...updated }));
  }, []);

  return (
    <SiteContext.Provider value={{ settings, loading, reloadSettings: fetchSettings, setLocalSettings }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteProvider');
  }
  return context;
}
