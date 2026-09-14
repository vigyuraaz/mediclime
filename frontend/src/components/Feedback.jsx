import React from 'react';

export function LoadingSkeleton({ type = 'card', count = 3 }) {
  const items = Array.from({ length: count });

  if (type === 'article-detail') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-8">
        <div className="h-4 w-32 bg-slate-200 rounded"></div>
        <div className="h-10 w-3/4 bg-slate-200 rounded"></div>
        <div className="h-6 w-1/2 bg-slate-200 rounded"></div>
        <div className="h-96 w-full bg-slate-200 rounded-2xl"></div>
        <div className="space-y-4">
          <div className="h-4 w-full bg-slate-200 rounded"></div>
          <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
          <div className="h-4 w-4/6 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse">
          <div className="h-48 sm:h-52 w-full shrink-0 bg-slate-200 rounded-xl"></div>
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
          <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
          <div className="h-4 w-full bg-slate-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}

export function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const isError = type === 'error';
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className={`px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold text-white ${
        isError ? 'bg-rose-600' : 'bg-[#0F6265]'
      }`}>
        <span>{isError ? '✕' : '✓'}</span>
        <span>{message}</span>
        {onClose && (
          <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">
            ×
          </button>
        )}
      </div>
    </div>
  );
}
