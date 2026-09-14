import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';
import { getAdminProduct, createAdminProduct, updateAdminProduct } from '../api/products';
import { getPublicCategories } from '../api/publicData';
import { markdownToHtmlForEditor } from '../utils/markdown';

export default function AdminProductEditorPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: '',
    brand: '',
    category_id: null,
    status: 'draft',
    price: 0,
    serving_size: '',
    form: '',
    short_description: '',
    description: '',
    seo_title: '',
    seo_description: '',
    meta_keywords: '',
    featured_image_url: ''
  });

  useEffect(() => {
    async function loadInitial() {
      try {
        const catRes = await getPublicCategories();
        setCategories(catRes || []);

        if (isEdit) {
          const prod = await getAdminProduct(id);
          if (prod) {
            setForm({
              ...prod,
              category_id: prod.category_id || (prod.category ? prod.category.id : null),
              description: markdownToHtmlForEditor(prod.description || ''),
              meta_keywords: prod.meta_keywords || ''
            });
          }
        }
      } catch (err) {
        console.warn("Failed to load product editor data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, [id, isEdit]);

  const handleSave = async (publish = false) => {
    setSaving(true);
    setMsg('');
    try {
      const payload = {
        ...form,
        status: publish ? 'published' : form.status
      };
      if (isEdit) {
        await updateAdminProduct(id, payload);
        setMsg(publish ? "Product updated and published!" : "Product changes saved successfully.");
      } else {
        const created = await createAdminProduct(payload);
        setMsg("Product created successfully.");
        navigate(`/admin/products/${created.id}/edit`);
      }
      setForm(prev => ({ ...prev, status: payload.status }));
    } catch (err) {
      setMsg(err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold">Loading product data...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#094749] tracking-tight">
            {isEdit ? 'Edit Product Review' : 'New Product Review'}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Build SEO-optimized product pages and supplement reviews.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-white border border-teal-200 text-[#0F6265] font-bold text-xs hover:bg-teal-50 transition-colors shadow-xs"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#0F6265] hover:bg-[#094749] text-white font-bold text-xs shadow-md transition-colors"
          >
            Publish Now ➔
          </button>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-bold ${msg.includes('Failed') ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Product Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 text-lg font-bold rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                placeholder="e.g. Arialief Nerve Support"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Short SEO Summary</label>
              <textarea
                value={form.short_description}
                onChange={e => setForm({ ...form, short_description: e.target.value })}
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:border-teal-500"
                placeholder="2-3 sentence overview..."
                rows={3}
              ></textarea>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Full Description & Review</label>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <RichTextEditor
                  value={form.description || ''}
                  onChange={html => setForm({ ...form, description: html })}
                  placeholder="Write the detailed product review here..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          
          {/* Metadata Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-4">Product Details</h3>
            
            <div>
              <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">Brand</label>
              <input type="text" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">Category</label>
              <select 
                value={form.category_id || ''} 
                onChange={e => setForm({ ...form, category_id: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              >
                <option value="">-- Select --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">Price (USD)</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">Form (e.g. Capsules)</label>
              <input type="text" value={form.form} onChange={e => setForm({ ...form, form: e.target.value })} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">Serving Size</label>
              <input type="text" value={form.serving_size} onChange={e => setForm({ ...form, serving_size: e.target.value })} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" />
            </div>
          </div>

          {/* Links & Images Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-4">Media & Affiliates</h3>
            <div>
              <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">Featured Image URL</label>
              <div className="flex gap-2">
                <input type="url" placeholder="https://..." value={form.featured_image_url || ''} onChange={e => setForm({ ...form, featured_image_url: e.target.value })} className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg" />
                <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer text-xs font-bold whitespace-nowrap transition-colors flex items-center">
                  Upload
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        try {
                          const { uploadMediaFile } = await import('../api/adminServices');
                          const res = await uploadMediaFile(e.target.files[0]);
                          setForm(prev => ({ ...prev, featured_image_url: res.url }));
                        } catch (err) {
                          alert('Upload failed: ' + err.message);
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">Buy Now Link URL</label>
              <input type="url" placeholder="https://..." value={form.buy_now_url || ''} onChange={e => setForm({ ...form, buy_now_url: e.target.value })} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" />
            </div>
          </div>

          {/* AI Image Prompts (Admin Only) */}
          {form.image_prompts && form.image_prompts.length > 0 && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                🎨 AI Image Prompts
              </label>
              <div className="space-y-2">
                {form.image_prompts.map((prompt, idx) => (
                  <div key={idx} className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-900 font-medium leading-relaxed">
                    <span className="font-bold mr-2 text-indigo-600">Prompt {idx + 1}:</span>
                    {prompt}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEO Settings Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-4">Search Optimization</h3>
            <div>
              <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">SEO Title</label>
              <input type="text" value={form.seo_title} onChange={e => setForm({ ...form, seo_title: e.target.value })} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">SEO Meta Description</label>
              <textarea value={form.seo_description} onChange={e => setForm({ ...form, seo_description: e.target.value })} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" rows={3}></textarea>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                Meta Keywords
              </label>
              <input 
                type="text" 
                placeholder="e.g. neuropathy relief, nerve comfort, benfotiamine, daily capsules" 
                value={form.meta_keywords || ''} 
                onChange={e => setForm({ ...form, meta_keywords: e.target.value })} 
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden" 
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Comma-separated keywords (5-6 recommended) used for search engine indexing.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-xs text-slate-500 font-medium leading-relaxed">
            <p className="mb-2"><strong>Status:</strong> <span className={`uppercase font-bold ${form.status === 'published' ? 'text-emerald-600' : 'text-amber-600'}`}>{form.status}</span></p>
            <p>Save as draft to preview changes before publishing.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
