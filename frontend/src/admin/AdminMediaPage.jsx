import React, { useState, useEffect } from 'react';
import { getMediaLibrary, uploadMediaFile, deleteMediaFile } from '../api/adminServices';

export default function AdminMediaPage() {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await getMediaLibrary();
      setMediaItems(res?.data || []);
    } catch (err) {
      console.warn("Failed to load media", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg('');
    try {
      await uploadMediaFile(file);
      setMsg("Media file successfully uploaded and verified.");
      loadMedia();
    } catch (err) {
      setMsg(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this media item?")) return;
    try {
      await deleteMediaFile(id);
      setMsg("Media removed.");
      loadMedia();
    } catch (err) {
      setMsg(`Delete failed: ${err.message}`);
    }
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setMsg("Media URL copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#094749] tracking-tight font-sans">
            Visual Media Library
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Upload, inspect dimensions, and attach medical illustrations and photography.
          </p>
        </div>

        <div>
          <label className="px-4 py-2.5 rounded-xl bg-[#0F6265] hover:bg-[#094749] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer inline-block">
            {uploading ? 'Uploading...' : '+ Upload New Image'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800 flex justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-teal-600 font-bold">✕</button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading media assets...</div>
      ) : mediaItems.length === 0 ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 text-xs">
          No media uploaded yet. Use the upload button above to add clinical illustrations.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mediaItems.map((item) => (
            <div key={item.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-teal-400 transition-all flex flex-col justify-between">
              <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden p-2">
                <img
                  src={item.url}
                  alt={item.filename}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="p-2.5 text-[11px] space-y-1 bg-slate-50 border-t border-slate-100">
                <p className="font-bold text-slate-800 truncate" title={item.filename}>
                  {item.filename}
                </p>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{item.width ? `${item.width}x${item.height}` : 'Vector/Raster'}</span>
                  <span>{Math.round(item.file_size / 1024)} KB</span>
                </div>
                <div className="pt-1.5 flex gap-1 border-t border-slate-200">
                  <button
                    onClick={() => handleCopy(item.url)}
                    className="flex-1 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 bg-rose-50 text-rose-600 rounded text-[10px] font-bold hover:bg-rose-100"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
