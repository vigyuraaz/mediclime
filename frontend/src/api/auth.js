import { apiRequest, setToken } from './client';

export async function loginUser(email, password) {
  const res = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (res?.data?.access_token) {
    setToken(res.data.access_token);
  }
  return res.data;
}

export async function getCurrentUser() {
  const res = await apiRequest('/auth/me');
  return res.data;
}

export async function logoutUser() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } finally {
    setToken('');
  }
}
