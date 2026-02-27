import { apiForm, apiJson } from '../../../../app/http/request';

export const ParticipationBoothApi = {
  // 1. 마이페이지 부스 목록
  async getMyParticipationBoothList() {
    const res = await apiJson().get('/api/mypage/events/booths');
    return res.data;
  },
  // 2. 행사/부스 정보 로딩
  async getBoothApplicationInfo(eventId) {
    const response = await apiJson().get(`/api/events/${eventId}`);
    return response.data;
  },
  // 3. 내 프로필 정보
  async getMyProfile() {
    const response = await apiJson().get('/api/user/me');
    return response.data?.data || response.data;
  },
  // 4. 부스 신청 제출
  async submitBoothApplication(eventId, data, files) {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (files && files.length > 0) {
      files.forEach((file) => formData.append('files', file));
    }
    const response = await apiForm().post(`/api/eventParticipation/submitBoothApply?eventId=${eventId}`, formData);
    return response.data;
  },
  // 5. 부스 참가 취소
  async cancelBoothParticipation(pctBoothId) {
    const res = await apiJson().delete(
      '/api/eventParticipation/cancelBoothParticipation',
      {
        params: { pctBoothId },
      }
    );
    return res.data;
  },
};