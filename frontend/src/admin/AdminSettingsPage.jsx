import React, { useState, useEffect } from 'react';
import { getAdminSettings, updateAdminSettings } from '../api/settings';
import { useSiteSettings } from '../context/SiteContext';
import { uploadMediaFile } from '../api/adminServices';

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

export default function AdminSettingsPage() {
  const { settings: globalSettings, setLocalSettings, reloadSettings } = useSiteSettings();

  const [activeTab, setActiveTab] = useState('branding');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    site_name: '',
    site_name_highlight: '',
    site_tagline: '',
    site_description: '',
    logo_url: '',
    favicon_url: '',
    announcement_enabled: true,
    announcement_text: '',
    default_meta_title: '',
    default_meta_description: '',
    default_meta_keywords: '',
    google_search_console_verification: '',
    bing_webmaster_verification: '',
    contact_email: '',
    contact_phone: '',
    footer_copyright: '',
    social_twitter: '',
    social_facebook: '',
    social_instagram: '',
    social_youtube: '',
    social_linkedin: '',
    primary_color: '#094749',
    accent_color: '#F43F5E',
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await getAdminSettings();
        if (data) {
          setForm({
            site_name: data.site_name || '',
            site_name_highlight: data.site_name_highlight || '',
            site_tagline: data.site_tagline || '',
            site_description: data.site_description || '',
            logo_url: data.logo_url || '',
            favicon_url: data.favicon_url || '',
            announcement_enabled: data.announcement_enabled ?? true,
            announcement_text: data.announcement_text || '',
            default_meta_title: data.default_meta_title || '',
            default_meta_description: data.default_meta_description || '',
            default_meta_keywords: data.default_meta_keywords || '',
            google_search_console_verification: data.google_search_console_verification || '',
            bing_webmaster_verification: data.bing_webmaster_verification || '',
            contact_email: data.contact_email || '',
            contact_phone: data.contact_phone || '',
            footer_copyright: data.footer_copyright || '',
            social_twitter: data.social_twitter || '',
            social_facebook: data.social_facebook || '',
            social_instagram: data.social_instagram || '',
            social_youtube: data.social_youtube || '',
            social_linkedin: data.social_linkedin || '',
            primary_color: data.primary_color || '#094749',
            accent_color: data.accent_color || '#F43F5E',
          });
        }

      } catch (err) {
        console.warn('Failed to fetch admin settings, falling back to global context:', err);
        setForm(prev => ({ ...prev, ...globalSettings }));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [globalSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'logo_url') setUploadingLogo(true);
    else setUploadingFavicon(true);

    try {
      const res = await uploadMediaFile(file);
      if (res && res.url) {
        setForm(prev => ({ ...prev, [field]: res.url }));
        setMsg({ type: 'success', text: `${field === 'logo_url' ? 'Logo' : 'Favicon'} uploaded successfully!` });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Upload failed: ' + (err.message || 'Error') });
    } finally {
      if (field === 'logo_url') setUploadingLogo(false);
      else setUploadingFavicon(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      const updated = await updateAdminSettings(form);
      setLocalSettings(updated);
      await reloadSettings();
      setMsg({ type: 'success', text: 'Website settings saved and applied platform-wide!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update website settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-bold">
        Loading site configuration...
      </div>
    );
  }

  // Calculate brand prefix without highlight word
  const brandName = form.site_name || 'Mediclime';
  const highlight = form.site_name_highlight || '';
  const prefixName = highlight && brandName.toLowerCase().endsWith(highlight.toLowerCase())
    ? brandName.slice(0, brandName.length - highlight.length)
    : brandName;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-[#0F6265] text-xs font-bold uppercase tracking-wider mb-2">
            <span>⚙️</span> Plug & Play Control Center
          </div>
          <h1 className="text-3xl font-extrabold text-[#094749] tracking-tight">
            Site Settings & White-Label Cloning
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Customize branding, logos, announcements, and SEO defaults to rebrand or clone this website instantly.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-[#0F6265] hover:bg-[#094749] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Applying Changes...</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span>Save & Apply Settings</span>
            </>
          )}
        </button>
      </div>

      {/* Notifications */}
      {msg.text && (
        <div className={`p-4 rounded-xl text-xs font-bold border flex items-center justify-between ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <span>{msg.type === 'success' ? '✓ ' : '✕ '}{msg.text}</span>
          <button onClick={() => setMsg({ type: '', text: '' })} className="hover:opacity-75">✕</button>
        </div>
      )}

      {/* Live Branding Preview Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
            👁️ Live Platform Header & Banner Preview
          </span>
          <span className="text-[10px] bg-white/10 px-2.5 py-0.5 rounded-full text-slate-300">
            Real-time reflection
          </span>
        </div>

        {/* Preview Top Banner */}
        {form.announcement_enabled && (
          <div className="bg-[#094749] text-white text-xs py-2 px-4 rounded-xl text-center font-medium tracking-wide flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{form.announcement_text || 'Announcement Banner Active'}</span>
          </div>
        )}

        {/* Preview Header Navbar */}
        <div className="bg-white text-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            {form.logo_url ? (
              <img src={form.logo_url} alt="Logo" className="h-10 max-w-[160px] object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#094749] to-teal-500 flex items-center justify-center text-white shadow-sm">
                <span className="font-bold text-lg">{brandName[0] || 'M'}</span>
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-baseline">
                <span className="text-2xl font-extrabold tracking-tight text-[#094749]">{prefixName}</span>
                {highlight && <span className="text-2xl font-extrabold tracking-tight text-[#f43f5e]">{highlight}</span>}
              </div>
              <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400 -mt-0.5">
                {form.site_tagline || 'Tagline Goes Here'}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-xs font-bold text-slate-600">
            <span className="text-[#094749] border-b-2 border-[#094749] pb-0.5">Health Articles</span>
            <span>Supplements</span>
            <span>Comparisons</span>
            <span>Medical Board</span>
          </div>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        {[
          { id: 'branding', label: '🏷️ Brand & Identity' },
          { id: 'announcement', label: '📢 Announcement Bar' },
          { id: 'seo', label: '🔍 Global SEO & Meta' },
          { id: 'contact', label: '📞 Contact & Footer' },
          { id: 'social', label: '🌐 Social Links' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#0F6265] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Brand & Identity */}
      {activeTab === 'branding' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-[#094749]">Brand Identity & Visual Assets</h2>
            <p className="text-xs text-slate-500">Define the main brand name, tagline, and corporate logo.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Website Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="site_name"
                value={form.site_name}
                onChange={handleChange}
                placeholder="e.g. Mediclime"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#0F6265]"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">The primary name shown across the site and page titles.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Highlighted Word / Accent
              </label>
              <input
                type="text"
                name="site_name_highlight"
                value={form.site_name_highlight}
                onChange={handleChange}
                placeholder="e.g. clime (in medi+clime)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#0F6265]"
              />
              <p className="text-[10px] text-slate-400 mt-1">Word part rendered in vibrant coral in the logo.</p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Website Tagline / Slogan
              </label>
              <input
                type="text"
                name="site_tagline"
                value={form.site_tagline}
                onChange={handleChange}
                placeholder="e.g. Evidence-Led Health"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#0F6265]"
              />
              <p className="text-[10px] text-slate-400 mt-1">Displayed directly below the logo in header and footer.</p>
            </div>

            {/* Custom Logo Upload & URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Custom Logo URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  name="logo_url"
                  value={form.logo_url}
                  onChange={handleChange}
                  placeholder="https://... or upload below"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#0F6265]"
                />
                <label className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors whitespace-nowrap">
                  {uploadingLogo ? 'Uploading...' : '📁 Browse'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'logo_url')} />
                </label>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Transparent PNG/SVG recommended (approx. 200x50px).</p>
            </div>

            {/* Custom Favicon Upload & URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Custom Favicon URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  name="favicon_url"
                  value={form.favicon_url}
                  onChange={handleChange}
                  placeholder="https://... or upload below"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#0F6265]"
                />
                <label className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors whitespace-nowrap">
                  {uploadingFavicon ? 'Uploading...' : '📁 Browse'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'favicon_url')} />
                </label>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Square PNG or ICO (32x32px or 64x64px).</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Announcement Bar */}
      {activeTab === 'announcement' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-[#094749]">Top Announcement Notice</h2>
            <p className="text-xs text-slate-500">Configure the top notification banner appearing above the header.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="announcement_enabled"
                name="announcement_enabled"
                checked={form.announcement_enabled}
                onChange={handleChange}
                className="w-5 h-5 accent-[#0F6265] rounded-md cursor-pointer"
              />
              <label htmlFor="announcement_enabled" className="text-xs font-bold text-slate-800 cursor-pointer">
                Display Announcement Banner on Public Pages
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Banner Message Text
              </label>
              <input
                type="text"
                name="announcement_text"
                value={form.announcement_text}
                onChange={handleChange}
                placeholder="e.g. Clinical Evidence-First Editorial • Updated Medical Research 2026"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#0F6265]"
              />
              <p className="text-[10px] text-slate-400 mt-1">Highlighted text with an animated pulse indicator.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Global SEO & Meta Defaults */}
      {activeTab === 'seo' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-[#094749]">Global Search Engine Optimization (SEO)</h2>
            <p className="text-xs text-slate-500">Fallback metadata injected into HTML &lt;head&gt; tags.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Default Meta Title
              </label>
              <input
                type="text"
                name="default_meta_title"
                value={form.default_meta_title}
                onChange={handleChange}
                placeholder="e.g. Mediclime — Evidence-Based Health & Supplement Reviews"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#0F6265]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Default Meta Description
              </label>
              <textarea
                name="default_meta_description"
                rows={3}
                value={form.default_meta_description}
                onChange={handleChange}
                placeholder="Search engine meta description..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#0F6265]"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Default Meta Keywords
              </label>
              <input
                type="text"
                name="default_meta_keywords"
                value={form.default_meta_keywords}
                onChange={handleChange}
                placeholder="e.g. medical blog, health guides, supplements, clinical nutrition, neuropathy"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#0F6265]"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Comma-separated keywords injected into &lt;meta name="keywords"&gt; on homepage and default routes.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-4">
              {/* Google Search Console */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Google Search Console Verification (HTML Tag / TXT)</span>
                  <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-md">Google SEO</span>
                </label>
                <input
                  type="text"
                  name="google_search_console_verification"
                  value={form.google_search_console_verification || ''}
                  onChange={handleChange}
                  placeholder='e.g. <meta name="google-site-verification" content="PkSVx42UE7D5..." /> or token'
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-[#0F6265]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Paste your Google Search Console verification HTML meta tag, TXT record string, or token.
                </p>
                {extractGoogleToken(form.google_search_console_verification) && (
                  <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-emerald-700">✓ Parsed Verification Token:</span>
                    <code className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-900">
                      {extractGoogleToken(form.google_search_console_verification)}
                    </code>
                  </div>
                )}
              </div>

              {/* Bing Webmaster Tools */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Bing Webmaster Tools Verification (HTML Tag / XML / Code)</span>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">Bing & Yahoo SEO</span>
                </label>
                <input
                  type="text"
                  name="bing_webmaster_verification"
                  value={form.bing_webmaster_verification || ''}
                  onChange={handleChange}
                  placeholder='e.g. <meta name="msvalidate.01" content="ABCDEF123456789..." /> or token or XML'
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-[#0F6265]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Paste your Bing Webmaster Tools HTML meta tag (&lt;meta name="msvalidate.01" ...&gt;), XML code, or verification token. Automatically served across &lt;head&gt; and /BingSiteAuth.xml.
                </p>
                {extractBingToken(form.bing_webmaster_verification) && (
                  <div className="mt-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-800 flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-blue-700">✓ Parsed Verification Token:</span>
                    <code className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-blue-300 text-blue-900">
                      {extractBingToken(form.bing_webmaster_verification)}
                    </code>
                  </div>
                )}
              </div>

              {/* Informational Callout for Vercel Static Verification */}
              <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-[#094749] flex items-center gap-1.5 text-[11px]">
                  <span>💡</span>
                  <span>Vercel / Search Engine Bot Notice</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Google and Bing verification crawlers do not execute JavaScript; they read your site's initial static HTML.
                  Your verification tags are active dynamically across all routes and pre-baked into your production HTML build so Google and Bing verify immediately on Vercel.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Tab 4: Contact & Footer */}
      {activeTab === 'contact' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-[#094749]">Contact Information & Footer Details</h2>
            <p className="text-xs text-slate-500">Customize the footer company notice, support contact, and mission statement.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Support / Contact Email</label>
              <input
                type="email"
                name="contact_email"
                value={form.contact_email}
                onChange={handleChange}
                placeholder="support@mediclime.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#0F6265]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Support Phone</label>
              <input
                type="text"
                name="contact_phone"
                value={form.contact_phone}
                onChange={handleChange}
                placeholder="+1 (800) 555-0199"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#0F6265]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Footer Copyright Notice</label>
              <input
                type="text"
                name="footer_copyright"
                value={form.footer_copyright}
                onChange={handleChange}
                placeholder="e.g. Mediclime Clinical Publishing Group. All rights reserved."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#0F6265]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Footer About / Mission Summary</label>
              <textarea
                name="site_description"
                rows={3}
                value={form.site_description}
                onChange={handleChange}
                placeholder="Brief 2-sentence summary of the platform displayed in the footer column..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#0F6265]"
              ></textarea>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Social Links */}
      {activeTab === 'social' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-[#094749]">Social Media Channels</h2>
            <p className="text-xs text-slate-500">Provide profile links to display in the footer and contact sections.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Twitter / X URL</label>
              <input
                type="url"
                name="social_twitter"
                value={form.social_twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#0F6265]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Facebook URL</label>
              <input
                type="url"
                name="social_facebook"
                value={form.social_facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#0F6265]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Instagram URL</label>
              <input
                type="url"
                name="social_instagram"
                value={form.social_instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#0F6265]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">YouTube URL</label>
              <input
                type="url"
                name="social_youtube"
                value={form.social_youtube}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#0F6265]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn URL</label>
              <input
                type="url"
                name="social_linkedin"
                value={form.social_linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#0F6265]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Save Action Bar */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3.5 rounded-xl bg-[#0F6265] hover:bg-[#094749] text-white font-bold text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Applying Settings...' : 'Save & Apply All Website Settings'}
        </button>
      </div>

    </div>
  );
}
