import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import ArticleCard from '../components/ArticleCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { LoadingSkeleton } from '../components/Feedback';
import { getPublicArticles } from '../api/articles';
import { getPublicCategories } from '../api/publicData';

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = {};
        if (selectedCatId) params.category_id = selectedCatId;
        if (search) params.search = search;

        const [artRes, catRes] = await Promise.all([
          getPublicArticles(params),
          getPublicCategories()
        ]);
        setArticles(artRes?.data || []);
        setCategories(catRes || []);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedCatId, search]);

  return (
    <div>
      <Helmet>
        <title>Health Articles & Clinical Medical Guides | Mediclime</title>
        <meta name="description" content="Explore peer-reviewed health articles, clinical nutrition guides, and physician-reviewed protocols on Mediclime." />
        <meta name="keywords" content="health articles, clinical guides, medical reviews, evidence-based wellness, nutrition, health research" />
        <meta property="og:title" content="Health Articles & Clinical Medical Guides | Mediclime" />
        <meta property="og:description" content="Explore peer-reviewed health articles, clinical nutrition guides, and physician-reviewed protocols on Mediclime." />
        <meta property="og:type" content="website" />
      </Helmet>

      <Breadcrumbs items={[{ label: 'Clinical Health Guides', path: '/articles' }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="max-w-3xl mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F43F5E]">
            Peer-Reviewed Medical Knowledge
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#094749] tracking-tight font-sans mt-2 mb-4">
            Evidence-Based Health Articles & Guides
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-serif italic">
            Rigorous reviews of human clinical trials, cellular physiology, and targeted nutraceutical protocols written by physicians and researchers.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-10 pb-6 border-b border-slate-200">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setSelectedCatId(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                !selectedCatId
                  ? 'bg-[#0F6265] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCatId(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedCatId === c.id
                    ? 'bg-[#0F6265] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Filter by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-teal-500"
            />
          </div>
        </div>

        {/* Article Grid */}
        {loading ? (
          <LoadingSkeleton count={6} />
        ) : articles.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            No medical articles found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
