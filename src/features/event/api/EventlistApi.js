import { apiJson } from '../../../app/http/request';
import qs from 'qs';

export const fetchEventList = async (params) => {
  try {
    const response = await apiJson().get('/api/events/search', {
      params,
      paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' })
    });
    
    return response.data;
  } catch (error) {
    console.error('이벤트 목록 호출 중 에러:', error);
    throw error;
  }
};

export const fetchRecommendEvents = async () => {
    const response = await apiJson().get('/api/events/recommend');
    return response.data;
};

