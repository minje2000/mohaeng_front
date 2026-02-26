// src/features/event/participation/api/ParticipationBoothApi.js
import { apiForm, apiJson } from '../../../../app/http/request';

// ✅ 마이페이지(토큰 기반) - 부스 참여 목록
export const getMyParticipationBoothList = async () => {
  const res = await apiJson().get('/api/mypage/events/booths');
  return res.data;
};

// ✅ 부스 신청 제출(최종) - DTO만 보내는 버전
export const submitBoothApply = async (eventId, dto) => {
  const res = await apiJson().post(
    '/api/eventParticipation/submitBoothApply',
    dto,
    {
      params: { eventId },
    }
  );
  return res.data; // Long pctBoothId
};

// ✅ 1. 행사 상세 정보 + 부스/시설 정보
export const getBoothApplicationInfo = async (eventId) => {
  const response = await apiJson().get(`/api/events/${eventId}`);
  return response.data;
};

// ✅ 2. 현재 로그인한 내 정보
export const getMyProfile = async () => {
  const response = await apiJson().get('/api/user/me');
  return response.data?.data || response.data;
};

// ✅ 3. 부스 참가 신청 (파일 포함 form-data)
export const submitBoothApplication = async (eventId, data, files) => {
  const formData = new FormData();
  formData.append(
    'data',
    new Blob([JSON.stringify(data)], { type: 'application/json' })
  );

  if (files && files.length > 0) {
    files.forEach((file) => formData.append('files', file));
  }

  const response = await apiForm().post(
    `/api/eventParticipation/submitBoothApply?eventId=${eventId}`,
    formData
  );
  return response.data;
};

// ✅ 부스 참여(신청) 취소
export const cancelBoothParticipation = async (pctBoothId) => {
  const res = await apiJson().delete(
    '/api/eventParticipation/cancelBoothParticipation',
    {
      params: { pctBoothId },
    }
  );
  return res.data;
};
