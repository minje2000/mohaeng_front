// src/features/event/host/api/EventHostAPI.js
import { apiJson } from '../../../../app/http/request';
import { tokenStore } from '../../../../app/http/tokenStore';

/**
 * 행사 생성
 * POST /api/events (multipart/form-data)
 */
export async function createEvent({ eventData, thumbnail, detailFiles = [], boothFiles = [] }) {
  const formData = new FormData();
  formData.append(
    'eventData',
    new Blob([JSON.stringify(eventData)], { type: 'application/json' })
  );
  if (thumbnail)           formData.append('thumbnail',   thumbnail);
  detailFiles.forEach(f => formData.append('detailFiles', f));
  boothFiles.forEach(f  => formData.append('boothFiles',  f));

  const token = tokenStore.getAccess();
  const res = await fetch('/api/events', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || `서버 오류 (${res.status})`);
  return json;
}

/**
 * 행사 삭제(상태변경)
 * PUT /api/events/{eventId}
 */
export async function deleteEvent(eventId) {
  const res = await apiJson().put(`/api/events/${eventId}`);
  return res.data;
}

/**
 * AI 태그 추천
 * POST /api/events/suggest-tags
 */
export async function suggestTags({ title, description, thumbnail = null }) {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description || '');
  if (thumbnail) formData.append('thumbnail', thumbnail);

  const token = tokenStore.getAccess();
  const res = await fetch('/api/events/suggest-tags', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || 'AI 분석에 실패했어요.');
  return json;
}
