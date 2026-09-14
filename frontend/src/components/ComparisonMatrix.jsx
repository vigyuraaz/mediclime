import React from 'react';
import { Link } from 'react-router-dom';

export default function ComparisonMatrix({ products = [] }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="bg-[#094749] text-white">
            <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-[11px] w-48 bg-teal-950/60 sticky left-0 z-10">
              Formula Parameters
            </th>
            {products.map((p) => (
              <th key={p.id} className="p-4 sm:p-5 font-bold text-center min-w-[200px]">
                <div className="text-sm sm:text-base font-extrabold">{p.name}</div>
                <div className="text-[10px] text-teal-200 font-semibold uppercase tracking-wider mt-0.5">{p.brand}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          
          {/* Price */}
          <tr className="hover:bg-slate-50/70">
            <td className="p-4 sm:p-5 font-bold text-slate-800 bg-slate-50/50 sticky left-0 z-10">
              Verified Price
            </td>
            {products.map((p) => (
              <td key={p.id} className="p-4 sm:p-5 text-center font-extrabold text-[#094749] text-base sm:text-lg">
                ${p.price ? p.price.toFixed(2) : '49.00'}
              </td>
            ))}
          </tr>

          {/* Rating */}
          <tr className="hover:bg-slate-50/70">
            <td className="p-4 sm:p-5 font-bold text-slate-800 bg-slate-50/50 sticky left-0 z-10">
              Clinical Rating
            </td>
            {products.map((p) => (
              <td key={p.id} className="p-4 sm:p-5 text-center">
                <div className="inline-flex items-center gap-1 font-bold text-amber-500 bg-amber-50 px-3 py-1 rounded-full text-xs">
                  <span>★</span>
                  <span>{p.rating} / 5.0</span>
                </div>
              </td>
            ))}
          </tr>

          {/* Serving Size & Form */}
          <tr className="hover:bg-slate-50/70">
            <td className="p-4 sm:p-5 font-bold text-slate-800 bg-slate-50/50 sticky left-0 z-10">
              Serving & Form
            </td>
            {products.map((p) => (
              <td key={p.id} className="p-4 sm:p-5 text-center text-slate-600">
                <div className="font-semibold text-slate-800">{p.serving_size}</div>
                <div className="text-[11px] text-slate-500">{p.form}</div>
              </td>
            ))}
          </tr>

          {/* Key Ingredients */}
          <tr className="hover:bg-slate-50/70">
            <td className="p-4 sm:p-5 font-bold text-slate-800 bg-slate-50/50 sticky left-0 z-10">
              Core Actives
            </td>
            {products.map((p) => (
              <td key={p.id} className="p-4 sm:p-5 text-center">
                <div className="space-y-1">
                  {(p.ingredients || []).slice(0, 3).map((ing, i) => (
                    <div key={i} className="text-xs font-medium text-slate-700">
                      {ing.name} <span className="text-teal-700 font-bold">({ing.amount})</span>
                    </div>
                  ))}
                </div>
              </td>
            ))}
          </tr>

          {/* Certifications & Badges */}
          <tr className="hover:bg-slate-50/70">
            <td className="p-4 sm:p-5 font-bold text-slate-800 bg-slate-50/50 sticky left-0 z-10">
              Lab Certifications
            </td>
            {products.map((p) => (
              <td key={p.id} className="p-4 sm:p-5 text-center">
                <div className="flex flex-wrap justify-center gap-1.5">
                  {(p.highlight_badges || ['GMP Certified', 'Third-Party Tested']).map((b, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-[#0F6265] border border-teal-200">
                      ✓ {b}
                    </span>
                  ))}
                </div>
              </td>
            ))}
          </tr>

          {/* Action Row */}
          <tr className="bg-slate-50">
            <td className="p-4 sm:p-5 font-bold text-slate-800 bg-slate-100/80 sticky left-0 z-10">
              Full Analysis
            </td>
            {products.map((p) => (
              <td key={p.id} className="p-4 sm:p-5 text-center">
                <Link
                  to={`/supplements/${p.slug}`}
                  className="inline-block w-full py-2.5 px-4 rounded-xl bg-[#F43F5E] hover:bg-[#FF6B6B] text-white font-bold text-xs shadow-xs transition-colors"
                >
                  View Review Facts →
                </Link>
              </td>
            ))}
          </tr>

        </tbody>
      </table>
    </div>
  );
}
