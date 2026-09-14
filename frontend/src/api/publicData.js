import { apiRequest } from './client';

export async function getPublicConditions() {
  const res = await apiRequest('/public/conditions');
  return res.data;
}

export async function getPublicConditionBySlug(slug) {
  const res = await apiRequest(`/public/conditions/${slug}`);
  return res.data;
}

export async function getPublicAuthors() {
  const res = await apiRequest('/public/authors');
  return res.data;
}

export async function getPublicAuthorBySlug(slug) {
  const res = await apiRequest(`/public/authors/${slug}`);
  return res.data;
}

export async function getPublicCategories() {
  const res = await apiRequest('/public/categories');
  return res.data;
}

export async function searchAll(query) {
  const res = await apiRequest(`/public/search?q=${encodeURIComponent(query)}`);
  return res.data;
}

export async function subscribeNewsletter(email) {
  return await apiRequest('/public/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export async function submitContactForm(data) {
  return await apiRequest('/public/contact', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
