import React, { useEffect, useMemo, useState } from 'react';
import InquiryForm from '../components/InquiryForm';
import InquiryListView from '../components/InquiryListView';
import UseInquiryList from '../hooks/UseInquiryList';
import { useParams } from 'react-router-dom';
import { axiosInstance } from '../../../../app/http/axiosInstance';

export default function InquiryEventDetail({ hostId, hostName }) {
  const { eventId } = useParams();
  const eid = useMemo(() => Number(eventId), [eventId]);

  // ✅ 문의 목록(로그인 불필요)
  const { items, loading, error, refetch } = UseInquiryList({ eventId: eid });

  // eventId가 바뀌면 1번만 새로고침
  useEffect(() => {
    if (!eid) return;
    refetch?.();
  }, [eid]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = () => refetch?.();

  // ✅ 로그인 코드(토큰 저장 방식)는 건드리지 않고, /me로 userId만 조회해서 사용
  const [meId, setMeId] = useState(null);

  useEffect(() => {
    let alive = true;

    const loadMe = async () => {
      // 프로젝트마다 prefix가 달라질 수 있어서 순서대로 시도
      const candidates = ['/api/user/me', '/api/me', '/me'];

      for (const url of candidates) {
        try {
          const res = await axiosInstance.get(url);
          const dto = res?.data?.data ?? res?.data; // ApiResponse 래핑/비래핑 대응
          const uid = dto?.userId;
          if (uid != null) {
            if (alive) setMeId(Number(uid));
            return;
          }
        } catch (e) {
          // 다음 후보로 계속
        }
      }
      if (alive) setMeId(null);
    };

    loadMe();
    return () => {
      alive = false;
    };
  }, []);

  const isHost =
    hostId != null && meId != null && Number(hostId) === Number(meId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ✅ 문의 작성(로그인 필요) */}
      <InquiryForm eventId={eid} onSaved={refresh} />

      {/* ✅ 문의 목록(로그인 불필요) */}
      {loading && <div style={{ padding: 12 }}>불러오는 중...</div>}
      {error && (
        <div style={{ padding: 12, color: 'crimson' }}>{String(error)}</div>
      )}

      <InquiryListView
        items={items || []}
        meId={meId}
        isHost={isHost}
        hostName={hostName || '주최자'}
        onChanged={refresh}
      />
    </div>
  );
}
