import axiosInstance from "./axiosInstance";
const request = {
    // GET 요청 시 url과 함께 params(쿼리스트링 데이터)를 받을 수 있도록 세팅합니다.
    get: (url, params) => axiosInstance.get(url, { params }),
    post: (url, data) => axiosInstance.post(url, data),
    put: (url, data) => axiosInstance.put(url, data),
    delete: (url) => axiosInstance.delete(url),
};

export default request;