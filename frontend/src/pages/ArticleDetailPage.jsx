import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import ContentBlockRenderer from '../components/ContentBlockRenderer';
import { LoadingSkeleton } from '../components/Feedback';
import { Helmet } from 'react-helmet-async';
import { getPublicArticleBySlug } from '../api/articles';
import ArticleCard from '../components/ArticleCard';
import { renderMarkdown, renderInlineMarkdown } from '../utils/markdown';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getPublicArticleBySlug(slug);
        setArticle(data);
      } catch (err) {
        console.warn("Failed to load article:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return <LoadingSkeleton type="article-detail" />;
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Article Not Found</h2>
        <p className="text-slate-600 mb-6">The requested clinical review could not be located or has been relocated.</p>
        <Link to="/articles" className="px-5 py-2.5 rounded-xl bg-[#0F6265] text-white font-bold text-xs">
          Return to Health Articles
        </Link>
      </div>
    );
  }

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const pageTitle = article.seo_title
    ? (article.seo_title.toLowerCase().includes('mediclime') ? article.seo_title : `${article.seo_title} | Mediclime`)
    : `${article.title} | Mediclime`;

  const pageDesc = article.seo_description || article.excerpt || article.subtitle || `${article.title} — Comprehensive evidence-based clinical guide and medical review on Mediclime.`;

  const pageKeywords = article.meta_keywords || [
    article.title,
    article.category?.name,
    'clinical review',
    'medical guide',
    'evidence-based medicine',
    'nutraceuticals',
    'health protocol'
  ].filter(Boolean).join(', ');

  const ogImage = article.og_image || article.featured_image_url || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600";

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Clinical Guides', path: '/articles' },
          { label: article.category?.name || 'Health', path: '/articles' },
          { label: article.title }
        ]}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDesc} />
          <meta name="keywords" content={pageKeywords} />
          {article.canonical_url && <link rel="canonical" href={article.canonical_url} />}
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDesc} />
          <meta property="og:type" content="article" />
          <meta property="og:image" content={ogImage} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={pageDesc} />
          <meta name="twitter:image" content={ogImage} />
        </Helmet>

        {/* Topic Pill & Reading Time */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-[#F43F5E] text-xs font-bold uppercase tracking-wider mb-6">
          <span className="w-2 h-2 rounded-full bg-[#F43F5E]"></span>
          {article.category?.name || 'Clinical Review'} • {article.reading_time || '8 Min Read'}
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#094749] tracking-tight leading-[1.18] mb-6 font-sans">
          {article.title}
        </h1>

        {/* Executive Subtitle */}
        {article.subtitle && (
          <p className="text-lg md:text-xl text-slate-600 font-normal leading-relaxed mb-8 font-serif italic">
            {article.subtitle}
          </p>
        )}

        {/* Medical Credential Byline & Fact Check Badge */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm mb-10">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {article.author && (
              <div className="flex items-center gap-3">
                {article.author.profile_image && (
                  <img
                    src={article.author.profile_image}
                    alt={article.author.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-teal-600/20"
                  />
                )}
                <div>
                  <p className="font-bold text-slate-800">
                    By <Link to={`/authors/${article.author.slug}`} className="hover:text-[#094749] underline decoration-teal-300">{article.author.name}</Link>
                  </p>
                  <p className="text-slate-500 text-xs">{article.author.professional_title}</p>
                </div>
              </div>
            )}

            {article.reviewer && (
              <>
                <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
                <div>
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Reviewed by</span>
                    <Link to={`/authors/${article.reviewer.slug}`} className="text-[#094749] hover:underline font-bold">
                      {article.reviewer.name}
                    </Link>
                  </p>
                  <p className="text-slate-500 text-xs">{article.reviewer.credentials || 'MD Medical Reviewer'}</p>
                </div>
              </>
            )}
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <span>✓</span>
            <span>Evidence-Based & Fact-Checked</span>
          </div>
        </div>

        {/* Executive Summary Callout Box */}
        {article.executive_summary && article.executive_summary.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-50/70 via-teal-50/40 to-white border border-rose-200/80 shadow-xs mb-12">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F43F5E] mb-4 flex items-center gap-2">
              <span>📋</span> Executive Clinical Summary
            </h3>
            <ul className="space-y-3.5 text-sm sm:text-base leading-relaxed text-slate-700">
              {article.executive_summary.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-[#F43F5E] font-bold mt-0.5">•</span>
                  <span>
                    <strong className="text-slate-900 font-bold">{item.bold} </strong>
                    <span dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(item.text) }} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Hero Image */}
        {article.featured_image_url && (
          <div className="mb-12 rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 aspect-16/9 bg-slate-100">
            <img
              src={article.featured_image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Structured Content Blocks */}
        <ContentBlockRenderer blocks={article.content_blocks || []} />

        {/* Structured FAQs Accordion */}
        {article.faqs && article.faqs.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-200">
            <h3 className="text-2xl font-extrabold text-[#094749] tracking-tight mb-6 font-sans">
              Frequently Asked Clinical Questions
            </h3>
            <div className="space-y-3">
              {article.faqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left font-bold text-slate-900 flex justify-between items-center hover:bg-slate-50 transition-colors text-sm sm:text-base"
                  >
                    <span>{faq.question}</span>
                    <span className="text-teal-700 font-extrabold text-lg">
                      {openFaqIndex === idx ? '−' : '+'}
                    </span>
                  </button>
                  {openFaqIndex === idx && (
                    <div 
                      className="p-5 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50 prose prose-teal max-w-none"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(faq.answer) }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verified Clinical Sources / Citations */}
        {article.sources && article.sources.length > 0 && (
          <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Verified Scientific References & Citations
            </h4>
            <ol className="space-y-2 list-decimal list-inside text-slate-500">
              {article.sources.map((src, idx) => (
                <li key={idx} className="leading-relaxed">
                  <strong className="text-slate-700">{src.title}</strong> — {src.publisher || 'PubMed'}, {src.published_date || '2024'}.{' '}
                  {src.url && (
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-[#0F6265] underline hover:text-rose-600">
                      View Study [PubMed]
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Medical Disclaimer */}
        <div className="mt-12 p-5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
          <strong>Medical Notice:</strong> The information contained in this guide is for educational purposes and should not be considered personalized clinical advice. Consult a board-certified healthcare provider for specific diagnostic and therapeutic protocols.
        </div>

        {/* Related Articles */}
        {article.related_articles && article.related_articles.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-200">
            <h3 className="text-2xl font-extrabold text-[#094749] tracking-tight mb-6 font-sans">
              Related Clinical Guides
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {article.related_articles.map(related => (
                <ArticleCard key={related.id} article={related} />
              ))}
            </div>
          </div>
        )}

      </article>
    </div>
  );
}
