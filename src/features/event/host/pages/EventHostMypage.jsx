import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStore } from '../../../../app/http/tokenStore';
import UseMyCreatedEvents from '../hooks/UseMyCreatedEvents';
import { MypageEventApi } from '../api/MypageEventApi';
import eventThumbUrl from '../../../../shared/utils/eventThumbUrl';

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return '-';
  const s = startDate ? String(startDate).replaceAll('-', '.') : '-';
  const e = endDate ? String(endDate).replaceAll('-', '.') : '-';
  return `${s} ~ ${e}`;
}

function parseYmdToDate(ymd) {
  if (!ymd) return null;
  const s = String(ymd).slice(0, 10);
  const [y, m, d] = s.split('-').map((v) => Number(v));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function normalizeModerationStatus(value) {
  if (!value) return '';
  return String(value).trim();
}

function getStatusUI(ev) {
  if (!ev) return { key: '-', label: '-' };

  const moderationStatus = normalizeModerationStatus(ev?.moderationStatus);

  if (moderationStatus === '승인대기') {
    return { key: '승인대기', label: '승인 대기' };
  }

  if (moderationStatus === '반려') {
    return { key: '반려', label: '반려' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = parseYmdToDate(ev?.startDate);
  const endDate = parseYmdToDate(ev?.endDate);
  const startR = parseYmdToDate(ev?.startRecruit);
  const endR = parseYmdToDate(ev?.endRecruit);
  const boothStart = parseYmdToDate(ev?.boothStartRecruit);
  const boothEnd = parseYmdToDate(ev?.boothEndRecruit);

  if (endDate && today > endDate) return { key: '종료', label: '행사 종료' };
  if (startDate && endDate && today >= startDate && today <= endDate) {
    return { key: '진행중', label: '행사 진행 중' };
  }
  if (endR && today > endR) {
    return { key: '모집마감', label: '행사 참여 모집 마감' };
  }
  if (startR && endR && today >= startR && today <= endR) {
    return { key: '참여모집중', label: '행사 참여자 모집 중' };
  }
  if (boothEnd && today > boothEnd) {
    return { key: '부스마감', label: '부스 모집 마감' };
  }
  if (boothStart && boothEnd && today >= boothStart && today <= boothEnd) {
    return { key: '부스모집중', label: '부스 모집 중' };
  }

  return { key: '예정', label: '행사 예정' };
}

const BACKEND = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

function buildThumbSrc(thumbnail) {
  if (!thumbnail) return '/images/moheng.png';
  const t = String(thumbnail);
  if (t.startsWith('http')) return t;
  if (t.startsWith('/upload_files/')) return `${BACKEND}${t}`;
  return `${BACKEND}/upload_files/event/${t}`;
}

function statusPillStyle(statusKey) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 30,
    padding: '0 12px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    border: '1px solid #E5E7EB',
    background: '#F8FAFC',
    color: '#0F172A',
    whiteSpace: 'nowrap',
  };

  if (statusKey === '승인대기') {
    return {
      ...base,
      background: '#FFF7ED',
      border: '1px solid #FED7AA',
      color: '#C2410C',
    };
  }

  if (statusKey === '반려') {
    return {
      ...base,
      background: '#FEF2F2',
      border: '1px solid #FECACA',
      color: '#DC2626',
    };
  }

  if (statusKey === '예정') {
    return {
      ...base,
      background: '#EFF6FF',
      border: '1px solid #BFDBFE',
      color: '#1D4ED8',
    };
  }

  if (statusKey === '진행중' || statusKey === '참여모집중') {
    return {
      ...base,
      background: '#FFF7ED',
      border: '1px solid #FED7AA',
      color: '#C2410C',
    };
  }

  if (statusKey === '부스모집중') {
    return {
      ...base,
      background: '#F5F3FF',
      border: '1px solid #DDD6FE',
      color: '#6D28D9',
    };
  }

  if (statusKey === '모집마감' || statusKey === '부스마감') {
    return {
      ...base,
      background: '#F3F4F6',
      border: '1px solid #E5E7EB',
      color: '#6B7280',
    };
  }

  if (statusKey === '종료') {
    return {
      ...base,
      background: '#ECFDF5',
      border: '1px solid #A7F3D0',
      color: '#047857',
    };
  }

  return base;
}

function getPageNumbers(page, totalPages) {
  const safeTotal = Math.max(1, totalPages || 1);
  const start = Math.max(1, Math.min(page - 2, safeTotal - 4));
  const end = Math.min(safeTotal, start + 4);
  return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
}

function Pagination({ page, totalPages, onChange }) {
  if ((totalPages || 1) <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <div
      style={{
        marginTop: 18,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
      }}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        style={{
          minWidth: 56,
          height: 44,
          padding: '0 18px',
          borderRadius: 14,
          border: '1px solid #D1D5DB',
          background: '#fff',
          color: '#9CA3AF',
          fontWeight: 800,
          cursor: page <= 1 ? 'not-allowed' : 'pointer',
        }}
      >
        이전
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            border: p === page ? '1px solid #0F172A' : '1px solid #D1D5DB',
            background: p === page ? '#0F172A' : '#fff',
            color: p === page ? '#fff' : '#0F172A',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages || 1, page + 1))}
        disabled={page >= (totalPages || 1)}
        style={{
          minWidth: 56,
          height: 44,
          padding: '0 18px',
          borderRadius: 14,
          border: '1px solid #D1D5DB',
          background: '#fff',
          color: '#0F172A',
          fontWeight: 800,
          cursor: page >= (totalPages || 1) ? 'not-allowed' : 'pointer',
          opacity: page >= (totalPages || 1) ? 0.45 : 1,
        }}
      >
        다음
      </button>
    </div>
  );
}

export default function EventHostMypage() {
  const navigate = useNavigate();
  const hasToken = useMemo(() => !!tokenStore.getAccess?.(), []);
  const [page, setPage] = useState(1);
  const size = 5;

  const { items, totalPages, loading, reload } = UseMyCreatedEvents(page, size);

  const [removing, setRemoving] = useState(false);
  const [removedIds, setRemovedIds] = useState(() => new Set());

  const visibleItems = useMemo(() => {
    return (items || []).filter((ev) => !removedIds.has(ev.eventId));
  }, [items, removedIds]);

  const onGoDetail = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const onGoStats = (ev) => {
    navigate('/mypage/events/created/stats', {
      state: {
        eventId: ev.eventId,
        eventTitle: ev.title || `행사 #${ev.eventId}`,
      },
    });
  };

  const onDelete = async (ev) => {
    const statusUI = getStatusUI(ev);

    if (
      statusUI.key !== '예정' &&
      statusUI.key !== '종료' &&
      statusUI.key !== '반려' &&
      statusUI.key !== '승인대기'
    ) {
      alert('행사예정/행사종료/승인대기/반려 상태에서만 삭제할 수 있습니다.');
      return;
    }

    if (!window.confirm('이 행사를 삭제할까요? (삭제 후 목록에서 숨김 처리됩니다)')) {
      return;
    }

    try {
      setRemoving(true);
      await MypageEventApi.deleteMyCreatedEvent(ev.eventId);

      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.add(ev.eventId);
        return next;
      });

      reload?.();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.data ||
        e?.message ||
        '삭제 중 오류가 발생했습니다.';
      alert(msg);
    } finally {
      setRemoving(false);
    }
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
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 18px 40px' }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            color: '#111827',
            marginBottom: 18,
          }}
        >
          행사 등록 내역
        </div>

        <div
          style={{
            padding: '12px 18px',
            border: '1px solid #E5E7EB',
            borderRadius: 18,
            background: '#fff',
            color: '#64748B',
            fontSize: 13,
            fontWeight: 900,
            display: 'grid',
            gridTemplateColumns: 'minmax(290px, 1.5fr) 180px 140px 120px 96px',
            gap: 12,
          }}
        >
          <div>행사</div>
          <div>행사 기간</div>
          <div>상태</div>
          <div style={{ textAlign: 'center' }}>행사분석</div>
          <div style={{ textAlign: 'center' }}>관리</div>
        </div>

        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <div
              style={{
                padding: '24px 18px',
                border: '1px solid #E5E7EB',
                borderRadius: 18,
                background: '#fff',
                color: '#6B7280',
                fontWeight: 800,
              }}
            >
              불러오는 중...
            </div>
          ) : visibleItems.length === 0 ? (
            <div
              style={{
                padding: '24px 18px',
                border: '1px dashed #D1D5DB',
                borderRadius: 18,
                background: '#fff',
                color: '#6B7280',
                fontWeight: 800,
                textAlign: 'center',
              }}
            >
              등록한 행사가 없습니다.
            </div>
          ) : (
            visibleItems.map((ev) => {
              const statusUI = getStatusUI(ev);
              const canDelete =
                statusUI.key === '예정' ||
                statusUI.key === '종료' ||
                statusUI.key === '반려' ||
                statusUI.key === '승인대기';

              return (
                <div
                  key={ev.eventId}
                  style={{
                    border: '1px solid #E5E7EB',
                    borderRadius: 18,
                    background: '#fff',
                    boxShadow: '0 10px 22px rgba(17,24,39,0.06)',
                    padding: 16,
                    display: 'grid',
                    gridTemplateColumns: 'minmax(290px, 1.5fr) 180px 140px 120px 96px',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <img
                      src={eventThumbUrl(ev.thumbnail)}
                      alt="thumb"
                      style={{
                        width: 64,
                        height: 64,
                        objectFit: 'cover',
                        borderRadius: 16,
                        border: '1px solid #E5E7EB',
                        cursor: 'pointer',
                        flex: '0 0 auto',
                        background: '#F3F4F6',
                      }}
                      onClick={() => onGoDetail(ev.eventId)}
                      onError={(e) => {
                        e.currentTarget.src = '/images/moheng.png';
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => onGoDetail(ev.eventId)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onGoDetail(ev.eventId);
                        }}
                        style={{
                          fontSize: 15,
                          fontWeight: 900,
                          color: '#111827',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                        }}
                      >
                        {ev.title || `행사 #${ev.eventId}`}
                      </div>

                      {ev.simpleExplain ? (
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 12,
                            color: '#64748B',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {ev.simpleExplain}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: '#334155',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatDateRange(ev.startDate, ev.endDate)}
                  </div>

                  <div>
                    <span style={statusPillStyle(statusUI.key)}>{statusUI.label}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
  {statusUI.key === '승인대기' || statusUI.key === '반려' ? (
    <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 800 }}>-</span>
  ) : (
    <button
      type="button"
      onClick={() => onGoStats(ev)}
      style={{
        padding: '9px 14px',
        borderRadius: 12,
        border: '1px solid #BFDBFE',
        background: '#EFF6FF',
        color: '#1D4ED8',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 800,
        whiteSpace: 'nowrap',
      }}
    >
      통계
    </button>
  )}
</div>

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {canDelete ? (
                      <button
                        type="button"
                        disabled={removing}
                        onClick={() => onDelete(ev)}
                        style={{
                          padding: '9px 14px',
                          borderRadius: 12,
                          border: '1px solid #FECACA',
                          background: '#FEF2F2',
                          color: '#B91C1C',
                          cursor: removing ? 'not-allowed' : 'pointer',
                          fontWeight: 800,
                        }}
                      >
                        삭제
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 800 }}>-</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}