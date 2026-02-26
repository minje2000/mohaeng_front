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

function formatDateTime(dt) {
  if (!dt) return '-';
  // LocalDateTime JSON: "2026-02-26T12:34:56" 형태를 가정
  const s = String(dt).replace('T', ' ');
  return s.length > 19 ? s.slice(0, 19) : s;
}

export default function ParticipationMypage() {
  const navigate = useNavigate();
  const hasToken = useMemo(() => !!tokenStore.getAccess?.(), []);
  const { participations, loading, error, reload } = UseParticipationMypage();

  const [page, setPage] = useState(1);
  const size = 5;

  const totalPages = useMemo(() => {
    const total = participations?.length || 0;
    return Math.max(1, Math.ceil(total / size));
  }, [participations]);

  const pagedItems = useMemo(() => {
    const arr = participations || [];
    const start = (page - 1) * size;
    return arr.slice(start, start + size);
  }, [participations, page]);

  const pages = useMemo(() => {
    const out = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages || 1, start + 4);
    for (let p = start; p <= end; p += 1) out.push(p);
    return out;
  }, [page, totalPages]);

  const cancelParticipation = async (pctId) => {
    if (!window.confirm('참여를 취소할까요?')) return;
    await ParticipationApi.cancelParticipation(pctId);
    reload();
  };

  if (!hasToken) return <div style={{ padding: 16 }}>로그인이 필요합니다.</div>;

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 16 }}>
      <h2 style={{ margin: '8px 0 16px' }}>행사 참여 내역</h2>

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
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ textAlign: 'left', padding: 12, width: 420 }}>행사</th>
              <th style={{ textAlign: 'left', padding: 12, width: 220 }}>기간</th>
              <th style={{ textAlign: 'left', padding: 12, width: 160 }}>신청일</th>
              <th style={{ textAlign: 'left', padding: 12, width: 120 }}>상태</th>
              <th style={{ textAlign: 'left', padding: 12, width: 200 }}>관리</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: 18, textAlign: 'center' }}>
                  불러오는 중...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} style={{ padding: 18, textAlign: 'center', color: 'crimson' }}>
                  로딩 실패
                </td>
              </tr>
            ) : (participations?.length || 0) === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 18, textAlign: 'center' }}>
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

                return (
                  <tr key={p.pctId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={eventThumbUrl(thumb)}
                          alt="thumb"
                          style={{
                            width: 64,
                            height: 48,
                            objectFit: 'cover',
                            borderRadius: 10,
                            border: '1px solid #E5E7EB',
                          }}
                          onError={(e) => {
                            e.currentTarget.src = '/images/moheng.png';
                          }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div style={{ fontWeight: 700 }}>{title}</div>
                          <div style={{ fontSize: 12, color: '#64748B' }}>{simpleExplain}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: 12, color: '#334155' }}>
                      {formatDateRange(ev?.startDate, ev?.endDate)}
                    </td>

                    <td style={{ padding: 12, color: '#334155' }}>{formatDateTime(p.pctDate)}</td>

                    <td style={{ padding: 12 }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 10px',
                          borderRadius: 999,
                          fontSize: 12,
                          border: '1px solid #E5E7EB',
                          background: '#F8FAFC',
                        }}
                      >
                        {p.pctStatus || '-'}
                      </span>
                    </td>

                    <td style={{ padding: 12 }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => navigate(`/events/${eventId}`)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 10,
                            border: '1px solid #E5E7EB',
                            background: '#fff',
                            cursor: 'pointer',
                          }}
                        >
                          상세보기
                        </button>

                        <button
                          type="button"
                          onClick={() => cancelParticipation(p.pctId)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 10,
                            border: '1px solid #FCA5A5',
                            background: '#FEF2F2',
                            color: '#991B1B',
                            cursor: 'pointer',
                          }}
                        >
                          취소
                        </button>
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
      {(participations?.length || 0) > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff' }}
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
              }}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff' }}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
