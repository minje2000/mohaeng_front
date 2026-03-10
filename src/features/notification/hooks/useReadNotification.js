import { useState } from "react";
import { notificationApi } from "../api/notificationApi";

export default function useReadNotification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const read = async (notificationId) => {
    try {
      setLoading(true);
      setError(null);
      await notificationApi.read(notificationId);
      // ✅ 성공이면 그냥 끝
    } catch (e) {
      setError(e);
      throw e; // ✅ 실패는 throw로 통일
    } finally {
      setLoading(false);
    }
  };

  return { read, loading, error };
}