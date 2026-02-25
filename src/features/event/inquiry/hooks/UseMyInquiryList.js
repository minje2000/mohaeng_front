import { useEffect, useState } from 'react';
import { InquiryApi } from '../api/InquiryApi';

export default function UseMyInquiryList(tab, page, size) {
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await InquiryApi.mypage({ tab, page, size });
        if (!mounted) return;
        setItems(data?.items ?? []);
        setTotalPages(data?.totalPages ?? 0);
        setTotalElements(data?.totalElements ?? 0);
      } catch (e) {
        if (!mounted) return;
        setError(e);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [tab, page, size]);

  return { items, totalPages, totalElements, loading, error };
}
