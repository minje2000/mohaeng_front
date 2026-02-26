import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { tokenStore } from '../../../../app/http/tokenStore';
import { fetchEventDetail } from '../../api/EventDetailAPI';
import UseInquiryList from '../hooks/UseInquiryList';
import InquiryForm from '../components/InquiryForm';
import InquiryListView from '../components/InquiryListView';

export default function InquiryEventDetail() {
  const { eventId } = useParams();
  const eid = Number(eventId);

  const me = useMemo(() => Number(tokenStore.getUserId?.() || 0), []);
  const [hostId, setHostId] = useState(null);

  const { items, loading, error, reload } = UseInquiryList(eid);

  useEffect(() => {
    let mounted = true;
    fetchEventDetail(eid)
      .then((d) => {
        // ✅ 백엔드에서 hostId를 내려주도록 맞춥니다(EventDetailDto.hostId)
        const hid = d?.hostId ?? d?.eventInfo?.hostId ?? null;
        if (mounted) setHostId(hid != null ? Number(hid) : null);
      })
      .catch(() => {
        if (mounted) setHostId(null);
      });
    return () => { mounted = false; };
  }, [eid]);

  const isHost = Boolean(me && hostId && me === hostId);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 style={{ margin: '8px 0' }}>행사 문의</h2>

      <InquiryForm eventId={eid} onSaved={reload} />

      {!isHost && (
        <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e5e7eb', color: '#374151' }}>
          답변은 <b>행사 주최자</b>만 작성할 수 있습니다.
        </div>
      )}

      {loading && <div>불러오는 중...</div>}
      {error && <div style={{ color: 'crimson' }}>문의 목록 로딩 실패</div>}

      <InquiryListView items={items} onChanged={reload} enableReply={isHost} />
    </div>
  );
}
