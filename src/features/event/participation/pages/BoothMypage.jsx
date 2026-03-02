import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { tokenStore } from '../../../../app/http/tokenStore';
import eventThumbUrl from '../../../../shared/utils/eventThumbUrl';
import { ParticipationBoothApi } from '../api/ParticipationBoothAPI';
import UseBoothManage from '../hooks/UseBoothManage';

const TABS = [
  { key: 'ALL', label: '전체' },
  { key: 'RECEIVED', label: '받은 부스' },
  { key: 'APPLIED', label: '신청 부스' },
];

function mapDisplayStatus(rawStatus, kind) {
  const s = (rawStatus ?? '').toString();

  // ✅ 주최자(받은 부스): 대기 → (승인/반려) 처리 후 완료
  if (kind === 'received') {
    if (s === '승인' || s === '반려' || s === '완료') return '완료';
    // '신청', '결제완료', '임시저장' 등은 전부 대기 취급
    return '대기';
  }

  // ✅ 신청자(신청 부스): 대기 → (승인/반려) 처리 결과 그대로 표시 (+취소)
  if (s === '승인' || s === '반려' || s === '취소') return s;
  // '신청', '결제완료', '임시저장' 등은 전부 대기
  return '대기';
}

function StatusBadge({ status, variant }) {
  // variant: 'received' | 'applied'
  const s = (status ?? '').toString();

  // received: 대기/완료
  if (variant === 'received') {
    const done = s === '완료';
    const style = done
      ? { border: '1px solid #86EFAC', background: '#F0FDF4', color: '#166534' }
      : {
          border: '1px solid #FDE68A',
          background: '#FFFBEB',
          color: '#92400E',
        };
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 10px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
          ...style,
        }}
      >
        {done ? '완료' : '대기'}
      </span>
    );
  }

  // applied: 대기/승인/반려(+취소)
  const styleMap = {
    대기: {
      border: '1px solid #FDE68A',
      background: '#FFFBEB',
      color: '#92400E',
    },
    승인: {
      border: '1px solid #86EFAC',
      background: '#F0FDF4',
      color: '#166534',
    },
    반려: {
      border: '1px solid #FECACA',
      background: '#FEF2F2',
      color: '#991B1B',
    },
    취소: {
      border: '1px solid #E5E7EB',
      background: '#F8FAFC',
      color: '#334155',
    },
  };

  const style = styleMap[s] ?? {
    border: '1px solid #E5E7EB',
    background: '#F8FAFC',
    color: '#334155',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: '-0.02em',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
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
    borderRadius: 999,
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 900,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    boxShadow: active
      ? '0 10px 22px rgba(17,24,39,0.18)'
      : '0 6px 14px rgba(17,24,39,0.06)',
  };
}

export default function BoothMypage() {
  const navigate = useNavigate();
  const hasToken = useMemo(() => !!tokenStore.getAccess?.(), []);

  const [tab, setTab] = useState('ALL');

  const { received, applied, loading, refresh } = UseBoothManage();

  const rows = useMemo(() => {
    if (tab === 'RECEIVED')
      return received.map((r) => ({
        ...r,
        _kind: 'received',
        status: mapDisplayStatus(r?.status, 'received'),
      }));
    if (tab === 'APPLIED')
      return applied.map((r) => ({
        ...r,
        _kind: 'applied',
        status: mapDisplayStatus(r?.status, 'applied'),
      }));
    return [
      ...received.map((r) => ({
        ...r,
        _kind: 'received',
        status: mapDisplayStatus(r?.status, 'received'),
      })),
      ...applied.map((r) => ({
        ...r,
        _kind: 'applied',
        status: mapDisplayStatus(r?.status, 'applied'),
      })),
    ].sort((a, b) => {
      const ta = new Date(a?.createdAt ?? a?.created_at ?? 0).getTime();
      const tb = new Date(b?.createdAt ?? b?.created_at ?? 0).getTime();
      return tb - ta;
    });
  }, [tab, received, applied]);

  const onApprove = async (pctBoothId) => {
    if (!pctBoothId) return;
    if (!window.confirm('해당 부스 신청을 승인할까요?')) return;
    await ParticipationBoothApi.approveBooth(pctBoothId);
    refresh();
  };

  const onReject = async (pctBoothId) => {
    if (!pctBoothId) return;
    if (
      !window.confirm('해당 부스 신청을 반려할까요? (반려 시 환불 처리 예정)')
    )
      return;
    await ParticipationBoothApi.rejectBooth(pctBoothId);
    refresh();
  };

  const onCancel = async (pctBoothId) => {
    if (!pctBoothId) return;
    if (!window.confirm('부스 신청을 취소할까요?')) return;
    await ParticipationBoothApi.cancelBoothParticipation(pctBoothId);
    refresh();
  };

  const goEventDetail = (eventId) => {
    if (!eventId) return;
    navigate(`/events/${eventId}`);
  };

  const goBoothDetail = (pctBoothId) => {
    if (!pctBoothId) return;
    navigate(`/mypage/booths/${pctBoothId}`);
  };

  // ✅ 문의 내역 화면과 동일한 규칙으로 행사 설명(한 줄)을 뽑아낸다.
  const pickSimpleExplain = (row) => {
    return (
      row?.eventDescription ||
      row?.eventSimpleExplain ||
      row?.simpleExplain ||
      row?.eventExplain ||
      row?.description ||
      ''
    );
  };

  if (!hasToken) return <div style={{ padding: 16 }}>로그인이 필요합니다.</div>;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F9FAFB',
        fontFamily:
          "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 18px 40px' }}
      >
        {/* Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: '#111827',
              }}
            >
              부스 관리
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            marginTop: 18,
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {TABS.map((t) => {
            const active = tab === t.key;
            const cnt =
              t.key === 'RECEIVED'
                ? received.length
                : t.key === 'APPLIED'
                  ? applied.length
                  : received.length + applied.length;

            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                style={pillButtonStyle(active)}
              >
                <span>{t.label}</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 22,
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 900,
                    background: active ? 'rgba(255,255,255,0.18)' : '#F3F4F6',
                    color: active ? '#fff' : '#111827',
                  }}
                >
                  {cnt}
                </span>
              </button>
            );
          })}
        </div>

        {/* Header row */}
        <div
          style={{
            marginTop: 18,
            padding: '12px 16px',
            border: '1px solid #E5E7EB',
            borderRadius: 14,
            background: '#fff',
            color: '#6B7280',
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: '-0.02em',
            display: 'grid',
            gridTemplateColumns:
              'minmax(280px, 1.2fr) minmax(220px, 1fr) 120px 180px',
            gap: 12,
          }}
        >
          <div>행사</div>
          <div>부스</div>
          <div style={{ textAlign: 'right' }}>상태</div>
          <div style={{ textAlign: 'right' }}>관리</div>
        </div>

        {/* List */}
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {loading ? (
            <div
              style={{
                padding: '22px 16px',
                border: '1px solid #E5E7EB',
                borderRadius: 14,
                background: '#fff',
                color: '#6B7280',
                fontWeight: 800,
              }}
            >
              불러오는 중...
            </div>
          ) : rows.length === 0 ? (
            <div
              style={{
                padding: '22px 16px',
                border: '1px solid #E5E7EB',
                borderRadius: 14,
                background: '#fff',
                color: '#6B7280',
                fontWeight: 800,
              }}
            >
              부스 내역이 없습니다.
            </div>
          ) : (
            rows.map((row) => {
              const kind = row._kind; // received/applied
              const status = row.status;
              const isPending = status === '대기';
              const simpleExplain = pickSimpleExplain(row);

              return (
                <div
                  key={`${kind}-${row.pctBoothId}`}
                  style={{
                    border: '1px solid #E5E7EB',
                    borderRadius: 14,
                    background: '#fff',
                    padding: 16,
                    display: 'grid',
                    gridTemplateColumns:
                      'minmax(280px, 1.2fr) minmax(220px, 1fr) 120px 180px',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  {/* Event */}
                  <button
                    type="button"
                    onClick={() => goEventDetail(row.eventId)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                    title="행사 상세로 이동"
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                    >
                      <img
                        src={eventThumbUrl(row.eventThumbnail)}
                        alt="thumb"
                        style={{
                          width: 72,
                          height: 54,
                          objectFit: 'cover',
                          borderRadius: 12,
                          border: '1px solid #E5E7EB',
                          background: '#F3F4F6',
                          flex: '0 0 auto',
                        }}
                        onError={(e) => {
                          e.currentTarget.src = '/images/moheng.png';
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 900,
                            color: '#111827',
                            letterSpacing: '-0.02em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.eventTitle || `행사 #${row.eventId}`}
                        </div>
                        {simpleExplain ? (
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 12,
                              color: '#64748B',
                              fontWeight: 700,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={simpleExplain}
                          >
                            {simpleExplain}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </button>

                  {/* Booth */}
                  <button
                    type="button"
                    onClick={() => goBoothDetail(row.pctBoothId)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                    title="신청서 보기"
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 900,
                          color: '#111827',
                          letterSpacing: '-0.02em',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {row.boothTitle || '-'}
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 12,
                          color: '#6B7280',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {row.boothTopic || ''}
                      </div>
                    </div>
                  </button>

                  {/* Status */}
                  <div style={{ textAlign: 'right' }}>
                    <StatusBadge
                      status={status}
                      variant={kind === 'received' ? 'received' : 'applied'}
                    />
                  </div>

                  {/* Manage */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    {kind === 'received' ? (
                      <>
                        <button
                          type="button"
                          disabled={!isPending}
                          onClick={() => onApprove(row.pctBoothId)}
                          style={{
                            padding: '9px 12px',
                            borderRadius: 12,
                            border: '1px solid #E5E7EB',
                            background: isPending ? '#111827' : '#F3F4F6',
                            color: isPending ? '#fff' : '#9CA3AF',
                            fontWeight: 900,
                            cursor: isPending ? 'pointer' : 'not-allowed',
                          }}
                        >
                          승인
                        </button>
                        <button
                          type="button"
                          disabled={!isPending}
                          onClick={() => onReject(row.pctBoothId)}
                          style={{
                            padding: '9px 12px',
                            borderRadius: 12,
                            border: '1px solid #E5E7EB',
                            background: '#fff',
                            color: isPending ? '#111827' : '#9CA3AF',
                            fontWeight: 900,
                            cursor: isPending ? 'pointer' : 'not-allowed',
                          }}
                        >
                          반려
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={!isPending}
                        onClick={() => onCancel(row.pctBoothId)}
                        style={{
                          padding: '9px 12px',
                          borderRadius: 12,
                          border: '1px solid #E5E7EB',
                          background: '#fff',
                          color: isPending ? '#111827' : '#9CA3AF',
                          fontWeight: 900,
                          cursor: isPending ? 'pointer' : 'not-allowed',
                        }}
                      >
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
