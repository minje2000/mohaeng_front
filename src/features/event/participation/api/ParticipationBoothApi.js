// src/features/participation/api/ParticipationBoothApi.js
import { apiForm, apiJson } from '../../../../app/http/request'; 

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
// 1. 행사 상세 정보 + 부스/시설 정보 불러오기 (기존 상세페이지 API 재활용!)
export const getBoothApplicationInfo = async (eventId) => {
    const response = await apiJson().get(`/api/events/${eventId}`);
    return response.data;
};

// 2. 현재 로그인한 내 정보 불러오기 (신청자 프로필용)
export const getMyProfile = async () => {
    const response = await apiJson().get('/api/user/me');
    // ApiResponse 구조에서 실제 유저 데이터(data)만 꺼내서 반환
    return response.data?.data || response.data; 
};

// 3. 부스 참가 신청 (최종 제출) - 기존과 동일
export const submitBoothApplication = async (eventId, data, files) => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (files && files.length > 0) {
        files.forEach((file) => formData.append('files', file));
    }
    const response = await apiForm().post(`/api/eventParticipation/submitBoothApply?eventId=${eventId}`, formData);
    return response.data;
};