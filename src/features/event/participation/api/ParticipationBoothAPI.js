import { apiForm, apiJson } from '../../../../app/http/request';

export const ParticipationBoothApi = {
  // 1) 마이페이지 - 내가 신청한 부스 목록
  async getMyAppliedBoothList() {
    const res = await apiJson().get('/api/mypage/events/booths');
    return res.data;
  },

  // 2) 마이페이지 - 내가 주최한 행사에서 받은 부스 목록
  async getMyReceivedBoothList() {
    const res = await apiJson().get('/api/mypage/events/booths/received');
    return res.data;
  },

  // 3) 마이페이지 - 부스 신청서 상세(주최자 or 신청자만)
  async getBoothApplicationDetail(pctBoothId) {
    const res = await apiJson().get(`/api/mypage/events/booths/${pctBoothId}`);
    return res.data;
  },

  // 4) 주최자 - 승인
  async approveBooth(pctBoothId) {
    const res = await apiJson().put(
      `/api/mypage/events/booths/${pctBoothId}/approve`
    );
    return res.data;
  },

  // 5) 주최자 - 반려(환불 연동 지점은 백엔드 TODO)
  async rejectBooth(pctBoothId) {
    const res = await apiJson().put(
      `/api/mypage/events/booths/${pctBoothId}/reject`
    );
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