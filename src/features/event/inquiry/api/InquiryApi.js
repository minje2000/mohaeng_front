import { apiJson } from '../../../../app/http/request';

function unwrap(res) {
  const body = res?.data;
  // ✅ ApiResponse 래핑이면 body.data를 사용
  if (body && typeof body === 'object' && 'data' in body) return body.data;
  // ✅ 래핑이 아니면 body 그대로 사용
  return body;
}

export const InquiryApi = {
  async list(eventId) {
    const res = await apiJson().get('/api/eventInquiry/list', {
      params: { eventId: Number(eventId) },
    });
    return unwrap(res); // ✅ List<EventInquiryDto>
  },

  async createInquiry(eventId, dto) {
    const res = await apiJson().post('/api/eventInquiry/createInquiry', dto, {
      params: { eventId: Number(eventId) },
    });
    return unwrap(res); // ✅ inqId 또는 ApiResponse.data
  },

  async updateInquiry(inqId, dto) {
    await apiJson().put('/api/eventInquiry/updateInquiry', dto, {
      params: { inqId: Number(inqId) },
    });
  },

  async deleteInquiry(inqId) {
    await apiJson().delete('/api/eventInquiry/deleteInquiry', {
      params: { inqId: Number(inqId) },
    });
  },

  async createReply(inqId, dto) {
    await apiJson().post('/api/eventInquiry/createReply', dto, {
      params: { inqId: Number(inqId) },
    });
  },

  async updateReply(inqId, dto) {
    await apiJson().put('/api/eventInquiry/updateReply', dto, {
      params: { inqId: Number(inqId) },
    });
  },

  async deleteReply(inqId) {
    await apiJson().delete('/api/eventInquiry/deleteReply', {
      params: { inqId: Number(inqId) },
    });
  },

  async mypage({ tab = 'ALL', page = 1, size = 5 } = {}) {
    const res = await apiJson().get('/api/eventInquiry/mypage', {
      params: { tab, page: Math.max(0, page - 1), size },
    });
    return unwrap(res); // ✅ { items, page, size, totalPages, totalElements }
  },
};
