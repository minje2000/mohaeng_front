// src/features/notification/api/notificationApi.js
import { apiJson } from "../../../app/http/request";

// ApiResponse { success, message, data, timestamp } 래핑 벗기기
const unwrap = (resData) => resData?.data ?? resData;

// axios 에러를 백엔드 응답 객체로 throw
function throwBackend(error) {
  if (error?.response?.data) throw error.response.data;
  throw error;
}

export const notificationApi = {
  // ✅ all=true 지원
  async list({ page = 0, size = 5, all = false } = {}) {
    try {
      const params = all ? { all: true } : { page, size };
      const res = await apiJson().get("/api/notifications", { params });
      return unwrap(res.data);
    } catch (error) {
      throwBackend(error);
    }
  },

  async count() {
    try {
      const res = await apiJson().get("/api/notifications/count");
      return unwrap(res.data);
    } catch (error) {
      throwBackend(error);
    }
  },

  // 읽음 = 삭제
  async read(notificationId) {
    try {
      const res = await apiJson().delete(`/api/notifications/${notificationId}`);
      return unwrap(res.data);
    } catch (error) {
      throwBackend(error);
    }
  },

  // 전체읽음 = 전체삭제
  async readAll() {
    try {
      const res = await apiJson().delete("/api/notifications");
      return unwrap(res.data);
    } catch (error) {
      throwBackend(error);
    }
  },
};