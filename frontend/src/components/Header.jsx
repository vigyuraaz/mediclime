import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteContext';

export default function Header({ onOpenSearch }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { settings } = useSiteSettings();

  const navLinks = [
    { label: 'Health Articles', path: '/articles' },
    { label: 'Supplements', path: '/supplements' },
    { label: 'Supplement Comparisons', path: '/supplements/compare' },
    { label: 'Health Conditions', path: '/health' },
    { label: 'Medical Board', path: '/authors' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const brandName = settings.site_name || 'Mediclime';
  const highlight = settings.site_name_highlight || '';
  const prefixName = highlight && brandName.toLowerCase().endsWith(highlight.toLowerCase())
    ? brandName.slice(0, brandName.length - highlight.length)
    : brandName;

  return (
    <>
      {/* Top Clinical Notification Banner */}
      {settings.announcement_enabled && (
        <div className="bg-[#094749] text-white text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{settings.announcement_text || 'Clinical Evidence-First Editorial • Updated Medical Research 2026'}</span>
        </div>
      )}

      {/* Main Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100/60 shadow-xs transition-shadow duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo — Dynamic Split Color or Custom Image */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-teal-600 rounded-lg p-1">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={brandName} className="h-10 max-w-[180px] object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#094749] to-teal-500 flex items-center justify-center text-white shadow-sm shadow-teal-900/10 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path className="text-rose-400" d="M19.5 4.5c0 7.18-5.82 13-13 13H4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-baseline">
                <span className="text-2xl font-extrabold tracking-tight text-[#094749]">{prefixName}</span>
                {highlight && <span className="text-2xl font-extrabold tracking-tight text-[#f43f5e]">{highlight}</span>}
              </div>
              <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400 -mt-1">
                {settings.site_tagline || 'Evidence-Led Health'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-slate-600">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-colors hover:text-[#094749] pb-1 ${
                  isActive(item.path)
                    ? 'text-[#094749] font-bold border-b-2 border-[#094749]'
                    : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Controls & Actions */}
          <div className="flex items-center gap-3">
            
            {/* Search Trigger Button */}
            <button
              onClick={onOpenSearch}
              type="button"
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#094749] hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Search articles and supplements"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>

            {/* Newsletter Action Button */}
            <Link
              to="/contact"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#094749] hover:bg-[#063335] rounded-full transition-all shadow-sm"
            >
              Get Newsletter
            </Link>

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle Navigation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/') && location.pathname === '/' ? 'bg-teal-50 text-[#0F6265]' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive(item.path)
                    ? 'bg-teal-50 text-[#0F6265]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              About Mediclime
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Contact
            </Link>
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl border border-teal-200 text-[#0F6265] bg-teal-50 text-xs font-bold"
              >
                CMS Admin Dashboard
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
