import { apiRequest } from './client';

export async function getPublicProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await apiRequest(`/public/products${query ? '?' + query : ''}`);
  return res;
}

export async function getPublicProductBySlug(slug) {
  const res = await apiRequest(`/public/products/${slug}`);
  return res.data;
}

export async function getAdminProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await apiRequest(`/admin/products${query ? '?' + query : ''}`);
  return res;
}

export async function getAdminProduct(id) {
  const res = await apiRequest(`/admin/products/${id}`);
  return res.data;
}

export async function createAdminProduct(data) {
  const res = await apiRequest('/admin/products', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res.data;
}

export async function updateAdminProduct(id, data) {
  const res = await apiRequest(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return res.data;
}
