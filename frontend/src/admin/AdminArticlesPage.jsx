import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminArticles, publishAdminArticle, unpublishAdminArticle, deleteAdminArticle } from '../api/articles';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await getAdminArticles({ page_size: 50 });
      setArticles(res?.data || []);
    } catch (err) {
      console.warn("Error loading admin articles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleTogglePublish = async (article) => {
    try {
      if (article.status === 'published') {
        await unpublishAdminArticle(article.id);
        setMsg(`Article '${article.title}' unpublished to draft.`);
      } else {
        await publishAdminArticle(article.id);
        setMsg(`Article '${article.title}' successfully published.`);
      }
      loadArticles();
    } catch (err) {
      setMsg(`Action failed: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      await deleteAdminArticle(id);
      setMsg("Article deleted.");
      loadArticles();
    } catch (err) {
      setMsg(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#094749] tracking-tight font-sans">
            Medical Articles CMS
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Draft, review, and publish evidence-based clinical guides.
          </p>
        </div>

        <Link
          to="/admin/articles/new"
          className="px-4 py-2.5 rounded-xl bg-[#0F6265] hover:bg-[#094749] text-white text-xs font-bold shadow-xs transition-colors"
        >
          + Create New Article
        </Link>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800 flex justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-teal-600 font-bold">✕</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-4">Title & Headline</th>
              <th className="p-4">Category</th>
              <th className="p-4">Status</th>
              <th className="p-4">Reading Time</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400">Loading articles...</td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400">No articles in database.</td>
              </tr>
            ) : (
              articles.map((art) => (
                <tr key={art.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-900 max-w-sm">
                    <Link to={`/admin/articles/${art.id}/edit`} className="hover:text-[#0F6265] block truncate">
                      {art.title}
                    </Link>
                    <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                      Slug: /{art.slug}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">
                    {art.category?.name || 'General Health'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      art.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {art.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-medium">
                    {art.reading_time || '8 Min'}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link
                      to={`/admin/articles/${art.id}/edit`}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleTogglePublish(art)}
                      className={`px-2.5 py-1.5 rounded-lg font-bold ${
                        art.status === 'published'
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                          : 'bg-teal-50 hover:bg-teal-100 text-teal-800'
                      }`}
                    >
                      {art.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDelete(art.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
