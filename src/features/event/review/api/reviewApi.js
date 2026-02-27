// src/features/event/review/api/reviewApi.js
import { tokenStore } from '../../../../app/http/tokenStore';

const API_BASE = process.env.REACT_APP_API_BASE_URL || '';

function normalizeAccessToken(raw) {
  if (!raw) return '';
  return String(raw)
    .trim()
    .replace(/^Bearer\s+/i, '')
    .replace(/\s+/g, '');
}

function buildHeaders(extra = {}) {
  const headers = { ...extra };
  const rawAccess = tokenStore.getAccess?.();
  const access = normalizeAccessToken(rawAccess);
  if (access) headers.Authorization = `Bearer ${access}`;
  return headers;
}

async function request(path, { method = 'GET', params, body, headers } = {}) {
  const url = new URL(API_BASE + path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }

  const res = await fetch(url.toString().replace(window.location.origin, ''), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || (json && json.success === false)) {
    const msg = json?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return json?.data ?? json;
}

function pickPageContent(pageData) {
  if (!pageData) return [];
  return pageData.content || pageData.items || pageData.list || pageData.records || [];
}

export async function fetchMyReviews({ page = 0, size = 10 } = {}) {
  const data = await request(`/api/users/reviews`, {
    params: { page, size },
    headers: buildHeaders(),
  });
  return { raw: data, items: pickPageContent(data) };
}

export async function fetchEventReviews(eventId, { page = 0, size = 10 } = {}) {
  const data = await request(`/api/events/${eventId}/reviews`, {
    params: { page, size },
    headers: buildHeaders(),
  });
  return { raw: data, items: pickPageContent(data) };
}

export async function fetchMyReviewForEvent(eventId) {
  const data = await request(`/api/events/${eventId}/reviews/my`, {
    headers: buildHeaders(),
  });
  if (!data || !data.reviewId) return null;
  return data;
}

export async function createReview(payload) {
  await request(`/api/reviews`, {
    method: 'POST',
    headers: buildHeaders(),
    body: payload,
  });
}

export async function updateReview(reviewId, payload) {
  await request(`/api/reviews/${reviewId}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: payload,
  });
}

export async function deleteReview(reviewId) {
  await request(`/api/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
}