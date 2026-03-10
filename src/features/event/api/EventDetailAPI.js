import { apiJson } from '../../../app/http/request';

/**
 * 행사 상세 정보 조회
 * GET /api/events/{eventId}
 * 응답: EventDetailDto { eventInfo, hostName, hostEmail, hostPhone, booths, facilities }
 */
export const fetchEventDetail = async (eventId) => {
  try {
    const response = await apiJson().get(`/api/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('행사 상세 정보 로딩 실패:', error);
    throw error;
  }
};
