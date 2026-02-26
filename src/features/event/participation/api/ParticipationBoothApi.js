import { apiJson } from '../../../../app/http/request';

export const ParticipationBoothApi = {
  // ✅ 마이페이지(토큰 기반)
  async getMyParticipationBoothList() {
    const res = await apiJson().get('/api/mypage/events/booths');
    return res.data;
  },

  async submitBoothApply(eventId, dto) {
    const res = await apiJson().post('/api/eventParticipation/submitBoothApply', dto, {
      params: { eventId },
    });
    return res.data; // Long pctBoothId
  },

  async cancelBoothParticipation(pctBoothId) {
    await apiJson().delete('/api/eventParticipation/cancelBoothParticipation', {
      params: { pctBoothId },
    });
  },
};
