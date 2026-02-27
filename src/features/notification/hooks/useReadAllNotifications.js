import { useState } from "react";
import { notificationApi } from "../api/notificationApi";

export default function useReadAllNotifications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const readAll = async () => {
    try {
      setLoading(true);
      setError(null);
      await notificationApi.readAll();
      // ✅ 성공이면 그냥 끝 (return 불필요)
    } catch (e) {
      setError(e);
      throw e; // ✅ 실패는 throw로 통일
    } finally {
      setLoading(false);
    }
  };

  return { readAll, loading, error };
}