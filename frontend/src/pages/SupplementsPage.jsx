import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { LoadingSkeleton } from '../components/Feedback';
import { getPublicProducts } from '../api/products';

export default function SupplementsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getPublicProducts({ search });
        setProducts(res?.data || []);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search]);

  return (
    <div>
      <Helmet>
        <title>Nutraceutical Directory & Supplement Audits | Mediclime</title>
        <meta name="description" content="Independent clinical supplement evaluations, ingredient bioavailability breakdowns, and transparent third-party lab verification guides." />
        <meta name="keywords" content="supplements, nutraceutical directory, supplement reviews, lab tested vitamins, ingredient safety, clinical dosages" />
        <meta property="og:title" content="Nutraceutical Directory & Supplement Audits | Mediclime" />
        <meta property="og:description" content="Independent clinical supplement evaluations, ingredient bioavailability breakdowns, and transparent third-party lab verification guides." />
        <meta property="og:type" content="website" />
      </Helmet>

      <Breadcrumbs items={[{ label: 'Nutraceutical Directory', path: '/supplements' }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 pb-8 border-b border-slate-200">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F43F5E]">
              Clinical Supplement Audits
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#094749] tracking-tight font-sans mt-2 mb-3">
              Third-Party Verified Supplements
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-serif italic">
              Evidence-graded nutritional formulations evaluated for ingredient purity, clinical dosage adequacy, and published human trial results.
            </p>
          </div>

          <Link
            to="/supplements/compare"
            className="px-6 py-3 rounded-2xl bg-[#0F6265] hover:bg-[#094749] text-white font-bold text-xs shadow-md transition-all shrink-0"
          >
            Launch Comparison Matrix ➔
          </Link>
        </div>

        {/* Product Grid */}
        {loading ? (
          <LoadingSkeleton count={4} />
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            No clinical supplements found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
