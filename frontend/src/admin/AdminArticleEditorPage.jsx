import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContentBlockRenderer from '../components/ContentBlockRenderer';
import RichTextEditor from '../components/RichTextEditor';
import { contentBlocksToHtml, htmlToContentBlocks } from '../utils/contentConverter';
import { getAdminArticle, createAdminArticle, updateAdminArticle, publishAdminArticle } from '../api/articles';
import { getPublicCategories, getPublicAuthors } from '../api/publicData';

export default function AdminArticleEditorPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'preview'
  const [editorMode, setEditorMode] = useState('visual'); // 'visual' or 'json'
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);

  // Rich text editor HTML state
  const [editorHtml, setEditorHtml] = useState('');
  // JSON editor raw text state
  const [jsonText, setJsonText] = useState('');

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    excerpt: '',
    category_id: null,
    author_id: null,
    reviewer_id: null,
    status: 'draft',
    reading_time: '10 Min Read',
    featured_image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    seo_title: '',
    seo_description: '',
    meta_keywords: '',
    executive_summary: [
      { bold: 'Clinical Focus:', text: 'Pathology and biochemical mechanism overview.' }
    ],
    content_blocks: [
      { type: 'heading', level: 2, text: '1. Cellular Mechanisms & Pathology' },
      { type: 'paragraph', text: 'Detailed clinical explanation of physiological processes...' },
      { type: 'callout', variant: 'info', title: 'Clinical Pearl', text: 'Important clinical consideration for practitioners...' }
    ],
    faqs: [
      { question: 'What is the primary mechanism of action?', answer: 'Targeted cellular support down-regulates hyperactive signaling pathways.' }
    ],
    sources: [
      { title: 'Journal of Clinical Medicine', publisher: 'PubMed', published_date: '2024', citation_text: 'Peer-reviewed meta-analysis.' }
    ]
  });

  // Initialize editor HTML from content_blocks
  const syncEditorFromBlocks = useCallback((blocks) => {
    const html = contentBlocksToHtml(blocks);
    setEditorHtml(html);
    setJsonText(JSON.stringify(blocks, null, 2));
  }, []);

  useEffect(() => {
    async function loadInitial() {
      try {
        const [catRes, authRes] = await Promise.all([
          getPublicCategories(),
          getPublicAuthors()
        ]);
        setCategories(catRes || []);
        setAuthors(authRes || []);

        if (isEdit) {
          const art = await getAdminArticle(id);
          if (art) {
            const updatedForm = {
              ...art,
              category_id: art.category_id || (art.category ? art.category.id : null),
              author_id: art.author_id || (art.author ? art.author.id : null),
              reviewer_id: art.reviewer_id || (art.reviewer ? art.reviewer.id : null),
              executive_summary: art.executive_summary || [],
              content_blocks: art.content_blocks || [],
              faqs: art.faqs || [],
              sources: art.sources || [],
              meta_keywords: art.meta_keywords || ''
            };
            setForm(updatedForm);
            syncEditorFromBlocks(updatedForm.content_blocks);
          }
        } else {
          syncEditorFromBlocks(form.content_blocks);
        }
      } catch (err) {
        console.warn("Failed to load editor data:", err);
        syncEditorFromBlocks(form.content_blocks);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, [id, isEdit]);

  // When rich text editor changes, update form
  const handleEditorChange = (html) => {
    setEditorHtml(html);
    const blocks = htmlToContentBlocks(html);
    setForm(prev => ({ ...prev, content_blocks: blocks }));
    setJsonText(JSON.stringify(blocks, null, 2));
  };

  // When JSON editor changes, update form and rich text
  const handleJsonChange = (text) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      setForm(prev => ({ ...prev, content_blocks: parsed }));
      setEditorHtml(contentBlocksToHtml(parsed));
    } catch {
      // Allow in-progress typing
    }
  };

  // Switch between editor modes
  const handleModeSwitch = (newMode) => {
    if (newMode === 'json') {
      // Sync JSON from current blocks
      setJsonText(JSON.stringify(form.content_blocks, null, 2));
    } else {
      // Sync HTML from current blocks
      setEditorHtml(contentBlocksToHtml(form.content_blocks));
    }
    setEditorMode(newMode);
  };

  const handleSave = async (publish = false) => {
    setSaving(true);
    setMsg('');
    try {
      const payload = {
        ...form,
        status: publish ? 'published' : form.status
      };
      if (isEdit) {
        await updateAdminArticle(id, payload);
        if (publish) await publishAdminArticle(id);
        setMsg(publish ? "Article updated and published!" : "Article changes saved successfully.");
      } else {
        const created = await createAdminArticle(payload);
        setMsg("Article created successfully.");
        navigate(`/admin/articles/${created.id}/edit`);
      }
    } catch (err) {
      setMsg(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Executive Summary helpers
  const addSummaryItem = () => {
    setForm(prev => ({
      ...prev,
      executive_summary: [...prev.executive_summary, { bold: '', text: '' }]
    }));
  };

  const removeSummaryItem = (index) => {
    setForm(prev => ({
      ...prev,
      executive_summary: prev.executive_summary.filter((_, i) => i !== index)
    }));
  };

  const updateSummaryItem = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      executive_summary: prev.executive_summary.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // FAQ helpers
  const addFAQ = () => {
    setForm(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }));
  };

  const removeFAQ = (index) => {
    setForm(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const updateFAQ = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      faqs: prev.faqs.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Source helpers
  const addSource = () => {
    setForm(prev => ({
      ...prev,
      sources: [...prev.sources, { title: '', publisher: '', published_date: '', citation_text: '' }]
    }));
  };

  const removeSource = (index) => {
    setForm(prev => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index)
    }));
  };

  const updateSource = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      sources: prev.sources.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // SEO Score Calculator
  const titleLength = form.title.length;
  const hasExcerpt = Boolean(form.excerpt && form.excerpt.length > 30);
  const hasBlocks = form.content_blocks && form.content_blocks.length >= 2;
  const hasSources = form.sources && form.sources.length >= 1;
  const seoScore = Math.min(100, (titleLength > 20 ? 30 : 15) + (hasExcerpt ? 25 : 0) + (hasBlocks ? 25 : 0) + (hasSources ? 20 : 0));

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading article editor...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-[#094749] tracking-tight font-sans">
            {isEdit ? 'Edit Medical Article' : 'Write New Clinical Guide'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Rich Text Editor with Live Public Preview Mode.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="bg-slate-200 p-1 rounded-xl flex text-xs font-bold">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'edit' ? 'bg-white text-[#0F6265] shadow-xs' : 'text-slate-600'
              }`}
            >
              ✏️ Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'preview' ? 'bg-white text-[#0F6265] shadow-xs' : 'text-slate-600'
              }`}
            >
              👁️ Live Preview
            </button>
          </div>

          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-[#0F6265] hover:bg-[#094749] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Publish Live
          </button>
        </div>
      </div>

      {msg && (
        <div className={`p-3.5 rounded-xl border text-xs font-bold ${
          msg.includes('failed') || msg.includes('Failed')
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-teal-50 border-teal-200 text-teal-900'
        }`}>
          {msg}
        </div>
      )}

      {/* Mode 1: Editor Form */}
      {activeTab === 'edit' && (
        <div className="space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
          
          {/* SEO Quality Score Badge */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-rose-50 border border-teal-100 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold uppercase tracking-wider text-teal-900 block text-[10px]">
                Content & SEO Quality Score
              </span>
              <span className="text-slate-600">
                {seoScore >= 80 ? 'Excellent clinical structure' : 'Add citations and executive summary to increase score'}
              </span>
            </div>
            <div className={`text-xl font-extrabold ${seoScore >= 80 ? 'text-emerald-600' : seoScore >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
              {seoScore} / 100
            </div>
          </div>

          {/* Core Metadata */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Article Title / Main Headline
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Understanding Peripheral Neuropathy: Evidence-Based Management"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Executive Subtitle (Editorial Serif Style)
              </label>
              <input
                type="text"
                value={form.subtitle || ''}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Comprehensive clinical review on nerve fiber recovery and holistic habits..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Category</label>
                <select
                  value={form.category_id || ''}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Primary Author</label>
                <select
                  value={form.author_id || ''}
                  onChange={(e) => setForm({ ...form, author_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden"
                >
                  <option value="">Select Author</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Medical Reviewer</label>
                <select
                  value={form.reviewer_id || ''}
                  onChange={(e) => setForm({ ...form, reviewer_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden"
                >
                  <option value="">Select Reviewer</option>
                  {authors.filter(a => a.is_medical_reviewer).map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Featured Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={form.featured_image_url || ''}
                    onChange={(e) => setForm({ ...form, featured_image_url: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-teal-500"
                  />
                  <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer text-xs font-bold whitespace-nowrap transition-colors flex items-center">
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Reading Time
                </label>
                <input
                  type="text"
                  value={form.reading_time || ''}
                  onChange={(e) => setForm({ ...form, reading_time: e.target.value })}
                  placeholder="10 Min Read"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Short Excerpt (Used for search previews and cards)
              </label>
              <textarea
                rows={2}
                value={form.excerpt || ''}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs leading-relaxed focus:outline-hidden"
              ></textarea>
            </div>
          </div>

          {/* Executive Summary Section */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                📋 Executive Summary Points
              </label>
              <button
                onClick={addSummaryItem}
                className="px-3 py-1 rounded-lg bg-teal-50 text-[#0F6265] text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer"
              >
                + Add Point
              </button>
            </div>
            <div className="space-y-3">
              {form.executive_summary.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={item.bold}
                      onChange={(e) => updateSummaryItem(idx, 'bold', e.target.value)}
                      placeholder="Bold label:"
                      className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold focus:outline-hidden"
                    />
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateSummaryItem(idx, 'text', e.target.value)}
                      placeholder="Description text..."
                      className="sm:col-span-3 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden"
                    />
                  </div>
                  <button
                    onClick={() => removeSummaryItem(idx)}
                    className="text-rose-400 hover:text-rose-600 text-xs font-bold p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Content Editor Section */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                📝 Article Content
              </label>
              <div className="bg-slate-200 p-0.5 rounded-lg flex text-[10px] font-bold">
                <button
                  onClick={() => handleModeSwitch('visual')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    editorMode === 'visual' ? 'bg-white text-[#0F6265] shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Visual Editor
                </button>
                <button
                  onClick={() => handleModeSwitch('json')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    editorMode === 'json' ? 'bg-white text-[#0F6265] shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Raw JSON
                </button>
              </div>
            </div>

            {editorMode === 'visual' ? (
              <RichTextEditor
                value={editorHtml}
                onChange={handleEditorChange}
                placeholder="Start writing your clinical article content here..."
              />
            ) : (
              <textarea
                rows={16}
                value={jsonText}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs leading-relaxed focus:outline-hidden"
                spellCheck={false}
              ></textarea>
            )}

            <p className="text-[10px] text-slate-400 mt-2">
              {editorMode === 'visual'
                ? 'Use the toolbar to format headings, bold text, lists, blockquotes, and more. Content is auto-saved as structured blocks.'
                : 'Edit the raw JSON content blocks directly. Supports: heading, paragraph, callout, nutrient_card, pull_quote, table'}
            </p>
          </div>

          {/* FAQs Section */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                ❓ Clinical FAQs
              </label>
              <button
                onClick={addFAQ}
                className="px-3 py-1 rounded-lg bg-teal-50 text-[#0F6265] text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer"
              >
                + Add FAQ
              </button>
            </div>
            <div className="space-y-3">
              {form.faqs.map((faq, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex gap-3 items-start">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFAQ(idx, 'question', e.target.value)}
                        placeholder="Clinical question..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold focus:outline-hidden"
                      />
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => updateFAQ(idx, 'answer', e.target.value)}
                        placeholder="Evidence-based answer..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden"
                      ></textarea>
                    </div>
                    <button
                      onClick={() => removeFAQ(idx)}
                      className="text-rose-400 hover:text-rose-600 text-xs font-bold p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sources / Citations Section */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                📚 Sources & Citations
              </label>
              <button
                onClick={addSource}
                className="px-3 py-1 rounded-lg bg-teal-50 text-[#0F6265] text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer"
              >
                + Add Source
              </button>
            </div>
            <div className="space-y-3">
              {form.sources.map((src, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex gap-3 items-start">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={src.title}
                        onChange={(e) => updateSource(idx, 'title', e.target.value)}
                        placeholder="Publication title..."
                        className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-hidden"
                      />
                      <input
                        type="text"
                        value={src.publisher || ''}
                        onChange={(e) => updateSource(idx, 'publisher', e.target.value)}
                        placeholder="Publisher (e.g. PubMed)"
                        className="px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden"
                      />
                      <input
                        type="text"
                        value={src.published_date || ''}
                        onChange={(e) => updateSource(idx, 'published_date', e.target.value)}
                        placeholder="Year (e.g. 2024)"
                        className="px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden"
                      />
                      <input
                        type="text"
                        value={src.citation_text || ''}
                        onChange={(e) => updateSource(idx, 'citation_text', e.target.value)}
                        placeholder="Citation description..."
                        className="px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden"
                      />
                    </div>
                    <button
                      onClick={() => removeSource(idx)}
                      className="text-rose-400 hover:text-rose-600 text-xs font-bold p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Image Prompts (Admin Only) */}
          {form.image_prompts && form.image_prompts.length > 0 && (
            <div className="pt-6 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 block">
                🎨 AI Image Prompts (Hidden from public)
              </label>
              <div className="space-y-2">
                {form.image_prompts.map((prompt, idx) => (
                  <div key={idx} className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-900 font-medium">
                    <span className="font-bold mr-2 text-indigo-600">Prompt {idx + 1}:</span>
                    {prompt}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEO Section */}
          <div className="pt-6 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 block">
              🔍 SEO Settings
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">SEO Title</label>
                <input
                  type="text"
                  value={form.seo_title || ''}
                  onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                  placeholder="SEO optimized page title..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">SEO Description</label>
                <input
                  type="text"
                  value={form.seo_description || ''}
                  onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                  placeholder="Meta description for search results..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Meta Keywords</label>
                <input
                  type="text"
                  value={form.meta_keywords || ''}
                  onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })}
                  placeholder="e.g. peripheral neuropathy, nerve damage, benfotiamine, diabetic neuropathy, clinical guide"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Comma-separated keywords (5-6 recommended) injected into &lt;meta name="keywords"&gt; in the page header.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Mode 2: Live Public Article Detail Preview */}
      {activeTab === 'preview' && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-10">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs font-bold text-teal-900 text-center">
            👁️ LIVE ARTICLE DETAIL PREVIEW (Exact Public Design System View)
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-[#F43F5E] text-xs font-bold uppercase tracking-wider">
              {categories.find(c => c.id === form.category_id)?.name || 'Nervous Health'} • {form.reading_time || '10 Min Read'}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#094749] tracking-tight font-sans">
              {form.title || 'Untitled Article'}
            </h1>

            {form.subtitle && (
              <p className="text-lg md:text-xl text-slate-600 font-serif italic">
                {form.subtitle}
              </p>
            )}

            {/* Byline */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                By {authors.find(a => a.id === form.author_id)?.name || 'Dr. Emily Langford MD'}
              </span>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px]">
                ✓ Evidence-Based Review
              </span>
            </div>

            {/* Executive Summary Box */}
            {form.executive_summary && form.executive_summary.length > 0 && (
              <div className="p-6 rounded-2xl bg-rose-50/70 border border-rose-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#F43F5E] mb-3">
                  📋 Executive Clinical Summary
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                  {form.executive_summary.map((item, idx) => (
                    <li key={idx}>
                      <strong>{item.bold} </strong>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Render Blocks */}
            <ContentBlockRenderer blocks={form.content_blocks || []} />
          </div>
        </div>
      )}

    </div>
  );
}
