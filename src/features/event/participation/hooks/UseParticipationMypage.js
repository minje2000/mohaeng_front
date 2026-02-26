import { useCallback, useEffect, useState } from 'react';
import { ParticipationApi } from '../api/ParticipationApi';
import { fetchEventDetail } from '../../api/EventDetailAPI';

/**
 * 마이페이지 - 행사 참여 내역
 * - 참여 DTO는 eventId만 내려오므로, 리스트 UI에서 필요한 행사(제목/기간/썸네일 등)는 event detail로 보강한다.
 */
export default function UseParticipationMypage() {
  const [participations, setParticipations] = useState([]);
  const [eventMap, setEventMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await ParticipationApi.getMyParticipationList();
      const arr = Array.isArray(list) ? list : [];
      setParticipations(arr);

      // ✅ eventId 별로 행사 상세 로딩(중복/재요청 방지)
      const eventIds = Array.from(new Set(arr.map((p) => p?.eventId).filter(Boolean)));
      const missing = eventIds.filter((id) => !(id in eventMap));

      if (missing.length) {
        const pairs = await Promise.all(
          missing.map(async (id) => {
            try {
              const detail = await fetchEventDetail(id);
              // 백엔드 응답: { eventInfo, hostName, ... } 형태
              return [id, detail?.eventInfo ?? detail ?? null];
            } catch {
              return [id, null];
            }
          })
        );

        setEventMap((prev) => {
          const next = { ...prev };
          for (const [id, info] of pairs) next[id] = info;
          return next;
        });
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [eventMap]);

  useEffect(() => {
    load();
  }, [load]);

  const items = (participations || []).map((p) => ({
    ...p,
    event: p?.eventId ? eventMap[p.eventId] : null,
  }));

  return { participations: items, loading, error, reload: load };
}
