import { apiJson } from '../../../../app/http/request';

export const ParticipationApi = {
  // ✅ 마이페이지(토큰 기반)
  async getMyParticipationList() {
    const res = await apiJson().get('/api/mypage/events/participations');
    return res.data;
  },

  async submitParticipation(eventId, dto) {
    const res = await apiJson().post('/api/eventParticipation/submitParticipation', dto, {
      params: { eventId },
    });
    return res.data; // Long pctId
  },

  async cancelParticipation(pctId) {
    await apiJson().delete('/api/eventParticipation/cancelParticipation', { params: { pctId } });
  },
};
