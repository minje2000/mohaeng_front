import { apiJson } from '../../../app/http/request';

export const fetchEventList = async (params) => {
  try {
    const response = await apiJson().get('/api/events/search', { params });
    
    return response.data;
  } catch (error) {
    console.error('이벤트 목록 호출 중 에러:', error);
    throw error;
  }
};