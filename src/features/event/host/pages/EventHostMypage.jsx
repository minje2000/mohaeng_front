import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStore } from '../../../../app/http/tokenStore';
import UseMyCreatedEvents from '../hooks/UseMyCreatedEvents';
import { MypageEventApi } from '../api/MypageEventApi';

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return '-';
  const s = startDate ? String(startDate).replaceAll('-', '.') : '-';
  const e = endDate ? String(endDate).replaceAll('-', '.') : '-';
  return `${s} ~ ${e}`;
}

function parseYmdToDate(ymd) {
  if (!ymd) return null;
  // "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss" 등 방어
  const s = String(ymd).slice(0, 10);
  const [y, m, d] = s.split('-').map((v) => Number(v));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function getStatusUI(ev) {
  if (!ev) return { key: '-', label: '-' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = parseYmdToDate(ev?.startDate);
  const endDate = parseYmdToDate(ev?.endDate);
  const startR = parseYmdToDate(ev?.startRecruit);
  const endR = parseYmdToDate(ev?.endRecruit);
  const boothStart = parseYmdToDate(ev?.boothStartRecruit);
  const boothEnd = parseYmdToDate(ev?.boothEndRecruit);

  // ✅ 백/상세페이지 로직과 동일한 우선순위
  if (endDate && today > endDate) return { key: '종료', label: '행사 종료' };

  if (startDate && endDate && today >= startDate && today <= endDate)
    return { key: '진행중', label: '행사 진행 중' };

  if (endR && today > endR)
    return { key: '모집마감', label: '행사 참여 모집 마감' };

  if (startR && endR && today >= startR && today <= endR)
    return { key: '참여모집중', label: '행사 참여자 모집 중' };

  if (boothEnd && today > boothEnd)
    return { key: '부스마감', label: '부스 모집 마감' };

  if (boothStart && boothEnd && today >= boothStart && today <= boothEnd)
    return { key: '부스모집중', label: '부스 모집 중' };

  return { key: '예정', label: '행사 예정' };
}

/**
 * ✅ DB에는 파일명(또는 경로)이 들어오고, 실제 파일은 백엔드가 /upload_files/** 로 서빙하는 구조 대응
 */
const BACKEND = 'http://localhost:8080';

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
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 12,
    border: '1px solid #E5E7EB',
    background: '#F8FAFC',
    color: '#0F172A',

    whiteSpace: 'nowrap',
    flexWrap: 'nowrap',
    wordBreak: 'keep-all',
  };

  if (statusKey === '예정')
    return {
      ...base,
      background: '#EFF6FF',
      border: '1px solid #BFDBFE',
      color: '#1D4ED8',
    };
  if (statusKey === '진행중')
    return {
      ...base,
      background: '#FFF7ED',
      border: '1px solid #FED7AA',
      color: '#C2410C',
    };
  if (statusKey === '참여모집중')
    return {
      ...base,
      background: '#FFF7ED',
      border: '1px solid #FED7AA',
      color: '#C2410C',
    };
  if (statusKey === '부스모집중')
    return {
      ...base,
      background: '#F5F3FF',
      border: '1px solid #DDD6FE',
      color: '#6D28D9',
    };
  if (statusKey === '모집마감' || statusKey === '부스마감')
    return {
      ...base,
      background: '#F3F4F6',
      border: '1px solid #E5E7EB',
      color: '#6B7280',
    };
  if (statusKey === '종료')
    return {
      ...base,
      background: '#ECFDF5',
      border: '1px solid #A7F3D0',
      color: '#047857',
    };

  return base;
}

export default function EventHostMypage() {
  const navigate = useNavigate();
  const hasToken = useMemo(() => !!tokenStore.getAccess?.(), []);
  const [page, setPage] = useState(1);
  const size = 5;

  const { items, totalPages, loading, reload } = UseMyCreatedEvents(page, size);

  const [removing, setRemoving] = useState(false);
  const [removedIds, setRemovedIds] = useState(() => new Set());

  const pages = useMemo(() => {
    const out = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages || 1, start + 4);
    for (let p = start; p <= end; p += 1) out.push(p);
    return out;
  }, [page, totalPages]);

  const visibleItems = useMemo(() => {
    return (items || []).filter((ev) => !removedIds.has(ev.eventId));
  }, [items, removedIds]);

  const onGoDetail = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const onDelete = async (ev) => {
    const statusUI = getStatusUI(ev);
    if (statusUI.key !== '예정' && statusUI.key !== '종료') {
      alert('행사예정/행사종료 상태에서만 삭제할 수 있습니다.');
      return;
    }

    if (
      !window.confirm(
        '이 행사를 삭제할까요? (삭제 후 목록에서 숨김 처리됩니다)'
      )
    )
      return;

    try {
      setRemoving(true);
      await MypageEventApi.deleteMyCreatedEvent(ev.eventId);

      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.add(ev.eventId);
        return next;
      });

      // 서버 상태 반영 위해 재조회
      reload?.();
    } catch (e) {
      // GlobalExceptionHandler가 4xx로 내려주면 message가 보일 수 있음
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
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 16 }}>
      <h2 style={{ margin: '8px 0 16px' }}>행사 등록 내역</h2>

      <div
        style={{
          background: '#fff',
          border: '1px solid #E5E7EB',
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                background: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
              }}
            >
              <th style={{ textAlign: 'left', padding: 12, width: 460 }}>
                행사
              </th>
              <th style={{ textAlign: 'left', padding: 12, width: 220 }}>
                행사 기간
              </th>
              <th style={{ textAlign: 'left', padding: 12, width: 140 }}>
                상태
              </th>
              <th style={{ textAlign: 'left', padding: 12, width: 140 }}>
                관리
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ padding: 18, textAlign: 'center' }}>
                  불러오는 중...
                </td>
              </tr>
            ) : visibleItems.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 18, textAlign: 'center' }}>
                  등록한 행사가 없습니다.
                </td>
              </tr>
            ) : (
              visibleItems.map((ev) => {
                const statusUI = getStatusUI(ev);
                const canDelete =
                  statusUI.key === '예정' || statusUI.key === '종료';

                return (
                  <tr
                    key={ev.eventId}
                    style={{ borderBottom: '1px solid #F1F5F9' }}
                  >
                    <td style={{ padding: 12 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <img
                          src={buildThumbSrc(ev.thumbnail)}
                          alt="thumb"
                          style={{
                            width: 64,
                            height: 48,
                            objectFit: 'cover',
                            borderRadius: 10,
                            border: '1px solid #E5E7EB',
                            cursor: 'pointer',
                          }}
                          onClick={() => onGoDetail(ev.eventId)}
                          onError={(e) => {
                            e.currentTarget.src = '/images/moheng.png';
                          }}
                        />

                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                          }}
                        >
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => onGoDetail(ev.eventId)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') onGoDetail(ev.eventId);
                            }}
                            style={{
                              fontWeight: 700,
                              cursor: 'pointer',
                              textDecoration: 'none',
                            }}
                          >
                            {ev.title || `행사 #${ev.eventId}`}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748B' }}>
                            {ev.simpleExplain || ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      style={{
                        padding: 12,
                        color: '#334155',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatDateRange(ev.startDate, ev.endDate)}
                    </td>

                    <td style={{ padding: 12 }}>
                      <span style={statusPillStyle(statusUI.key)}>
                        {statusUI.label}
                      </span>
                    </td>

                    <td style={{ padding: 12 }}>
                      {canDelete ? (
                        <button
                          type="button"
                          disabled={removing}
                          onClick={() => onDelete(ev)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 10,
                            border: '1px solid #FCA5A5',
                            background: '#FEF2F2',
                            color: '#B91C1C',
                            cursor: removing ? 'not-allowed' : 'pointer',
                          }}
                        >
                          삭제
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* pagination */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            padding: 14,
          }}
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            style={{
              padding: '8px 10px',
              borderRadius: 10,
              border: '1px solid #E5E7EB',
              background: '#fff',
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
            }}
          >
            이전
          </button>

          {pages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              style={{
                padding: '8px 10px',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                background: p === page ? '#111827' : '#fff',
                color: p === page ? '#fff' : '#111827',
                cursor: 'pointer',
              }}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages || p + 1, p + 1))}
            disabled={page >= (totalPages || 1)}
            style={{
              padding: '8px 10px',
              borderRadius: 10,
              border: '1px solid #E5E7EB',
              background: '#fff',
              cursor: page >= (totalPages || 1) ? 'not-allowed' : 'pointer',
            }}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
