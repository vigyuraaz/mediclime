import React from 'react';
import { Link } from 'react-router-dom';

export default function ConditionCard({ condition }) {
  if (!condition) return null;

  return (
    <Link
      to={`/health/${condition.slug}`}
      className="group p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-teal-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between card-hover"
    >
      <div>
        <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F6265] mb-4 group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0F6265] transition-colors leading-snug font-sans mb-2">
          {condition.name}
        </h3>
        <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
          {condition.summary}
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#F43F5E] group-hover:translate-x-1 transition-transform">
        <span>Explore Condition Hub</span>
        <span>→</span>
      </div>
    </Link>
  );
}
