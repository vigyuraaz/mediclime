import { apiRequest } from './client';

export async function getPublicSettings() {
  const res = await apiRequest('/public/settings');
  return res.data;
}

export async function getAdminSettings() {
  const res = await apiRequest('/admin/settings');
  return res.data;
}

export async function updateAdminSettings(data) {
  const res = await apiRequest('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}
