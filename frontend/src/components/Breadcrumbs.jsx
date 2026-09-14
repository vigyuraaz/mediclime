import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav aria-label="Breadcrumbs" className="bg-gradient-to-b from-rose-50/40 via-teal-50/10 to-transparent py-3.5 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center text-xs font-medium text-slate-500 space-x-2 overflow-x-auto whitespace-nowrap">
          <li>
            <Link to="/" className="hover:text-[#0F6265] transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </Link>
          </li>
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <React.Fragment key={idx}>
                <li className="text-slate-300">/</li>
                <li>
                  {isLast || !item.path ? (
                    <span className="text-[#094749] font-bold truncate max-w-xs sm:max-w-md inline-block">
                      {item.label}
                    </span>
                  ) : (
                    <Link to={item.path} className="hover:text-[#0F6265] transition-colors">
                      {item.label}
                    </Link>
                  )}
                </li>
              </React.Fragment>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
