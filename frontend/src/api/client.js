const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export function getToken() {
  return localStorage.getItem('mediclime_auth_token') || '';
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('mediclime_auth_token', token);
  } else {
    localStorage.removeItem('mediclime_auth_token');
  }
}

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  // If body is FormData, delete Content-Type to allow browser boundary calculation
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      if (res.status === 402) {
        document.body.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background-color:#f1f5f9;font-family:sans-serif;text-align:center;padding:20px;">
            <svg style="width:64px;height:64px;color:#ef4444;margin-bottom:20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <h1 style="color:#0f172a;font-size:2rem;margin-bottom:1rem;font-weight:bold;">Service Suspended</h1>
            <p style="color:#475569;font-size:1.1rem;max-width:500px;line-height:1.6;">This application's license has been suspended. Please contact the developer to resolve the outstanding payment issue.</p>
          </div>
        `;
        throw new Error("Service Suspended");
      }

      const errorMsg = data?.error?.message || data?.detail || `API Error: ${res.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.warn(`[API Call Failed: ${endpoint}]`, err.message);
    throw err;
  }
}
