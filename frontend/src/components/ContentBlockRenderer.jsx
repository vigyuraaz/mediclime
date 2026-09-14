import React from 'react';
import { renderMarkdown, renderInlineMarkdown } from '../utils/markdown';

export default function ContentBlockRenderer({ blocks = [] }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="article-content space-y-8 text-slate-700 leading-relaxed text-base font-sans">
      {blocks.map((block, index) => {
        const key = `block-${index}`;

        switch (block.type) {
          case 'heading': {
            const level = block.level || 2;
            const rawText = block.text || block.title || '';
            // Strip leading hashes (e.g. "## 1. Title" -> "1. Title")
            const cleanText = rawText.replace(/^#{1,6}\s+/, '').trim();

            if (level === 1) {
              return (
                <h1 key={key} className="text-3xl sm:text-4xl font-extrabold text-[#094749] tracking-tight font-sans mt-10 mb-4"
                    dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(cleanText) }}
                />
              );
            }
            if (level === 3) {
              return (
                <h3 key={key} className="text-xl font-bold text-[#094749] tracking-tight font-sans mt-8 mb-3"
                    dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(cleanText) }}
                />
              );
            }
            return (
              <h2 key={key} id={`section-${index}`} className="text-2xl sm:text-3xl font-extrabold text-[#094749] tracking-tight font-sans mt-12 mb-5 pb-3 border-b border-slate-200/80"
                  dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(cleanText) }}
              />
            );
          }

          case 'paragraph': {
            return (
              <div 
                key={key} 
                className="text-slate-700 leading-relaxed text-base sm:text-lg font-normal mb-6 prose prose-teal max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(block.text || '') }}
              />
            );
          }

          case 'callout': {
            const isWarning = block.variant === 'warning';
            return (
              <div
                key={key}
                className={`p-6 rounded-2xl border ${
                  isWarning
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                    : 'bg-teal-50/70 border-teal-200 text-[#063335]'
                } my-8 shadow-xs`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-xl ${isWarning ? 'bg-rose-100 text-rose-600' : 'bg-teal-100 text-teal-700'} shrink-0 mt-0.5`}>
                    {isWarning ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    {block.title && (
                      <h4 className="font-bold text-sm sm:text-base uppercase tracking-wider mb-1 font-sans"
                          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(block.title) }}
                      />
                    )}
                    <div 
                      className="text-sm sm:text-base leading-relaxed font-normal opacity-90 prose prose-teal max-w-none"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(block.text || block.content || '') }}
                    />
                  </div>
                </div>
              </div>
            );
          }

          case 'nutrient_card': {
            const item = block.data || block;
            return (
              <div key={key} className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all my-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <h4 className="text-lg font-bold text-[#094749] font-sans">
                    {item.name}
                  </h4>
                  {item.grade && (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-teal-50 border border-teal-200 text-[#0F6265] uppercase tracking-wider">
                      {item.grade}
                    </span>
                  )}
                </div>
                <div 
                  className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4 prose prose-teal max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(item.description || '') }}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                  {item.mechanism && (
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-0.5">Mechanism of Action</span>
                      <span className="font-semibold text-slate-800" dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(item.mechanism) }} />
                    </div>
                  )}
                  {item.dosage && (
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-0.5">Clinical Researched Dosage</span>
                      <span className="font-semibold text-slate-800" dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(item.dosage) }} />
                    </div>
                  )}
                </div>
              </div>
            );
          }

          case 'pull_quote': {
            return (
              <figure key={key} className="my-10 p-8 rounded-2xl bg-gradient-to-r from-teal-900 to-[#0F6265] text-white shadow-md">
                <blockquote 
                  className="font-serif italic text-lg sm:text-xl md:text-2xl leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(block.text || block.quote || '') }}
                />
                {block.caption && (
                  <figcaption className="mt-4 text-xs uppercase tracking-widest text-teal-200 font-bold font-sans">
                    — {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          case 'image': {
            return (
              <figure key={key} className="my-8 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={block.url || block.src}
                  alt={block.alt || block.caption || "Clinical medical illustration"}
                  className="w-full max-h-[460px] object-cover"
                  loading="lazy"
                />
                {block.caption && (
                  <figcaption className="p-3 text-center text-xs text-slate-500 font-medium italic">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          case 'table': {
            const headers = block.headers || [];
            const rows = block.rows || [];
            return (
              <div key={key} className="my-8 overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
                <table className="w-full text-left text-sm border-collapse">
                  {headers.length > 0 && (
                    <thead className="bg-[#094749] text-white text-xs uppercase tracking-wider">
                      <tr>
                        {headers.map((h, hIdx) => (
                          <th key={hIdx} className="px-5 py-3.5 font-bold" dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(h) }} />
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {rows.map((r, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                        {r.map((c, cIdx) => (
                          <td key={cIdx} className="px-5 py-3.5 text-slate-700" dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(c) }} />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          default:
            if (block.text) {
              return (
                <div 
                  key={key} 
                  className="text-slate-700 leading-relaxed text-base mb-6 prose prose-teal max-w-none" 
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(block.text) }} 
                />
              );
            }
            return null;
        }
      })}
    </div>
  );
}
