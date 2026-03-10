import { useCallback, useEffect, useMemo, useState } from 'react';
import { ParticipationBoothApi } from '../api/ParticipationBoothAPI';

function formatDateTime(v) {
  if (!v) return '-';
  const s = String(v).replace('T', ' ');
  return s.length > 19 ? s.slice(0, 19) : s;
}

export default function UseBoothMypage(page, size) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ParticipationBoothApi.getMyParticipationBoothList(page, size);
      const arr = Array.isArray(res) ? res : (Array.isArray(res?.content) ? res.content : []);
      
      // ✅ '취소' 상태인 데이터를 목록에서 아예 제외(필터링)한 뒤 가공합니다.
      const normalized = arr
        .filter((x) => x.status !== '취소' && x.status !== 'CANCEL') // 영문 상태값 방어코드 포함
        .map((x) => ({
          ...x,
          _createdAtText: formatDateTime(x.createdAt),
        }));
        
      setItems(normalized);
    } finally {
      setLoading(false);
    }
  }, [page, size]); // ← page, size 의존성 추가

  useEffect(() => {
    reload();
  }, [reload]);

  const totalPages = useMemo(() => {
    const n = items.length;
    return Math.max(1, Math.ceil(n / size));
  }, [items.length, size]);

  const paged = useMemo(() => {
    const start = (page - 1) * size;
    return items.slice(start, start + size);
  }, [items, page, size]);

  return { items: paged, totalPages, loading, reload };
}