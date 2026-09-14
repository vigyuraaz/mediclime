import { apiRequest } from './client';

export async function getPublicArticles(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await apiRequest(`/public/articles${query ? '?' + query : ''}`);
  return res;
}

export async function getPublicArticleBySlug(slug) {
  const res = await apiRequest(`/public/articles/${slug}`);
  return res.data;
}

export async function getAdminArticles(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await apiRequest(`/admin/articles${query ? '?' + query : ''}`);
  return res;
}

export async function getAdminArticle(id) {
  const res = await apiRequest(`/admin/articles/${id}`);
  return res.data;
}

export async function createAdminArticle(data) {
  const res = await apiRequest('/admin/articles', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res.data;
}

export async function updateAdminArticle(id, data) {
  const res = await apiRequest(`/admin/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return res.data;
}

export async function publishAdminArticle(id) {
  const res = await apiRequest(`/admin/articles/${id}/publish`, {
    method: 'POST'
  });
  return res.data;
}

export async function unpublishAdminArticle(id) {
  const res = await apiRequest(`/admin/articles/${id}/unpublish`, {
    method: 'POST'
  });
  return res.data;
}

export async function deleteAdminArticle(id) {
  const res = await apiRequest(`/admin/articles/${id}`, {
    method: 'DELETE'
  });
  return res.data;
}
