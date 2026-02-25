import { apiJson } from '../../../../app/http/request';

export const InquiryApi = {
  async list(eventId) {
    const res = await apiJson().get('/api/eventInquiry/list', {
      params: { eventId },
    });
    return res.data;
  },

  async createInquiry(eventId, dto) {
    const res = await apiJson().post('/api/eventInquiry/createInquiry', dto, {
      params: { eventId },
    });
    return res.data; // Long (inqId)
  },

  async updateInquiry(inqId, dto) {
    await apiJson().put('/api/eventInquiry/updateInquiry', dto, {
      params: { inqId },
    });
  },

  async deleteInquiry(inqId) {
    await apiJson().delete('/api/eventInquiry/deleteInquiry', {
      params: { inqId },
    });
  },

  async createReply(inqId, dto) {
    await apiJson().post('/api/eventInquiry/createReply', dto, {
      params: { inqId },
    });
  },

  async updateReply(inqId, dto) {
    await apiJson().put('/api/eventInquiry/updateReply', dto, {
      params: { inqId },
    });
  },

  async deleteReply(inqId) {
    await apiJson().delete('/api/eventInquiry/deleteReply', {
      params: { inqId },
    });
  },

  // ✅ 마이페이지 문의 목록(전체/작성/받은)
  async mypage({ tab = 'ALL', page = 1, size = 5 } = {}) {
    const res = await apiJson().get('/api/eventInquiry/mypage', {
      params: { tab, page: Math.max(0, page - 1), size },
    });
    return res.data; // { items, page, size, totalPages, totalElements }
  },
};
