import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribeNewsletter } from '../api/publicData';
import { useSiteSettings } from '../context/SiteContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { settings } = useSiteSettings();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await subscribeNewsletter(email);
      setSubscribed(true);
      setEmail('');
    } catch {
      setSubscribed(true);
    }
  };

  const brandName = settings.site_name || 'Mediclime';
  const highlight = settings.site_name_highlight || '';
  const prefixName = highlight && brandName.toLowerCase().endsWith(highlight.toLowerCase())
    ? brandName.slice(0, brandName.length - highlight.length)
    : brandName;

  return (
    <footer className="bg-[#094749] text-slate-200 mt-auto pt-16 pb-12 border-t border-teal-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-teal-800/60">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt={brandName} className="h-10 max-w-[180px] object-contain rounded-lg bg-white/10 p-1" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#178589] to-teal-400 flex items-center justify-center text-white shadow-md">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
              )}
              <div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-extrabold text-white tracking-tight">{prefixName}</span>
                  {highlight && <span className="text-2xl font-extrabold text-[#FF6B6B] tracking-tight">{highlight}</span>}
                </div>
                <span className="text-[9px] uppercase tracking-widest text-teal-300 font-bold block -mt-0.5">
                  {settings.site_tagline || 'Evidence-Led Health'}
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              {settings.site_description || 'Mediclime is an evidence-first medical publishing platform combining peer-reviewed clinical summaries, third-party verified nutraceutical facts, and daily therapeutic protocols.'}
            </p>

            {/* Newsletter Form */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-200 mb-2">
                Join 45,000+ Healthcare Subscribers
              </h4>
              {subscribed ? (
                <p className="text-xs text-emerald-300 font-semibold bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800">
                  ✓ You are subscribed to weekly clinical research briefings.
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    required
                    placeholder="Enter physician/patient email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-teal-950/80 border border-teal-700/80 text-white placeholder-slate-400 text-xs focus:outline-hidden focus:border-rose-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#F43F5E] hover:bg-[#FF6B6B] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-200 mb-4">
              Clinical Guides
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li><Link to="/articles" className="hover:text-white transition-colors">All Medical Articles</Link></li>
              <li><Link to="/articles/understanding-peripheral-neuropathy" className="hover:text-white transition-colors">Peripheral Neuropathy</Link></li>
              <li><Link to="/health" className="hover:text-white transition-colors">20 Health Condition Hubs</Link></li>
              <li><Link to="/authors" className="hover:text-white transition-colors">Medical Advisory Board</Link></li>
            </ul>
          </div>

          {/* Supplements */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-200 mb-4">
              Supplements & Compare
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li><Link to="/supplements" className="hover:text-white transition-colors">Nutraceutical Directory</Link></li>
              <li><Link to="/supplements/arialief-neuropathy-pain-relief" className="hover:text-white transition-colors">Arialief Nerve Support</Link></li>
              <li><Link to="/supplements/compare" className="hover:text-white transition-colors">Interactive Formula Matrix</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Clinical FAQs</Link></li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-200 mb-4">
              Standards & Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li><Link to="/about" className="hover:text-white transition-colors">About Mediclime</Link></li>
              <li><Link to="/medical-disclaimer" className="hover:text-white transition-colors">Medical Disclaimer</Link></li>
              <li><Link to="/editorial-policy" className="hover:text-white transition-colors">Editorial & Review Policy</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Editorial Team</Link></li>
            </ul>
          </div>
        </div>

        {/* FDA Compliance & Medical Disclaimer Callout */}
        <div className="pt-8 pb-6 border-b border-teal-800/40 text-[11px] text-slate-400 leading-relaxed space-y-2">
          <p>
            <strong className="text-teal-200 font-semibold">FDA Compliance Notice:</strong> Statements made on this website regarding dietary supplements, vitamins, and herbal formulations have not been evaluated by the Food and Drug Administration (FDA). These products are not intended to diagnose, treat, cure, or prevent any disease.
          </p>
          <p>
            <strong className="text-teal-200 font-semibold">Medical Disclaimer:</strong> The content published by Mediclime is authored for educational and informational purposes only. It should never serve as a substitute for direct diagnosis or clinical treatment from a board-certified physician. Always consult your healthcare provider before beginning any nutraceutical regimen.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} {settings.footer_copyright || 'Mediclime Clinical Publishing Group. All rights reserved.'}</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-emerald-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Clinical System Active
            </span>
            <span>•</span>
            <Link to="/admin" className="text-slate-400 hover:text-white transition-colors">
              CMS Login
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
