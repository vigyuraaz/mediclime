import { apiRequest } from './client';

export async function getDashboardStats() {
  const res = await apiRequest('/admin/overview/stats');
  return res.data;
}

export async function generateArticleAI(data) {
  const res = await apiRequest('/ai/articles/generate', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res.data;
}

export async function generateProductAI(data) {
  const res = await apiRequest('/ai/products/generate', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res.data;
}

export async function getAIJobStatus(jobId) {
  const res = await apiRequest(`/ai/jobs/${jobId}`);
  return res.data;
}

export async function getAISettings() {
  const res = await apiRequest('/ai/settings');
  return res.data;
}

export async function updateAISettings(data) {
  const res = await apiRequest('/ai/settings', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return res.data;
}

export async function getApiKeys() {
  const res = await apiRequest('/admin/api-keys');
  return res.data;
}

export async function createApiKey(data) {
  const res = await apiRequest('/admin/api-keys', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res.data;
}

export async function revokeApiKey(keyId) {
  const res = await apiRequest(`/admin/api-keys/${keyId}`, {
    method: 'DELETE'
  });
  return res.data;
}

export async function getMediaLibrary(page = 1, pageSize = 24) {
  const res = await apiRequest(`/media?page=${page}&page_size=${pageSize}`);
  return res;
}

export async function uploadMediaFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiRequest('/media', {
    method: 'POST',
    body: formData
  });
  return res.data;
}

export async function deleteMediaFile(id) {
  const res = await apiRequest(`/media/${id}`, {
    method: 'DELETE'
  });
  return res.data;
}
