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

  // 4) 주최자 - 승인 (백엔드의 @RequestParam 주소에 맞게 수정)
  async approveBooth(pctBoothId) {
    const res = await apiJson().put(
      `/api/eventParticipation/approveBooth?pctBoothId=${pctBoothId}`
    );
    return res.data;
  },

  // 5) 주최자 - 반려 (백엔드의 @RequestParam 주소에 맞게 수정)
  async rejectBooth(pctBoothId) {
    const res = await apiJson().put(
      `/api/eventParticipation/rejectBooth?pctBoothId=${pctBoothId}`
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
    
    // ✅ Blob 대신 일반 String으로 전송 → 백엔드 @RequestParam("data")로 수신
    formData.append('data', JSON.stringify(data));
    
    if (files && files.length > 0) {
      files.forEach((file) => formData.append('files', file));
    }
    
    const response = await apiForm().post(
      `/api/eventParticipation/submitBoothApply?eventId=${eventId}`,
      formData
    );
    return response.data;
  },

  // 5. 부스 참가 취소 (params 객체 대신 URL에 직접 파라미터로 붙이도록 수정)
  async cancelBoothParticipation(pctBoothId) {
    const res = await apiJson().delete(
      `/api/eventParticipation/cancelBoothParticipation?pctBoothId=${pctBoothId}`
    );
    return res.data;
  },
};