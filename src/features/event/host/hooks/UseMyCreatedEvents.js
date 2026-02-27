import { useCallback, useEffect, useState } from 'react';
import { MypageEventApi } from '../api/MypageEventApi';

export default function UseMyCreatedEvents(page, size) {
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MypageEventApi.getMyCreatedEvents(page, size);
      setItems(Array.isArray(data?.items) ? data.items : []);
      setTotalPages(Number(data?.totalPages || 1));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, totalPages, loading, error, reload };
}
