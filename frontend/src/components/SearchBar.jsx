import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { searchAll } from '../api/publicData';

export default function SearchBar({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchAll(query);
        setResults(res.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medical guides, supplements, health hubs, or physicians..."
            className="w-full text-base font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden"
          />
          <button
            onClick={() => onClose(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xs font-bold"
          >
            ESC
          </button>
        </div>

        {/* Results Box */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400">
              Searching peer-reviewed database...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching clinical articles or supplements found for "{query}".
            </div>
          )}

          {!loading && !query && (
            <div className="py-6 text-center text-xs text-slate-400">
              Type keywords like <span className="font-semibold text-teal-700">neuropathy</span>, <span className="font-semibold text-teal-700">arialief</span>, <span className="font-semibold text-teal-700">magnesium</span>, or <span className="font-semibold text-teal-700">sleep</span>.
            </div>
          )}

          {!loading && results.map((item, idx) => (
            <Link
              key={idx}
              to={item.url}
              onClick={() => onClose(false)}
              className="flex items-start justify-between p-3 rounded-xl hover:bg-teal-50/60 transition-colors group"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F43F5E] block mb-0.5">
                  {item.badge || item.type}
                </span>
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#0F6265] transition-colors">
                  {item.title}
                </h4>
                {item.excerpt && (
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.excerpt}</p>
                )}
              </div>
              <span className="text-slate-400 group-hover:text-[#0F6265] text-xs font-bold pl-3">
                →
              </span>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
