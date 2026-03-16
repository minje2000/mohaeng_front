// src/features/admin/eventstats/api/EventStatsAPI.js
import { apiJson } from '../../../../app/http/request';

const BASE = '/api/mypage/eventstats';

export const EventStatsApi = {
  // 행사 목록 (페이징 + 필터링)
  getAllEvent: (params = {}) => {
    const q = new URLSearchParams();
    if (params.keyword)    q.set('keyword',    params.keyword);
    if (params.categoryId) q.set('categoryId', params.categoryId);
    if (params.status)     q.set('status',     params.status);
    if (params.regionId)   q.set('regionId',   params.regionId);
    if (params.startDate)  q.set('startDate',  params.startDate);
    if (params.endDate)    q.set('endDate',    params.endDate);
    if (params.checkFree)  q.set('checkFree',  'true');
    if (params.hideClosed) q.set('hideClosed', 'true');
    q.set('page', params.page ?? 0);
    q.set('size', params.size ?? 10);
    return apiJson().get(`${BASE}/events?${q.toString()}`);
  },

  // 단일 행사 상세 분석
  getEventAnalysis: (eventId) =>
    apiJson().get(`${BASE}/events/${eventId}/analysis`),

  // 월별 통계
  getEventCountByMonth: (year) =>
    apiJson().get(`${BASE}/monthly?year=${year}`),

  // 카테고리별 통계 (레거시 유지)
  getEventCountByCategory: () =>
    apiJson().get(`${BASE}/category`),

  // ✅ 참여자 목록 (페이징)
  getEventParticipants: (eventId, params = {}) => {
    const q = new URLSearchParams();
    q.set('page', params.page ?? 0);
    q.set('size', params.size ?? 10);
    return apiJson().get(`${BASE}/events/${eventId}/participants?${q.toString()}`);
  },
};
