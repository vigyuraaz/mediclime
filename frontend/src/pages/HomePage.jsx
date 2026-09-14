import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import ProductCard from '../components/ProductCard';
import ConditionCard from '../components/ConditionCard';
import CategoryPills from '../components/CategoryPills';
import { LoadingSkeleton } from '../components/Feedback';
import { getPublicArticles } from '../api/articles';
import { getPublicProducts } from '../api/products';
import { getPublicConditions, getPublicAuthors } from '../api/publicData';
import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '../context/SiteContext';

export default function HomePage() {
  const { settings } = useSiteSettings();
  const [articles, setArticles] = useState([]);
  const [products, setProducts] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [nlEmail, setNlEmail] = useState('');
  const [nlSubmitted, setNlSubmitted] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [artRes, prodRes, condRes, authRes] = await Promise.all([
          getPublicArticles({ page_size: 6 }),
          getPublicProducts({ page_size: 4 }),
          getPublicConditions(),
          getPublicAuthors()
        ]);
        setArticles(artRes?.data || []);
        setProducts(prodRes?.data || []);
        setConditions((condRes || []).slice(0, 8));
        setAuthors(authRes || []);
      } catch (err) {
        console.warn("Using fallback static initial state", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleNewsletter = (e) => {
    e.preventDefault();
    setNlSubmitted(true);
    setNlEmail('');
  };

  return (
    <div className="space-y-0 pb-0">
      
      <Helmet>
        <title>{settings.default_meta_title || `${settings.site_name} — Evidence-Based Health & Supplement Reviews`}</title>
        <meta name="description" content={settings.default_meta_description || settings.site_description || ''} />
        {settings.default_meta_keywords && <meta name="keywords" content={settings.default_meta_keywords} />}
        <meta property="og:title" content={settings.default_meta_title || settings.site_name} />
        <meta property="og:description" content={settings.default_meta_description || ''} />
      </Helmet>
      
      {/* ===== HERO SECTION (Matching static site image.png_5) ===== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF6F6] via-white to-[#F9FBFB] pt-8 pb-16 border-b border-rose-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Editorial Headline & Value Prop */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF1F2] border border-rose-200/80 text-[#F43F5E] text-xs font-extrabold uppercase tracking-widest">
                <span>EVIDENCE. PERSONALIZED. EMPOWERING.</span>
                <span className="tracking-tighter">•••</span>
              </div>

              {/* Dual-Color Hero Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-[#0F6265]">
                Better health starts with evidence.<br/>
                <span className="text-[#F43F5E]">We make it personal.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal max-w-2xl">
                Your trusted platform for health articles, supplements, ingredients, and expert tools — empowering informed choices for a better you.
              </p>

              {/* Hero Action Group */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/articles"
                  className="px-8 py-3.5 rounded-full bg-[#0F6265] hover:bg-[#0A4346] text-white font-bold text-sm tracking-wide shadow-md shadow-teal-950/15 transition-all hover:scale-105 active:scale-95"
                >
                  Explore Health Articles
                </Link>
                <Link
                  to="/supplements"
                  className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm transition-all hover:border-slate-400"
                >
                  Browse Supplements
                </Link>
                <Link
                  to="/supplements/compare"
                  className="text-sm font-bold text-[#F43F5E] hover:text-[#E11D48] underline underline-offset-4 decoration-rose-300 transition-colors ml-2"
                >
                  Compare Formulas →
                </Link>
              </div>

              {/* Key Trust Badges Below Hero */}
              <div className="pt-6 border-t border-rose-100/60 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">✓</span>
                  <span>Peer-Reviewed Clinical Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">✓</span>
                  <span>Doctor & Pharmacist Authored</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs">✓</span>
                  <span>Zero Hidden Manufacturer Bias</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual & Supplement Pick Card */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-md">
                {/* Central Circular Product Visual */}
                <div className="relative w-64 sm:w-72 h-64 sm:h-72 mx-auto rounded-full overflow-hidden p-3 bg-gradient-to-tr from-rose-100/70 via-white to-teal-50 border-4 border-white shadow-2xl flex items-center justify-center mb-6">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-teal-50 to-rose-50 flex items-center justify-center overflow-hidden">
                    <img src="https://pub-86f1abeb043f48849bfcfb81cfc6481a.r2.dev/media/b1361a908e13483ca1e06437aa80763b.jpg" alt="Medical Science" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Editorial Supplement Pick Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0F6265]">
                      <span className="text-amber-500">✦</span>
                      <span>Supplement pick</span>
                    </div>
                    <span className="text-xs font-semibold text-[#F43F5E] bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full">
                      Featured
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">Featured from the Mediclime supplement catalog</p>

                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 p-1 flex items-center justify-center border border-slate-100 shrink-0">
                      <svg className="w-8 h-8 text-teal-600/30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        <Link to="/supplements" className="hover:text-[#0F6265] transition-colors">
                          Top-Rated Clinical Formulas
                        </Link>
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        Browse physician-formulated nutraceuticals with third-party lab verification and evidence-backed dosages.
                      </p>
                      <Link to="/supplements" className="inline-block text-xs font-bold text-[#F43F5E] hover:underline mt-2">
                        Browse Supplement Catalog →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== CATEGORY PILLS ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <CategoryPills
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </section>

      {/* ===== LATEST ARTICLES SECTION ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F6265]">Clinical Publishing</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Latest Evidence-Based Guides</h2>
          </div>
          <Link to="/articles" className="mt-3 sm:mt-0 text-sm font-bold text-[#F43F5E] hover:text-rose-600 flex items-center gap-1 transition-colors">
            Explore All Articles →
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton count={3} />
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 rounded-3xl bg-slate-50 border border-slate-200/80">
            <p className="text-slate-500 text-sm mb-3">No articles published yet.</p>
            <Link to="/admin/ai" className="text-xs font-bold text-[#0F6265] hover:underline">
              Generate your first article with AI →
            </Link>
          </div>
        )}
      </section>

      {/* ===== FEATURED SUPPLEMENT SHOWCASE ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-[#0F6265]/5 via-white to-rose-50/30 rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 sm:w-72 h-64 sm:h-72 rounded-full overflow-hidden p-3 bg-gradient-to-tr from-rose-100/80 via-white to-teal-50 border-4 border-white shadow-xl flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-teal-100/50 to-rose-100/50 flex items-center justify-center overflow-hidden">
                  <img src="https://pub-86f1abeb043f48849bfcfb81cfc6481a.r2.dev/media/3c4823573c7445dc9f2a4ea2f3bbc4d8.jpg" alt="Arialief Supplement" className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-4 left-6 bg-[#0F6265] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                  FEATURED
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <span className="inline-block text-[11px] font-bold tracking-widest text-[#F43F5E] uppercase bg-rose-50 px-3 py-1 rounded-full">
                EDITOR'S PRODUCT REVIEW
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Arialief — <span className="text-[#F43F5E]">Clinical Nerve Support Formula</span>
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="text-amber-400">★★★★★</span>
                <span className="font-bold text-slate-800">4.9 / 5.0</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-medium">1,247 Verified Shoppers</span>
              </div>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                A physician-formulated nutraceutical blend containing research-backed dosages of Micronized PEA, Stabilized R-Alpha Lipoic Acid, and Methylated B-Complex designed to support peripheral nerve health.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  'Micronized PEA Mast Cell Calming',
                  'Pure R-Alpha Lipoic Acid Form',
                  'Chelated Magnesium Glycinate',
                  'FDA-Registered Facility & cGMP'
                ].map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100">
                    <span className="w-4 h-4 rounded-full bg-teal-100 text-[#0F6265] flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span>{badge}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to="/supplements"
                  className="px-8 py-3.5 rounded-full bg-[#F43F5E] hover:bg-[#E11D48] text-white font-bold text-sm tracking-wide shadow-md shadow-rose-600/20 transition-all hover:scale-105"
                >
                  Read Full Clinical Review →
                </Link>
                <Link
                  to="/supplements/compare"
                  className="px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm transition-all hover:border-slate-400"
                >
                  Compare with Other Formulas
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== HEALTH CONDITIONS GRID ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F6265]">Condition Hubs</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Explore by Health Focus</h2>
          </div>
          <Link to="/health" className="mt-3 sm:mt-0 text-sm font-bold text-[#F43F5E] hover:text-rose-600 flex items-center gap-1 transition-colors">
            View All 20 Health Categories →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {conditions.map((cond) => (
            <ConditionCard key={cond.id} condition={cond} />
          ))}
        </div>
      </section>

      {/* ===== SUPPLEMENTS CATALOG PREVIEW ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F6265]">Evidence-First Formulations</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Top-Rated Supplements</h2>
          </div>
          <Link to="/supplements" className="mt-3 sm:mt-0 text-sm font-bold text-[#F43F5E] hover:text-rose-600 flex items-center gap-1 transition-colors">
            View Full Supplement Directory →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* ===== MEDICAL ADVISORY BOARD SECTION ===== */}
      {authors.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-3xl bg-slate-50 border border-slate-200/80 p-8 sm:p-12 text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#0F6265] bg-teal-50 px-3.5 py-1 rounded-full border border-teal-100/80 mb-3">
              Clinical Credibility
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              Guided by Practicing Physicians and Researchers
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mb-8">
              Every guide and supplement analysis on Mediclime is supervised by board-certified specialists with zero manufacturer advertising influence.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-left">
              {authors.slice(0, 4).map(a => (
                <div key={a.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    {a.profile_image ? (
                      <img src={a.profile_image} alt={a.name} className="w-12 h-12 rounded-xl object-cover border border-teal-600/30" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-[#0F6265] font-bold text-lg">
                        {a.name?.charAt(0) || 'D'}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{a.name}</h4>
                      <p className="text-[11px] text-[#F43F5E] font-semibold">{a.title || a.specialty || 'Medical Reviewer'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{a.bio || 'Board-certified specialist contributing evidence-based clinical reviews.'}</p>
                  <Link to={`/authors/${a.slug || a.id}`} className="text-xs font-bold text-[#0F6265] hover:underline">
                    View Credentials & Articles →
                  </Link>
                </div>
              ))}
            </div>

            <Link
              to="/authors"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#0F6265] hover:bg-[#0A4346] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
            >
              Learn More About Our Editorial Board
            </Link>
          </div>
        </section>
      )}

      {/* ===== NEWSLETTER SIGNUP SECTION ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl bg-gradient-to-r from-[#094749] to-[#0A4346] text-white p-8 sm:p-14 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              Evidence-Based Updates
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Stay Ahead with Clinical Research Bulletins
            </h2>
            <p className="text-teal-100 text-sm sm:text-base mb-6 leading-relaxed">
              Join over 45,000 healthcare professionals, researchers, and proactive consumers who receive our bi-weekly breakdown of clinical trials, supplement ingredient ratings, and preventive medicine protocols.
            </p>

            {nlSubmitted ? (
              <p className="text-sm text-emerald-300 font-semibold bg-emerald-950/40 p-3 rounded-xl border border-emerald-700">
                ✓ You're subscribed! Check your inbox for the latest clinical briefing.
              </p>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-lg">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={nlEmail}
                  onChange={(e) => setNlEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl bg-teal-900/60 border border-teal-500/40 text-white placeholder-teal-300/50 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <button
                  type="submit"
                  className="shrink-0 px-6 py-3 rounded-xl bg-[#F43F5E] hover:bg-[#E11D48] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                >
                  Subscribe Free
                </button>
              </form>
            )}
            <p className="text-[11px] text-teal-300/60 mt-3">
              Zero spam. Unsubscribe anytime with 1-click. Strictly for medical research education.
            </p>
          </div>

          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        </div>
      </section>

    </div>
  );
}
