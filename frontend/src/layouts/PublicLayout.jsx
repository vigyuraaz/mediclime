import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import { useSiteSettings } from '../context/SiteContext';

export default function PublicLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { settings } = useSiteSettings();

  // Extract clean verification tokens
  const rawVerification = settings?.google_search_console_verification || '';
  const metaMatch = rawVerification.match(/content=["']([^"']+)["']/i);
  const verificationToken = metaMatch ? metaMatch[1].trim() : (
    rawVerification.toLowerCase().startsWith('google-site-verification=')
      ? rawVerification.slice('google-site-verification='.length).trim()
      : rawVerification.trim()
  );

  const rawBing = settings?.bing_webmaster_verification || '';
  const bingMetaMatch = rawBing.match(/content=["']([^"']+)["']/i);
  const bingXmlMatch = rawBing.match(/<user>([^<]+)<\/user>/i);
  const bingToken = bingMetaMatch ? bingMetaMatch[1].trim() : (
    bingXmlMatch ? bingXmlMatch[1].trim() : (
      rawBing.toLowerCase().startsWith('msvalidate.01=')
        ? rawBing.slice('msvalidate.01='.length).trim()
        : rawBing.trim()
    )
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFDFD] text-slate-800 antialiased font-sans">
      <Helmet>
        {verificationToken ? (
          <meta name="google-site-verification" content={verificationToken} />
        ) : null}
        {bingToken ? (
          <meta name="msvalidate.01" content={bingToken} />
        ) : null}
      </Helmet>
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <SearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

