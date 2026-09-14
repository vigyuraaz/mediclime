import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminProducts } from '../api/products';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getAdminProducts({ page_size: 50 });
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#094749] tracking-tight font-sans">
            Supplement Reviews & Facts CMS
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage nutraceutical profiles, ingredient potencies, and third-party certifications.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="px-4 py-2 bg-[#0F6265] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#094749] transition-colors"
        >
          + New Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-4">Supplement Name & Brand</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400">Loading supplements...</td>
              </tr>
            ) : products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-bold text-slate-900">
                  <div className="text-sm font-bold text-slate-900">{p.name}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{p.brand} • /{p.slug}</div>
                </td>
                <td className="p-4 font-semibold text-amber-600">
                  ★ {p.rating} ({p.review_count || 0})
                </td>
                <td className="p-4 font-bold text-[#094749]">
                  ${p.price ? p.price.toFixed(2) : '49.00'}
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    {p.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <Link
                    to={`/admin/products/${p.id}/edit`}
                    className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold"
                  >
                    Edit ✏️
                  </Link>
                  <Link
                    to={`/supplements/${p.slug}`}
                    target="_blank"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold inline-block"
                  >
                    View Public ↗
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
