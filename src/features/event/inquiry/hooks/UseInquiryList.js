import { useCallback, useEffect, useState } from 'react';
import { InquiryApi } from '../api/InquiryApi';

export default function UseInquiryList({ eventId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await InquiryApi.list(eventId); // ✅ 숫자만 전달
      setItems(res ?? []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { items, loading, error, refetch };
}
