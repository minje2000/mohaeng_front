import { useCallback, useState } from "react";
import { notificationApi } from "../api/notificationApi";

export default function useNotificationList() {
  const [items, setItems] = useState([]);
  const [pageResponse, setPageResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //  all 전달 가능
  const fetchList = useCallback(async ({ page = 0, size = 5, all = false } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const data = await notificationApi.list({ page, size, all });
      const list = data?.content ?? data?.items ?? data?.list ?? [];

      setItems(Array.isArray(list) ? list : []);
      setPageResponse(data);
      return data;
    } catch (e) {
      setError(e);
      setItems([]);
      setPageResponse(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { items, setItems, pageResponse, loading, error, fetchList };
}