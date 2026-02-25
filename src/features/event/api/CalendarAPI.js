import { apiJson } from '../../../app/http/request'; // 💡 중괄호{} 로 감싸서 apiJson을 가져옵니다!

// 지역별 날짜별 행사 개수 조회
// regionId: 시/도 단위 ID (ex. 1100000000)
export const fetchCalendarCounts = async (regionId) => {
  try {
    // 💡 apiJson() 함수를 실행하고, 파라미터는 { params: { ... } } 형태로 보내야 합니다.
    const response = await apiJson().get('/api/events/calendar-counts', { 
      params: { regionId } 
    });
    return response.data; // [{ startDate: "2026-03-15", count: 3 }, ...]
  } catch (error) {
    console.error('달력 데이터 로딩 실패:', error);
    throw error;
  }
};
