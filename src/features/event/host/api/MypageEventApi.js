import { apiJson } from '../../../../app/http/request';

export const MypageEventApi = {
  async getMyCreatedEvents(page = 1, size = 5) {
    // backend는 0-based
    const res = await apiJson().get('/api/mypage/events/created', {
      params: { page: Math.max(0, page - 1), size },
    });
    return res.data;
  },

  // ✅ 소프트 삭제 (DB eventStatus = 'DELETED')
  async deleteMyCreatedEvent(eventId) {
    await apiJson().put(`/api/mypage/events/created/${eventId}/delete`);
  },
};
