import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Breadcrumbs from '../components/Breadcrumbs';
import ComparisonMatrix from '../components/ComparisonMatrix';
import { LoadingSkeleton } from '../components/Feedback';
import { getPublicProducts } from '../api/products';

export default function ComparePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getPublicProducts({ page_size: 10 });
        setProducts(res?.data || []);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <Helmet>
        <title>Interactive Supplement Comparison Matrix | Mediclime</title>
        <meta name="description" content="Compare dietary supplements, bioactives, clinical dosages, lab certifications, and prices side-by-side with Mediclime's interactive matrix." />
        <meta name="keywords" content="supplement comparison, compare vitamins, dosage comparison, formula matrix, lab tested supplements" />
        <meta property="og:title" content="Interactive Supplement Comparison Matrix | Mediclime" />
        <meta property="og:description" content="Compare dietary supplements, bioactives, clinical dosages, lab certifications, and prices side-by-side with Mediclime's interactive matrix." />
      </Helmet>

      <Breadcrumbs items={[{ label: 'Supplements', path: '/supplements' }, { label: 'Interactive Comparison Matrix' }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F43F5E]">
            Clinical Decision Matrix
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#094749] tracking-tight font-sans mt-2 mb-3">
            Side-by-Side Formula Comparison
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-serif italic">
            Direct pharmacokinetic comparison of active dosages, third-party lab certifications, bioavailable forms, and pricing metrics across clinical formulations.
          </p>
        </div>

        {loading ? (
          <LoadingSkeleton count={3} />
        ) : (
          <ComparisonMatrix products={products} />
        )}

      </div>
    </div>
  );
}
