import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  if (!product) return null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col h-full card-hover">
      
      {/* Product Image & Badges */}
      <Link to={`/supplements/${product.slug}`} className="block relative aspect-square p-6 bg-slate-50 flex items-center justify-center overflow-hidden">
        <img
          src={product.featured_image_url || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400"}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {product.highlight_badges?.[0] && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#0F6265] text-white shadow-xs">
              {product.highlight_badges[0]}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold text-teal-800 uppercase tracking-wider text-[10px]">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <span>★</span>
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal">({product.review_count || 120})</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0F6265] transition-colors leading-snug font-sans mb-2">
            <Link to={`/supplements/${product.slug}`}>
              {product.name}
            </Link>
          </h3>

          <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 mb-4">
            {product.short_description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Verified Price</span>
            <span className="text-xl font-extrabold text-[#094749]">
              ${product.price ? product.price.toFixed(2) : '49.00'}
            </span>
          </div>
          <Link
            to={`/supplements/${product.slug}`}
            className="px-4 py-2 rounded-xl bg-[#F43F5E] hover:bg-[#FF6B6B] text-white text-xs font-bold transition-colors shadow-xs"
          >
            Review Facts
          </Link>
        </div>
      </div>
    </div>
  );
}
