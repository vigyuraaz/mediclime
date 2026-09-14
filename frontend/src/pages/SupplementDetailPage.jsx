import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import SupplementFactsTable from '../components/SupplementFactsTable';
import { LoadingSkeleton } from '../components/Feedback';
import { getPublicProductBySlug } from '../api/products';
import { Helmet } from 'react-helmet-async';
import { renderMarkdown, renderInlineMarkdown } from '../utils/markdown';
import ProductCard from '../components/ProductCard';

export default function SupplementDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getPublicProductBySlug(slug);
        setProduct(data);
      } catch (err) {
        console.warn("Failed to load supplement details:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Supplement Review Not Found</h2>
        <p className="text-slate-600 mb-6">The requested product facts could not be found.</p>
        <Link to="/supplements" className="px-5 py-2.5 rounded-xl bg-[#0F6265] text-white font-bold text-xs">
          Return to Supplements Directory
        </Link>
      </div>
    );
  }

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const pageTitle = product.seo_title
    ? (product.seo_title.toLowerCase().includes('mediclime') ? product.seo_title : `${product.seo_title} | Mediclime`)
    : `${product.name} — ${product.brand} Review & Clinical Facts | Mediclime`;

  const pageDesc = product.seo_description || product.short_description || `Independent clinical evaluation of ${product.name} by ${product.brand}. Detailed review of ingredients, verified dosages, and third-party certifications.`;

  const pageKeywords = product.meta_keywords || [
    product.name,
    product.brand,
    product.category?.name,
    ...(product.highlight_badges || []),
    'supplement review',
    'nutraceutical facts',
    'dosage verification',
    'clinical evaluation'
  ].filter(Boolean).join(', ');

  const ogImage = product.featured_image_url || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600";

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Supplements', path: '/supplements' },
          { label: product.brand, path: '/supplements' },
          { label: product.name }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDesc} />
          <meta name="keywords" content={pageKeywords} />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDesc} />
          <meta property="og:type" content="product" />
          <meta property="og:image" content={ogImage} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={pageDesc} />
          <meta name="twitter:image" content={ogImage} />
        </Helmet>

        {/* Top Product Overview Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Product Image Gallery */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative aspect-square w-full max-w-sm mx-auto rounded-full bg-white border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center">
              <img
                src={product.featured_image_url || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-8 left-8">
                <span className="bg-[#0F6265] text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider uppercase shadow-md">
                  Best Seller
                </span>
              </div>
            </div>
            {product.highlight_badges && product.highlight_badges.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {product.highlight_badges.map((b, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-[#0F6265] border border-teal-200">
                    ✓ {b}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Title, Rating, Summary, Pricing */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0F6265] bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                {product.brand}
              </span>
              <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm bg-amber-50 px-3 py-1 rounded-full">
                <span>★</span>
                <span>{product.rating}</span>
                <span className="text-slate-400 font-normal">({product.review_count || 120} clinical evaluations)</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#094749] tracking-tight leading-tight font-sans">
              {product.name}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-serif italic">
              {product.short_description}
            </p>

            {/* Price Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-50/70 to-rose-50/40 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Manufacturer Direct Price</span>
                <div className="text-3xl font-extrabold text-[#094749]">
                  ${product.price ? product.price.toFixed(2) : '49.00'}
                  <span className="text-xs text-slate-500 font-normal ml-2">({product.availability || 'In Stock'})</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {product.buy_now_url ? (
                  <a
                    href={product.buy_now_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl bg-[#F43F5E] hover:bg-[#FF6B6B] text-white text-xs font-bold shadow-md transition-colors whitespace-nowrap"
                  >
                    Buy Now ➔
                  </a>
                ) : (
                  <a
                    href="#supplement-facts"
                    className="px-6 py-3 rounded-xl bg-[#F43F5E] hover:bg-[#FF6B6B] text-white text-xs font-bold shadow-md transition-colors whitespace-nowrap"
                  >
                    View Supplement Facts ↓
                  </a>
                )}
                
                <a
                  href="#supplement-facts"
                  className="px-5 py-3 rounded-xl bg-white border border-teal-200 text-[#0F6265] text-xs font-bold hover:bg-teal-50 transition-colors whitespace-nowrap"
                >
                  View formula details
                </a>
              </div>
            </div>

            {/* Benefits Pills */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Targeted Clinical Benefits
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.benefits.map((b, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200/80 text-xs">
                      <strong className="text-slate-900 block mb-0.5">{b.benefit}</strong>
                      <span className="text-slate-500" dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(b.description || '') }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Middle Section: Supplement Facts Table & Directions */}
        <div id="supplement-facts" className="pt-12 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-5">
            <SupplementFactsTable product={product} />
          </div>

          <div className="lg:col-span-7 space-y-8">
            <div>
              <h3 className="text-2xl font-extrabold text-[#094749] tracking-tight mb-4 font-sans">
                Formulation & Clinical Rationale
              </h3>
              <div 
                className="supplement-description prose prose-teal max-w-none text-slate-700 leading-relaxed text-sm sm:text-base"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(product.description || '') }}
              />
            </div>


            {product.dosage && (
              <div className="p-6 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-2 text-xs sm:text-sm">
                <strong className="text-[#094749] uppercase tracking-wider block font-bold text-xs">
                  Physician Recommended Administration
                </strong>
                <div className="text-slate-700" dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(product.dosage) }} />
                {product.directions && <div className="text-slate-600 italic mt-1" dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(product.directions) }} />}
              </div>
            )}

            {product.warnings && (
              <div className="p-6 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2 text-xs sm:text-sm">
                <strong className="text-rose-900 uppercase tracking-wider block font-bold text-xs">
                  Safety, Precautions & Contraindications
                </strong>
                <div className="text-rose-950" dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(product.warnings) }} />
              </div>
            )}
          </div>

        </div>

        {/* Product FAQs */}
        {product.faqs && product.faqs.length > 0 && (
          <div className="pt-12 border-t border-slate-200">
            <h3 className="text-2xl font-extrabold text-[#094749] tracking-tight mb-6 font-sans">
              Frequently Asked Supplement Questions
            </h3>
            <div className="space-y-3 max-w-4xl">
              {product.faqs.map((faq, idx) => (
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
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(faq.answer || '') }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {product.related_products && product.related_products.length > 0 && (
          <div className="pt-12 border-t border-slate-200">
            <h3 className="text-2xl font-extrabold text-[#094749] tracking-tight mb-6 font-sans">
              Similar Clinical Supplements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {product.related_products.map(related => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
