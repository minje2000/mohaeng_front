import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStore } from '../../../../app/http/tokenStore';
import UseParticipationMypage from '../hooks/UseParticipationMypage';
import { ParticipationApi } from '../api/ParticipationAPI';
import eventThumbUrl from '../../../../shared/utils/eventThumbUrl';

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return '-';
  const s = startDate ? String(startDate).replaceAll('-', '.') : '-';
  const e = endDate ? String(endDate).replaceAll('-', '.') : '-';
  return `${s} ~ ${e}`;
}

function isCompletedByEndDate(endDate) {
  if (!endDate) return false;
  // endDate: "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss" 등
  const d = new Date(String(endDate).slice(0, 10));
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

function Badge({ text, variant }) {
  const styleByVariant = {
    planned: {
      border: '1px solid #93C5FD',
      background: '#EFF6FF',
      color: '#1D4ED8',
    },
    done: {
      border: '1px solid #86EFAC',
      background: '#F0FDF4',
      color: '#166534',
    },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        ...styleByVariant[variant],
      }}
    >
      {text}
    </span>
  );
}

export default function ParticipationMypage() {
  const navigate = useNavigate();
  const hasToken = useMemo(() => !!tokenStore.getAccess?.(), []);
  const { participations, loading, error, reload } = UseParticipationMypage();

  const [tab, setTab] = useState('ALL'); // ALL | PLANNED | DONE
  const [page, setPage] = useState(1);
  const size = 5;

  const cleaned = useMemo(() => {
    // ✅ 참여삭제/취소는 목록에서 제외
    return (participations || []).filter((p) => {
      const st = p?.pctStatus;
      if (st === '참여삭제') return false;
      if (st === '취소') return false;
      return true;
    });
  }, [participations]);

  const enriched = useMemo(() => {
    return cleaned.map((p) => {
      const ev = p?.event;
      const done = isCompletedByEndDate(ev?.endDate);
      return { ...p, __uiStatus: done ? 'DONE' : 'PLANNED' };
    });
  }, [cleaned]);

  const filtered = useMemo(() => {
    if (tab === 'PLANNED')
      return enriched.filter((p) => p.__uiStatus === 'PLANNED');
    if (tab === 'DONE') return enriched.filter((p) => p.__uiStatus === 'DONE');
    return enriched;
  }, [enriched, tab]);

  const counts = useMemo(() => {
    const all = enriched.length;
    const planned = enriched.filter((p) => p.__uiStatus === 'PLANNED').length;
    const done = enriched.filter((p) => p.__uiStatus === 'DONE').length;
    return { all, planned, done };
  }, [enriched]);

  const totalPages = useMemo(() => {
    const total = filtered.length;
    return Math.max(1, Math.ceil(total / size));
  }, [filtered.length]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * size;
    return filtered.slice(start, start + size);
  }, [filtered, page]);

  const pages = useMemo(() => {
    const out = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages || 1, start + 4);
    for (let p = start; p <= end; p += 1) out.push(p);
    return out;
  }, [page, totalPages]);

  const onChangeTab = (next) => {
    setTab(next);
    setPage(1);
  };

  const cancelParticipation = async (pctId) => {
    if (!window.confirm('참여를 취소할까요?')) return;
    await ParticipationApi.cancelParticipation(pctId);
    reload();
  };

  const deleteParticipation = async (pctId) => {
    if (!window.confirm('참여 내역을 삭제할까요?')) return;
    await ParticipationApi.deleteParticipation(pctId);
    reload();
  };

  if (!hasToken) return <div style={{ padding: 16 }}>로그인이 필요합니다.</div>;

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 16 }}>
      <h2 style={{ margin: '8px 0 16px' }}>행사 참여 내역</h2>

      {/* Tabs */}
      <div
        style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}
      >
        {[
          { key: 'ALL', label: '전체', count: counts.all },
          { key: 'PLANNED', label: '참여예정', count: counts.planned },
          { key: 'DONE', label: '참여완료', count: counts.done },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => onChangeTab(t.key)}
            style={{
              padding: '8px 12px',
              borderRadius: 999,
              border: '1px solid #E5E7EB',
              background: tab === t.key ? '#111827' : '#fff',
              color: tab === t.key ? '#fff' : '#111827',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 700,
            }}
          >
            {t.label}
            <span
              style={{
                minWidth: 22,
                height: 22,
                padding: '0 8px',
                borderRadius: 999,
                background:
                  tab === t.key ? 'rgba(255,255,255,0.18)' : '#F3F4F6',
                color: tab === t.key ? '#fff' : '#111827',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

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
              <th style={{ textAlign: 'left', padding: 12, width: 240 }}>
                행사 기간
              </th>
              <th style={{ textAlign: 'left', padding: 12, width: 140 }}>
                상태
              </th>
              <th style={{ textAlign: 'left', padding: 12, width: 180 }}>
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
            ) : error ? (
              <tr>
                <td
                  colSpan={4}
                  style={{ padding: 18, textAlign: 'center', color: 'crimson' }}
                >
                  로딩 실패
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 18, textAlign: 'center' }}>
                  참여한 행사가 없습니다.
                </td>
              </tr>
            ) : (
              pagedItems.map((p) => {
                const ev = p.event;
                const eventId = p.eventId;

                const title = ev?.title || `행사 #${eventId}`;
                const simpleExplain = ev?.simpleExplain || '';
                const thumb = ev?.thumbnail;
                const isDone = p.__uiStatus === 'DONE';

                return (
                  <tr
                    key={p.pctId}
                    style={{ borderBottom: '1px solid #F1F5F9' }}
                  >
                    <td style={{ padding: 12 }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/events/${eventId}`)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: 'transparent',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                          }}
                        >
                          <img
                            src={eventThumbUrl(thumb)}
                            alt="thumb"
                            style={{
                              width: 72,
                              height: 54,
                              objectFit: 'cover',
                              borderRadius: 12,
                              border: '1px solid #E5E7EB',
                              flexShrink: 0,
                            }}
                            onError={(e) => {
                              e.currentTarget.src = '/images/moheng.png';
                            }}
                          />
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 4,
                              minWidth: 0,
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 800,
                                color: '#111827',
                                textDecoration: 'none',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={title}
                            >
                              {title}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: '#64748B',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={simpleExplain}
                            >
                              {simpleExplain}
                            </div>
                          </div>
                        </div>
                      </button>
                    </td>

                    <td style={{ padding: 12, color: '#334155' }}>
                      {formatDateRange(ev?.startDate, ev?.endDate)}
                    </td>

                    <td style={{ padding: 12 }}>
                      {isDone ? (
                        <Badge text="참여완료" variant="done" />
                      ) : (
                        <Badge text="참여예정" variant="planned" />
                      )}
                    </td>

                    <td style={{ padding: 12 }}>
                      <div
                        style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
                      >
                        {!isDone ? (
                          <button
                            type="button"
                            onClick={() => cancelParticipation(p.pctId)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 10,
                              border: '1px solid #FCA5A5',
                              background: '#FEF2F2',
                              color: '#991B1B',
                              cursor: 'pointer',
                              fontWeight: 800,
                            }}
                          >
                            취소
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => deleteParticipation(p.pctId)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 10,
                              border: '1px solid #CBD5E1',
                              background: '#F8FAFC',
                              color: '#334155',
                              cursor: 'pointer',
                              fontWeight: 800,
                            }}
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {filtered.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            marginTop: 14,
          }}
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{
              padding: '8px 10px',
              borderRadius: 10,
              border: '1px solid #E5E7EB',
              background: '#fff',
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
                minWidth: 38,
                fontWeight: 800,
              }}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={{
              padding: '8px 10px',
              borderRadius: 10,
              border: '1px solid #E5E7EB',
              background: '#fff',
            }}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
