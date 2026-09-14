import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../api/auth';
import { getToken } from '../api/client';
import { useSiteSettings } from '../context/SiteContext';

export default function AdminLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();

  useEffect(() => {
    async function checkAuth() {
      const token = getToken();
      if (!token && location.pathname !== '/admin/login') {
        navigate('/admin/login');
        return;
      }
      try {
        const profile = await getCurrentUser();
        setUser(profile);
      } catch {
        if (location.pathname !== '/admin/login') {
          navigate('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [location.pathname, navigate]);

  if (location.pathname === '/admin/login') {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        Authenticating CMS...
      </div>
    );
  }

  const handleLogout = async () => {
    await logoutUser();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin', icon: '📊' },
    { label: 'Articles CMS', path: '/admin/articles', icon: '📝' },
    { label: 'Products & Facts', path: '/admin/products', icon: '💊' },
    { label: 'Media Library', path: '/admin/media', icon: '🖼️' },
    { label: 'AI Content Engine', path: '/admin/ai', icon: '🤖' },
    { label: 'API Keys', path: '/admin/api-keys', icon: '🔑' },
    { label: 'Site Settings', path: '/admin/settings', icon: '⚙️' },
  ];

  const brandInitial = (settings.site_name || 'M')[0].toUpperCase();

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-800 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#094749] text-white flex flex-col justify-between shrink-0 shadow-xl">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-teal-800/80 flex items-center gap-3">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="w-9 h-9 object-contain rounded-xl bg-white/10 p-1" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#178589] to-[#0F6265] flex items-center justify-center text-white font-bold">
                {brandInitial}
              </div>
            )}
            <div>
              <span className="text-lg font-extrabold tracking-tight block leading-none uppercase">
                {settings.site_name || 'MEDICLIME'}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#FF6B6B] font-bold block mt-1">
                Control CMS
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1 text-xs font-semibold">
            {navItems.map((item) => {
              const active = item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    active
                      ? 'bg-[#0F6265] text-white shadow-xs font-bold'
                      : 'text-slate-300 hover:bg-teal-900/60 hover:text-white'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Public Site Link */}
        <div className="p-4 border-t border-teal-800/60 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-teal-950/60 hover:bg-teal-950 text-teal-200 text-xs font-bold border border-teal-800/50 transition-colors"
          >
            <span>🌐 View Public Site</span>
            <span>↗</span>
          </Link>

          <div className="flex items-center justify-between pt-2 text-xs">
            <div className="truncate pr-2">
              <span className="font-bold block truncate">{user?.name || 'Admin'}</span>
              <span className="text-[10px] text-teal-300 uppercase tracking-wider">{user?.role || 'editor'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-rose-300 hover:text-rose-100 text-xs font-bold shrink-0"
              title="Logout"
            >
              Sign Out
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">
            Mediclime Clinical Publishing System • Production Ready
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              FastAPI API Online
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
