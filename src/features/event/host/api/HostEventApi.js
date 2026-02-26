import { apiJson } from '../../../../app/http/request';

function unwrap(res) {
  const body = res?.data;
  if (body && typeof body === 'object' && 'data' in body) return body.data;
  return body;
}

export const HostEventApi = {
  // ✅ 토큰 기반: 내가 등록한 행사 목록
  async myEvents({ page = 1, size = 5 } = {}) {
    const res = await apiJson().get('/api/events/mine', {
      params: { page: Math.max(0, page - 1), size },
    });
    return unwrap(res); // { items, page, size, totalPages, totalElements }
  },
};
