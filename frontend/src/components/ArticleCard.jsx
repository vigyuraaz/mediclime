import React from 'react';
import { Link } from 'react-router-dom';

export default function ArticleCard({ article }) {
  if (!article) return null;

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col h-full card-hover">
      
      {/* Featured Image - standard fixed height & object-cover prevents image size/resolution from altering card dimensions */}
      <Link to={`/articles/${article.slug}`} className="block relative w-full h-48 sm:h-52 overflow-hidden bg-slate-100 shrink-0">
        <img
          src={article.featured_image_url || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600"}
          alt={article.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#0F6265] shadow-xs">
            {article.category?.name || 'Clinical Guide'}
          </span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-2.5">
            <span>{article.reading_time || '8 Min Read'}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-[#0F6265] font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Doctor Reviewed
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#0F6265] transition-colors leading-snug font-sans mb-3 line-clamp-2 min-h-[3.25rem]">
            <Link to={`/articles/${article.slug}`}>
              {article.title}
            </Link>
          </h3>

          <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-6 font-normal min-h-[4rem]">
            {article.excerpt || article.subtitle}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            {article.author?.profile_image && (
              <img
                src={article.author.profile_image}
                alt={article.author.name}
                className="w-7 h-7 rounded-full object-cover border border-teal-200"
              />
            )}
            <span className="font-semibold text-slate-800">
              {article.author?.name || 'Mediclime Board'}
            </span>
          </div>
          <Link
            to={`/articles/${article.slug}`}
            className="text-[#F43F5E] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 hover:text-[#E11D48]"
          >
            Read Guide →
          </Link>
        </div>
      </div>
    </article>
  );
}
