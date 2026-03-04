// src/features/event/participation/pages/BoothMypage.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStore } from '../../../../app/http/tokenStore';
import eventThumbUrl from '../../../../shared/utils/eventThumbUrl';
import { ParticipationBoothApi } from '../api/ParticipationBoothAPI';
import UseBoothManage from '../hooks/UseBoothManage';
import RefundPolicy from '../../../payment/pages/RefundPolicy';

const TABS = [
  { key: 'ALL',      label: '전체' },
  { key: 'RECEIVED', label: '받은 부스' },
  { key: 'APPLIED',  label: '신청 부스' },
];

function mapDisplayStatus(rawStatus, kind) {
  const s = (rawStatus ?? '').toString();
  if (kind === 'received') {
    // ✅ 승인/반려는 그대로, 나머지는 대기
    if (s === '승인') return '승인';
    if (s === '반려') return '반려';
    if (s === '완료') return '완료';
    return '대기';
  }
  if (s === '승인' || s === '반려' || s === '취소') return s;
  return '대기';
}

function StatusBadge({ status, variant }) {
  const s = (status ?? '').toString();

  // ✅ received variant도 승인/반려/대기/완료 각각 처리
  const styleMap = {
    대기: { border: '1px solid #FDE68A', background: '#FFFBEB', color: '#92400E' },
    승인: { border: '1px solid #86EFAC', background: '#F0FDF4', color: '#166534' },
    반려: { border: '1px solid #FECACA', background: '#FEF2F2', color: '#991B1B' },
    완료: { border: '1px solid #86EFAC', background: '#F0FDF4', color: '#166534' },
    취소: { border: '1px solid #E5E7EB', background: '#F8FAFC', color: '#334155' },
  };
  const style = styleMap[s] ?? { border: '1px solid #E5E7EB', background: '#F8FAFC', color: '#334155' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 900, whiteSpace: 'nowrap', ...style }}>
      {s || '-'}
    </span>
  );
}

function pillButtonStyle(active) {
  return {
    appearance: 'none',
    border: active ? '1px solid #111827' : '1px solid #E5E7EB',
    background: active ? '#111827' : '#fff',
    color: active ? '#fff' : '#111827',
    borderRadius: 999, padding: '10px 14px', fontSize: 13, fontWeight: 900,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
    boxShadow: active ? '0 10px 22px rgba(17,24,39,0.18)' : '0 6px 14px rgba(17,24,39,0.06)',
  };
}

function RefundModal({ show, onClose, onConfirm, eventStartDate, paidAmount, isRejection }) {
  if (!show) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <RefundPolicy onClose={onClose} onConfirm={onConfirm} eventStartDate={eventStartDate} paidAmount={paidAmount} isRejection={isRejection} />
      </div>
    </div>
  );
}

export default function BoothMypage() {
  const navigate = useNavigate();
  const hasToken = useMemo(() => !!tokenStore.getAccess?.(), []);
  const [tab, setTab] = useState('ALL');
  
  const { received, applied, loading, refresh } = UseBoothManage();

  const [refundModal, setRefundModal] = useState({
    show: false, isRejection: false,
    pctBoothId: null, eventStartDate: null, paidAmount: null,
  });

  const closeRefundModal = () => setRefundModal((p) => ({ ...p, show: false }));

  const openRejectModal = (row) => {
    setRefundModal({
      show: true, isRejection: true,
      pctBoothId: row.pctBoothId,
      eventStartDate: null,
      paidAmount: row.totalPrice ?? null,
    });
  };

  const openCancelModal = (row) => {
    const isPaid = (row.totalPrice ?? 0) > 0;
    if (!isPaid) {
      if (!window.confirm('부스 신청을 취소할까요?')) return;
      ParticipationBoothApi.cancelBoothParticipation(row.pctBoothId).then(refresh);
      return;
    }
    setRefundModal({
      show: true, isRejection: false,
      pctBoothId: row.pctBoothId,
      eventStartDate: row.startDate ?? null,
      paidAmount: row.totalPrice ?? null,
    });
  };

  const handleRefundConfirm = async () => {
    const { pctBoothId, isRejection } = refundModal;
    closeRefundModal();
    try {
      if (isRejection) {
        await ParticipationBoothApi.rejectBooth(pctBoothId);
      } else {
        await ParticipationBoothApi.cancelBoothParticipation(pctBoothId);
      }
      refresh();
    } catch (e) {
      console.error(e);
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  const rows = useMemo(() => {
    const isInvalid = (s) => !s || s === '취소' || s === '결제대기' || s === 'CANCEL' || s === 'READY';
    
    const cleanReceived = received.filter(r => !isInvalid(r.status));
    const cleanApplied = applied.filter(r => !isInvalid(r.status));

    const toRow = (r, kind) => ({ ...r, _kind: kind, status: mapDisplayStatus(r?.status, kind) });

    if (tab === 'RECEIVED') return cleanReceived.map((r) => toRow(r, 'received'));
    if (tab === 'APPLIED')  return cleanApplied.map((r)  => toRow(r, 'applied'));
    
    return [
      ...cleanReceived.map((r) => toRow(r, 'received')),
      ...cleanApplied.map((r)  => toRow(r, 'applied')),
    ].sort((a, b) => new Date(b?.createdAt ?? 0).getTime() - new Date(a?.createdAt ?? 0).getTime());
  }, [tab, received, applied]);

  const onApprove = async (pctBoothId) => {
    if (!pctBoothId) return;
    if (!window.confirm('해당 부스 신청을 승인할까요?')) return;
    await ParticipationBoothApi.approveBooth(pctBoothId);
    refresh();
  };

  const goEventDetail = (eventId) => { if (eventId) navigate(`/events/${eventId}`); };
  const goBoothDetail = (pctBoothId) => { if (pctBoothId) navigate(`/mypage/booths/${pctBoothId}`); };
  const pickSimpleExplain = (row) =>
    row?.eventDescription || row?.eventSimpleExplain || row?.simpleExplain || row?.description || '';

  if (!hasToken) return <div style={{ padding: 16 }}>로그인이 필요합니다.</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>

      <RefundModal
        show={refundModal.show}
        onClose={closeRefundModal}
        onConfirm={handleRefundConfirm}
        eventStartDate={refundModal.eventStartDate}
        paidAmount={refundModal.paidAmount}
        isRejection={refundModal.isRejection}
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 18px 40px' }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', color: '#111827', marginBottom: 18 }}>부스 관리</div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
          {TABS.map((t) => {
            const active = tab === t.key;
            const cleanReceived = received.filter(r => r.status !== '취소' && r.status !== 'CANCEL');
            const cleanApplied = applied.filter(r => r.status !== '취소' && r.status !== 'CANCEL');
            
            let cnt = 0;
            if (t.key === 'RECEIVED') cnt = cleanReceived.length;
            else if (t.key === 'APPLIED') cnt = cleanApplied.length;
            else cnt = cleanReceived.length + cleanApplied.length;

            return (
              <button key={t.key} type="button" onClick={() => setTab(t.key)} style={pillButtonStyle(active)}>
                <span>{t.label}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 22, padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 900, background: active ? 'rgba(255,255,255,0.18)' : '#F3F4F6', color: active ? '#fff' : '#111827' }}>{cnt}</span>
              </button>
            );
          })}
        </div>

        {/* Header */}
        <div style={{ padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: 14, background: '#fff', color: '#6B7280', fontSize: 12, fontWeight: 900, display: 'grid', gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(220px, 1fr) 120px 180px', gap: 12, marginBottom: 10 }}>
          <div>행사</div><div>부스</div>
          <div style={{ textAlign: 'right' }}>상태</div>
          <div style={{ textAlign: 'right' }}>관리</div>
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <div style={{ padding: '22px 16px', border: '1px solid #E5E7EB', borderRadius: 14, background: '#fff', color: '#6B7280', fontWeight: 800 }}>불러오는 중...</div>
          ) : rows.length === 0 ? (
            <div style={{ padding: '22px 16px', border: '1px solid #E5E7EB', borderRadius: 14, background: '#fff', color: '#6B7280', fontWeight: 800 }}>부스 내역이 없습니다.</div>
          ) : (
            rows.map((row) => {
              const kind      = row._kind;
              const status    = row.status;
              const isPending = status === '대기';
              return (
                <div key={`${kind}-${row.pctBoothId}`} style={{ border: '1px solid #E5E7EB', borderRadius: 14, background: '#fff', padding: 16, display: 'grid', gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(220px, 1fr) 120px 180px', gap: 12, alignItems: 'center' }}>
                  {/* Event */}
                  <button type="button" onClick={() => goEventDetail(row.eventId)} style={{ border: 'none', background: 'transparent', padding: 0, textAlign: 'left', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={eventThumbUrl(row.eventThumbnail)} alt="thumb" style={{ width: 72, height: 54, objectFit: 'cover', borderRadius: 12, border: '1px solid #E5E7EB', background: '#F3F4F6', flex: '0 0 auto' }} onError={(e) => { e.currentTarget.src = '/images/moheng.png'; }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.eventTitle || `행사 #${row.eventId}`}</div>
                        {pickSimpleExplain(row) && <div style={{ marginTop: 4, fontSize: 12, color: '#64748B', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pickSimpleExplain(row)}</div>}
                      </div>
                    </div>
                  </button>
                  {/* Booth */}
                  <button type="button" onClick={() => goBoothDetail(row.pctBoothId)} style={{ border: 'none', background: 'transparent', padding: 0, textAlign: 'left', cursor: 'pointer' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.boothTitle || '-'}</div>
                      <div style={{ marginTop: 4, fontSize: 12, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.boothTopic || ''}</div>
                    </div>
                  </button>
                  {/* Status */}
                  <div style={{ textAlign: 'right' }}>
                    <StatusBadge status={status} variant={kind === 'received' ? 'received' : 'applied'} />
                  </div>
                  {/* Manage */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                    {kind === 'received' ? (
                      <>
                        <button type="button" disabled={!isPending} onClick={() => onApprove(row.pctBoothId)}
                          style={{ padding: '9px 12px', borderRadius: 12, border: '1px solid #E5E7EB', background: isPending ? '#111827' : '#F3F4F6', color: isPending ? '#fff' : '#9CA3AF', fontWeight: 900, cursor: isPending ? 'pointer' : 'not-allowed' }}>
                          승인
                        </button>
                        <button type="button" disabled={!isPending} onClick={() => isPending && openRejectModal(row)}
                          style={{ padding: '9px 12px', borderRadius: 12, border: '1px solid #E5E7EB', background: '#fff', color: isPending ? '#111827' : '#9CA3AF', fontWeight: 900, cursor: isPending ? 'pointer' : 'not-allowed' }}>
                          반려
                        </button>
                      </>
                    ) : (
                      <button type="button" disabled={!isPending} onClick={() => isPending && openCancelModal(row)}
                        style={{ padding: '9px 12px', borderRadius: 12, border: '1px solid #E5E7EB', background: '#fff', color: isPending ? '#111827' : '#9CA3AF', fontWeight: 900, cursor: isPending ? 'pointer' : 'not-allowed' }}>
                        취소
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
