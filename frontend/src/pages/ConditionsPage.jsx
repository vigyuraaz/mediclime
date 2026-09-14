import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Breadcrumbs from '../components/Breadcrumbs';
import ConditionCard from '../components/ConditionCard';
import { LoadingSkeleton } from '../components/Feedback';
import { getPublicConditions, getPublicConditionBySlug } from '../api/publicData';

export function ConditionsPage() {
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPublicConditions();
        setConditions(data || []);
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
        <title>Health Condition Hubs & Clinical Wellness Guides | Mediclime</title>
        <meta name="description" content="Explore clinical guides and evidence-backed lifestyle and nutrient recommendations across key health focus areas on Mediclime." />
        <meta name="keywords" content="health conditions, neuropathy, metabolic syndrome, glucose, sleep latency, osteoarthritis, gut health, cognitive function" />
        <meta property="og:title" content="Health Condition Hubs & Clinical Wellness Guides | Mediclime" />
        <meta property="og:description" content="Explore clinical guides and evidence-backed lifestyle and nutrient recommendations across key health focus areas on Mediclime." />
      </Helmet>

      <Breadcrumbs items={[{ label: 'Health Hubs', path: '/health' }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F43F5E]">
            Clinical Directory
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#094749] tracking-tight font-sans mt-2 mb-3">
            Health Condition Hubs
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-serif italic">
            Comprehensive diagnostic guides, cellular pathology overviews, and validated dietary supplement protocols categorized by physiological system.
          </p>
        </div>

        {loading ? (
          <LoadingSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conditions.map((c) => (
              <ConditionCard key={c.id} condition={c} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export function ConditionDetailPage() {
  const { slug } = useParams();
  const [condition, setCondition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getPublicConditionBySlug(slug);
        setCondition(data);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) return <LoadingSkeleton count={2} />;

  if (!condition) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Condition Hub Not Found</h2>
        <Link to="/health" className="px-5 py-2.5 rounded-xl bg-[#0F6265] text-white font-bold text-xs">
          Return to Health Hubs
        </Link>
      </div>
    );
  }

  const pageTitle = `${condition.name} Hub: Clinical Guides & Supplements | Mediclime`;
  const pageDesc = condition.summary || `Comprehensive evidence-based health overview of ${condition.name}, including symptoms, diagnostic indicators, and nutrient considerations.`;
  const pageKeywords = `${condition.name}, symptoms, causes, clinical nutrition, health guide, evidence-based`;

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="keywords" content={pageKeywords} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
      </Helmet>

      <Breadcrumbs items={[{ label: 'Health Hubs', path: '/health' }, { label: condition.name }]} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0F6265] text-xs font-bold uppercase tracking-wider">
            Clinical Health Condition
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#094749] tracking-tight font-sans">
            {condition.name}
          </h1>
          <p className="text-lg text-slate-600 font-serif italic leading-relaxed">
            {condition.summary}
          </p>
        </div>

        {/* Symptoms & Causes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {condition.symptoms && condition.symptoms.length > 0 && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>⚠️</span> Reported Clinical Symptoms
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {condition.symptoms.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#F43F5E] font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {condition.causes && condition.causes.length > 0 && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>🔬</span> Pathological Root Causes
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {condition.causes.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-700 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Treatments & Protocols */}
        {condition.treatments && condition.treatments.length > 0 && (
          <div className="p-8 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-4">
            <h3 className="text-lg font-bold text-[#094749] tracking-tight font-sans">
              Evidence-Based Lifestyle & Nutraceutical Interventions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
              {condition.treatments.map((t, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-teal-100 flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* When to seek care */}
        {condition.when_to_seek_care && (
          <div className="p-6 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs sm:text-sm text-rose-950 space-y-2">
            <strong className="text-rose-900 font-bold uppercase tracking-wider block text-xs">
              When to Seek Prompt Clinical Evaluation
            </strong>
            <p>{condition.when_to_seek_care}</p>
          </div>
        )}

      </div>
    </div>
  );
}
