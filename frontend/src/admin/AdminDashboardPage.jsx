import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api/adminServices';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    total_articles: 0,
    published_articles: 0,
    draft_articles: 0,
    needs_review_articles: 0,
    total_products: 0,
    total_conditions: 0,
    total_authors: 0,
    total_ai_jobs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardStats();
        if (data) setStats(data);
      } catch (err) {
        console.warn("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = [
    { label: 'Published Articles', value: stats.published_articles, sub: `${stats.total_articles} Total in DB`, color: 'bg-teal-50 text-teal-800 border-teal-200' },
    { label: 'Drafts in Progress', value: stats.draft_articles, sub: 'Editable drafts', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    { label: 'Needs Review', value: stats.needs_review_articles, sub: 'Awaiting Medical Review', color: 'bg-rose-50 text-rose-800 border-rose-200' },
    { label: 'Supplement Reviews', value: stats.total_products, sub: 'Facts tables active', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    { label: 'Condition Hubs', value: stats.total_conditions, sub: '20 physiological hubs', color: 'bg-slate-50 text-slate-800 border-slate-200' },
    { label: 'AI Generation Jobs', value: stats.total_ai_jobs, sub: 'Processed via API/Gemini', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  ];

  return (
    <div className="space-y-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#094749] tracking-tight font-sans">
            Editorial CMS Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Clinical publication pipeline, medical review status, and AI generation metrics.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/admin/articles/new"
            className="px-4 py-2.5 rounded-xl bg-[#0F6265] hover:bg-[#094749] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>+</span> Write Article
          </Link>
          <Link
            to="/admin/ai"
            className="px-4 py-2.5 rounded-xl bg-[#F43F5E] hover:bg-[#FF6B6B] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>🤖</span> AI Article Generator
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((c, idx) => (
          <div key={idx} className={`p-6 rounded-2xl border ${c.color} shadow-2xs space-y-1`}>
            <span className="text-xs font-bold uppercase tracking-wider block opacity-75">{c.label}</span>
            <div className="text-3xl font-extrabold">{c.value}</div>
            <span className="text-[11px] font-medium block opacity-75">{c.sub}</span>
          </div>
        ))}
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/articles"
          className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-teal-400 hover:shadow-md transition-all group"
        >
          <div className="text-2xl mb-2">📝</div>
          <h3 className="text-base font-bold text-slate-800 group-hover:text-[#0F6265] transition-colors">
            Manage Medical Articles
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Edit content blocks, add clinical citations, update FAQs, and control publishing status.
          </p>
        </Link>

        <Link
          to="/admin/products"
          className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-teal-400 hover:shadow-md transition-all group"
        >
          <div className="text-2xl mb-2">💊</div>
          <h3 className="text-base font-bold text-slate-800 group-hover:text-[#0F6265] transition-colors">
            Manage Supplement Reviews
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Build Supplement Facts tables, update lab test badges, and configure dosages.
          </p>
        </Link>

        <Link
          to="/admin/api-keys"
          className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-teal-400 hover:shadow-md transition-all group"
        >
          <div className="text-2xl mb-2">🔑</div>
          <h3 className="text-base font-bold text-slate-800 group-hover:text-[#0F6265] transition-colors">
            External Automation API Keys
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Generate and manage permission keys for external Python article automation scripts.
          </p>
        </Link>
      </div>

    </div>
  );
}
