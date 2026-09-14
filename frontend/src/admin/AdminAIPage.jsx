import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { generateArticleAI, generateProductAI, getAIJobStatus } from '../api/adminServices';

const GENERATION_STEPS = [
  { key: 'queued', label: 'Job Queued', icon: '📋', desc: 'Request validated and added to processing queue' },
  { key: 'processing', label: 'AI Generating', icon: '🧠', desc: 'AI provider is writing clinical content with safety guardrails' },
  { key: 'completed', label: 'Article Created', icon: '✅', desc: 'Content validated, structured, and saved as draft article' },
];

export default function AdminAIPage() {
  const [generationType, setGenerationType] = useState('article');
  
  const [form, setForm] = useState({
    title: '',
    category: 'Nervous Health',
    primary_keyword: '',
    desired_word_count: 1600,
    tone: 'Authoritative, compassionate, evidence-based',
    target_audience: 'Patients & Wellness Seekers',
    search_intent: 'Clinical / Patient Protocol',
    brand: '',
    serving_size: '2 Capsules Daily',
    form_type: 'Vegetarian Capsules',
    ingredients_info: '',
    include_faq: true,
    include_references: true,
    auto_publish: false,
    additional_instructions: ''
  });

  const [activeJob, setActiveJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentJobs, setRecentJobs] = useState([]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Please enter an article title or clinical topic.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      let res;
      if (generationType === 'product') {
        const productPayload = {
          name: form.title,
          brand: form.brand || 'Unknown',
          category: form.category,
          form: form.form_type,
          serving_size: form.serving_size,
          target_audience: form.target_audience,
          ingredients_info: form.ingredients_info,
          auto_publish: form.auto_publish,
          additional_instructions: form.additional_instructions
        };
        res = await generateProductAI(productPayload);
      } else {
        res = await generateArticleAI(form);
      }
      
      const job = res.data || res;
      setActiveJob(job);
      pollJob(job.job_id);
    } catch (err) {
      const message = err.message || 'Generation request failed';
      if (message.includes('401') || message.includes('Unauthorized')) {
        setError('Authentication required. Please log in again from the admin login page.');
      } else if (message.includes('API key') || message.includes('GEMINI') || message.includes('GROQ')) {
        setError('AI API key is not configured. Go to Settings → API Keys to add your Groq, Gemini, or OpenAI key.');
      } else {
        setError(message);
      }
      setLoading(false);
    }
  };

  const pollJob = (jobId) => {
    const interval = setInterval(async () => {
      try {
        const res = await getAIJobStatus(jobId);
        const job = res.data || res;
        setActiveJob(job);
        if (job.status === 'completed' || job.status === 'failed') {
          clearInterval(interval);
          setLoading(false);
          if (job.status === 'completed') {
            setRecentJobs(prev => [job, ...prev].slice(0, 5));
          }
        }
      } catch {
        clearInterval(interval);
        setLoading(false);
      }
    }, 2000);
  };

  const getCurrentStep = () => {
    if (!activeJob) return -1;
    if (activeJob.status === 'failed') return -1;
    return GENERATION_STEPS.findIndex(s => s.key === activeJob.status);
  };

  const currentStep = getCurrentStep();

  const categoryOptions = [
    'Nervous Health',
    'Metabolic Support',
    'Sleep & Circadian',
    'Cellular Nutrition',
    'Joint & Musculoskeletal',
    'Cardiovascular Health',
    'Immune System',
    'Digestive Wellness',
    'Mental Health',
    'Skin & Dermatology'
  ];

  const audienceOptions = [
    'Patients & Wellness Seekers',
    'Healthcare Professionals',
    'Caregivers & Family Members',
    'Fitness & Performance Athletes',
    'General Public'
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#F43F5E] text-xs font-bold uppercase tracking-wider mb-2">
          <span>🤖</span> AI Content Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#094749] tracking-tight font-sans">
          AI Clinical Article Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Generate structured, evidence-based medical articles using AI with clinical safety guardrails. Articles are saved as drafts for review before publishing.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <span className="text-rose-500 text-lg">⚠️</span>
          <div>
            <p className="text-xs font-bold text-rose-800 mb-1">Generation Error</p>
            <p className="text-xs text-rose-700">{error}</p>
          </div>
        </div>
      )}

      {/* Generator Form */}
      <form onSubmit={handleGenerate} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
        
        {/* Type Toggle */}
        <div className="flex gap-4 p-1 bg-slate-100 rounded-xl max-w-sm mx-auto mb-8">
          <button
            type="button"
            onClick={() => setGenerationType('article')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${generationType === 'article' ? 'bg-white text-[#0F6265] shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Clinical Article
          </button>
          <button
            type="button"
            onClick={() => setGenerationType('product')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${generationType === 'product' ? 'bg-white text-[#0F6265] shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Product Review
          </button>
        </div>

        {/* Section: Topic */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-[#0F6265] flex items-center justify-center text-xs font-bold">1</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {generationType === 'product' ? 'Product Name' : 'Article Topic & Title'}
            </span>
          </div>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={generationType === 'product' ? "e.g. Arialief Neuropathy Supplement" : "e.g. Evidence-Based Benfotiamine for Peripheral Nerve Regeneration"}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
          />
        </div>

        {generationType === 'product' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-teal-100 text-[#0F6265] flex items-center justify-center text-xs font-bold">1b</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Product Details</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Brand Name</label>
                <input type="text" required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Arialief" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Serving Size</label>
                <input type="text" value={form.serving_size} onChange={(e) => setForm({ ...form, serving_size: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Form (e.g. Capsules)</label>
                <input type="text" value={form.form_type} onChange={(e) => setForm({ ...form, form_type: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Known Ingredients (Optional)</label>
                <input type="text" value={form.ingredients_info} onChange={(e) => setForm({ ...form, ingredients_info: e.target.value })} placeholder="e.g. PEA, Alpha Lipoic Acid, Magnesium" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden" />
              </div>
            </div>
          </div>
        )}

        {/* Section: Classification */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-[#0F6265] flex items-center justify-center text-xs font-bold">2</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Classification & Targeting</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Health Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden bg-white"
              >
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Target Audience</label>
              <select
                value={form.target_audience}
                onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden bg-white"
              >
                {audienceOptions.map(aud => (
                  <option key={aud} value={aud}>{aud}</option>
                ))}
              </select>
            </div>

            {generationType === 'article' && (
              <>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Primary SEO Keyword</label>
                  <input
                    type="text"
                    value={form.primary_keyword}
                    onChange={(e) => setForm({ ...form, primary_keyword: e.target.value })}
                    placeholder="e.g. benfotiamine neuropathy"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Target Word Count</label>
                  <input
                    type="number"
                    min={800}
                    max={5000}
                    value={form.desired_word_count}
                    onChange={(e) => setForm({ ...form, desired_word_count: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section: Tone & Instructions */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-[#0F6265] flex items-center justify-center text-xs font-bold">3</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Tone & Custom Instructions</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Clinical Tone</label>
              <input
                type="text"
                value={form.tone}
                onChange={(e) => setForm({ ...form, tone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Additional Instructions (Optional)
              </label>
              <textarea
                rows={3}
                value={form.additional_instructions}
                onChange={(e) => setForm({ ...form, additional_instructions: e.target.value })}
                placeholder="e.g. Focus on diabetic neuropathy specifically. Include comparison of R-ALA vs racemic ALA. Mention recent 2025 meta-analysis findings..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:outline-hidden"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Feature Checkboxes */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-6 text-xs font-semibold text-slate-700">
          {generationType === 'article' && (
            <>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.include_faq}
                  onChange={(e) => setForm({ ...form, include_faq: e.target.checked })}
                  className="rounded text-[#0F6265]"
                />
                Generate Clinical FAQs
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.include_references}
                  onChange={(e) => setForm({ ...form, include_references: e.target.checked })}
                  className="rounded text-[#0F6265]"
                />
                Include PubMed Citations
              </label>
            </>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.auto_publish}
              onChange={(e) => setForm({ ...form, auto_publish: e.target.checked })}
              className="rounded text-[#0F6265]"
            />
            Auto-Publish (Skip Draft)
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-[#0F6265] hover:bg-[#094749] text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              AI Generation in Progress...
            </>
          ) : (
            generationType === 'product' ? 'Generate Product Review ➔' : 'Generate Clinical Article ➔'
          )}
        </button>

      </form>

      {/* Step-by-Step Progress Monitor */}
      {activeJob && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Generation Progress
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
              activeJob.status === 'completed'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : activeJob.status === 'failed'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {activeJob.status}
            </span>
          </div>

          {/* Step Progress Bar */}
          {activeJob.status !== 'failed' && (
            <div className="flex items-center gap-0">
              {GENERATION_STEPS.map((step, idx) => {
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep || activeJob.status === 'completed';
                return (
                  <div key={step.key} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-2 transition-all ${
                        isCompleted ? 'bg-emerald-100 border-2 border-emerald-400' :
                        isActive ? 'bg-amber-100 border-2 border-amber-400 animate-pulse' :
                        'bg-slate-100 border-2 border-slate-200'
                      }`}>
                        {isCompleted ? '✅' : step.icon}
                      </div>
                      <span className={`text-[10px] font-bold text-center ${
                        isActive ? 'text-amber-700' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                      }`}>
                        {step.label}
                      </span>
                      <span className="text-[9px] text-slate-400 text-center mt-0.5 max-w-[120px]">
                        {step.desc}
                      </span>
                    </div>
                    {idx < GENERATION_STEPS.length - 1 && (
                      <div className={`h-0.5 w-full mx-1 rounded-full mt-[-24px] ${
                        isCompleted ? 'bg-emerald-300' : 'bg-slate-200'
                      }`}></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Completed: Show article details */}
          {activeJob.status === 'completed' && activeJob.output_data && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-emerald-800 mb-1">🎉 Generated Successfully!</p>
                  <h4 className="text-sm font-bold text-[#094749]">
                    {activeJob.output_data.title}
                  </h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Saved as <span className="font-bold">{activeJob.output_data.status}</span> • Slug: /{activeJob.output_data.slug}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  to={activeJob.output_data.product_id ? `/admin/products/${activeJob.output_data.product_id}/edit` : `/admin/articles/${activeJob.output_data.article_id}/edit`}
                  className="px-5 py-2.5 rounded-xl bg-[#0F6265] text-white font-bold text-xs shadow-xs hover:bg-[#094749] transition-colors"
                >
                  ✏️ Open in Rich Text Editor
                </Link>
                <Link
                  to={activeJob.output_data.product_id ? `/supplements/${activeJob.output_data.slug}` : `/articles/${activeJob.output_data.slug}`}
                  target="_blank"
                  className="px-5 py-2.5 rounded-xl bg-white text-slate-700 font-bold text-xs border border-slate-200 hover:border-teal-300 transition-colors"
                >
                  👁️ View Public Page
                </Link>
              </div>
            </div>
          )}

          {/* Failed: Show error with actionable guidance */}
          {activeJob.status === 'failed' && (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <p className="text-xs font-bold text-rose-800">❌ Generation Failed</p>
              <p className="text-xs text-rose-700">{activeJob.error}</p>
              <p className="text-[10px] text-rose-500 mt-2">
                Common fixes: Verify your API key is set correctly in the backend .env file, ensure the Groq/Gemini API key has quota available, or try reducing the word count.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Generations */}
      {recentJobs.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
            Recent Generations (This Session)
          </h3>
          <div className="space-y-2">
            {recentJobs.map((job, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="font-bold text-slate-800">{job.output_data?.title || 'Untitled'}</span>
                  <span className="text-slate-400 ml-2">• {job.output_data?.status}</span>
                </div>
                <Link
                  to={job.output_data?.product_id ? `/admin/products/${job.output_data.product_id}/edit` : `/admin/articles/${job.output_data?.article_id}/edit`}
                  className="text-[#0F6265] font-bold hover:underline"
                >
                  Edit →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
