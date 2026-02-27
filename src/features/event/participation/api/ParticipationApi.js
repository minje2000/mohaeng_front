import { apiJson } from '../../../../app/http/request';

const BASE_URL = '/api/eventParticipation';

// 1. 행사 정보 가져오기 (수정된 /info 경로 사용)
export const getEventParticipationInfo = async (eventId) => {
  if (!eventId || eventId === '...') return null;
  const response = await apiJson().get(`${BASE_URL}/info/${eventId}`);
  return response.data; // { eventInfo, booths, facilities ... }
};

// 2. 내 프로필 정보 가져오기 (자동완성용)
export const getMyProfile = async () => {
  const response = await apiJson().get('/api/user/me'); // EventHost.jsx와 동일한 경로
  return response.data?.data || response.data;
};

// 3. 신청서 제출 (최종)
export const submitParticipation = async (eventId, data) => {
  const response = await apiJson().post(`${BASE_URL}/submitParticipation?eventId=${eventId}`, data);
  return response.data;
};
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
