import { useEffect, useMemo, useRef, useState } from 'react';
import { InquiryApi } from '../api/InquiryApi';
import { fetchEventDetail } from '../../api/EventDetailAPI';

export default function UseMyInquiryList(tab, page, size) {
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [counts, setCounts] = useState({ all: 0, written: 0, received: 0 });

  const [loading, setLoading] = useState(false);
  const [countLoading, setCountLoading] = useState(false);
  const [error, setError] = useState(null);

  const [eventSimpleExplainById, setEventSimpleExplainById] = useState({});
  const fetchingRef = useRef(new Set());
  const cachedIdsRef = useRef(new Set());

  // ✅ 현재 탭의 페이지 데이터
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

  // ✅ 현재 페이지의 행사 설명 보강(캐시)
  // ✅ 삭제된 행사(DELETED/REPORTDELETED)는 fetchEventDetail 호출 제외
  useEffect(() => {
  let mounted = true;

  const DELETED_STATUSES = ['DELETED', 'REPORTDELETED', 'report_deleted'];

  const ids = Array.from(
    new Set(
      (items ?? [])
        .filter((it) => it?.eventId && !DELETED_STATUSES.includes(
          (it?.eventStatus ?? '').toString().toUpperCase().replace('_', '')
        ))
        .map((it) => it.eventId)
    )
  );

  const need = ids.filter(
    (id) => !cachedIdsRef.current.has(id) && !fetchingRef.current.has(id)
  );
  if (need.length === 0) return;

  (async () => {
    try {
      need.forEach((id) => fetchingRef.current.add(id));

      const results = await Promise.all(
        need.map(async (eventId) => {
          try {
            const detail = await fetchEventDetail(eventId);
            const ev = detail?.eventInfo ?? detail?.data?.eventInfo ?? detail?.data ?? detail;
            const simpleExplain =
              ev?.simpleExplain ?? ev?.SIMPLE_EXPLAIN ?? ev?.eventSimpleExplain ?? '';
            return { eventId, simpleExplain: (simpleExplain ?? '').toString().trim() };
          } catch (e) {
            return { eventId, simpleExplain: '' };
          }
        })
      );

      if (!mounted) return;

      need.forEach((id) => cachedIdsRef.current.add(id)); // ← 캐시에 추가

      setEventSimpleExplainById((prev) => {
        const next = { ...(prev || {}) };
        results.forEach(({ eventId, simpleExplain }) => {
          if (simpleExplain) next[eventId] = simpleExplain;
        });
        return next;
      });
    } finally {
      need.forEach((id) => fetchingRef.current.delete(id));
    }
  })();

  return () => { mounted = false; };
}, [items]); 

  // ✅ 탭 카운트(전체/작성/받은)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setCountLoading(true);
        const [all, written, received] = await Promise.all([
          InquiryApi.mypage({ tab: 'ALL', page: 1, size: 1 }),
          InquiryApi.mypage({ tab: 'WRITTEN', page: 1, size: 1 }),
          InquiryApi.mypage({ tab: 'RECEIVED', page: 1, size: 1 }),
        ]);
        if (!mounted) return;
        setCounts({
          all: all?.totalElements ?? 0,
          written: written?.totalElements ?? 0,
          received: received?.totalElements ?? 0,
        });
      } catch (e) {
        // 카운트 실패는 치명적이지 않아서 목록 error에 합치지 않음
      } finally {
        if (!mounted) return;
        setCountLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const countsByTab = useMemo(() => {
    return {
      ALL: counts.all,
      WRITTEN: counts.written,
      RECEIVED: counts.received,
    };
  }, [counts]);

  return {
    items,
    totalPages,
    totalElements,
    countsByTab,
    loading,
    countLoading,
    error,
    eventSimpleExplainById,
  };
}
