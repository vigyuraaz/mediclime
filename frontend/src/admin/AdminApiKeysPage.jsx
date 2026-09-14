import React, { useState, useEffect } from 'react';
import { getApiKeys, createApiKey, revokeApiKey } from '../api/adminServices';

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyName, setKeyName] = useState('');
  const [newKeyData, setNewKeyData] = useState(null);
  const [msg, setMsg] = useState('');

  const loadKeys = async () => {
    setLoading(true);
    try {
      const data = await getApiKeys();
      setKeys(data || []);
    } catch (err) {
      console.warn("Failed to load API keys", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!keyName) return;
    try {
      const res = await createApiKey({
        name: keyName,
        permissions: ['article:create', 'article:publish', 'ai:generate']
      });
      setNewKeyData(res);
      setKeyName('');
      loadKeys();
    } catch (err) {
      setMsg(`Failed to create key: ${err.message}`);
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm("Are you sure you want to revoke this API key? External automation scripts using this key will immediately fail.")) return;
    try {
      await revokeApiKey(id);
      loadKeys();
    } catch (err) {
      setMsg(`Revoke failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold text-[#094749] tracking-tight font-sans">
          External Automation API Keys
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Manage secure credentials for external Python scripts, scheduled cron bots, and CLI publishing tools.
        </p>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800">
          {msg}
        </div>
      )}

      {/* Secret Display Alert */}
      {newKeyData && (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-3 shadow-md">
          <div className="flex items-center gap-2 font-bold text-sm">
            <span>🔑</span> New Secret API Key Generated!
          </div>
          <p className="text-xs">
            Copy this secret token immediately. For security reasons, it cannot be displayed again.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="text"
              readOnly
              value={newKeyData.secret_key}
              className="flex-1 p-2.5 bg-white border border-emerald-300 rounded-xl font-mono text-xs text-slate-800 font-bold"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(newKeyData.secret_key);
                alert("API Key copied to clipboard!");
              }}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
            >
              Copy Secret
            </button>
            <button
              onClick={() => setNewKeyData(null)}
              className="px-3 py-2.5 text-xs text-slate-500 font-bold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Create Key Card */}
      <form onSubmit={handleCreate} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            New Key Identifier / Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Daily Python Neuropathy Generator Bot"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-teal-500"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-[#0F6265] hover:bg-[#094749] text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          + Generate New Key
        </button>
      </form>

      {/* Active Keys Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-4">Key Name</th>
              <th className="p-4">Key Prefix</th>
              <th className="p-4">Permissions</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400">Loading API keys...</td>
              </tr>
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400">No API keys generated yet.</td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{k.name}</td>
                  <td className="p-4 font-mono text-slate-500">{k.prefix}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {(k.permissions || []).map((perm, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      k.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {k.is_active ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {k.is_active && (
                      <button
                        onClick={() => handleRevoke(k.id)}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg"
                      >
                        Revoke
                      </button>
                    )}
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
