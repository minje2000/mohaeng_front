import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStore } from '../../../../app/http/tokenStore';
import UseMyCreatedEvents from '../hooks/UseMyCreatedEvents';

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return '-';
  const s = startDate ? String(startDate).replaceAll('-', '.') : '-';
  const e = endDate ? String(endDate).replaceAll('-', '.') : '-';
  return `${s} ~ ${e}`;
}

/**
 * ✅ DB에는 파일명(또는 경로)이 들어오고, 실제 파일은 백엔드가 /upload_files/** 로 서빙하는 구조 대응
 * - 파일명만 오면:        http://localhost:8080/upload_files/event/{filename}
 * - /upload_files/... 오면: http://localhost:8080 + {path}
 * - http로 시작하면: 그대로 사용
 */
const BACKEND = 'http://localhost:8080';

function buildThumbSrc(thumbnail) {
  if (!thumbnail) return '/images/moheng.png';

  const t = String(thumbnail);

  if (t.startsWith('http')) return t;

  if (t.startsWith('/upload_files/')) return `${BACKEND}${t}`;

  // 파일명만 저장되는 케이스
  return `${BACKEND}/upload_files/event/${t}`;
}

export default function EventHostMypage() {
  const navigate = useNavigate();
  const hasToken = useMemo(() => !!tokenStore.getAccess?.(), []);
  const [page, setPage] = useState(1);
  const size = 5;

  const { items, totalPages, loading } = UseMyCreatedEvents(page, size);

  const pages = useMemo(() => {
    const out = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages || 1, start + 4);
    for (let p = start; p <= end; p += 1) out.push(p);
    return out;
  }, [page, totalPages]);

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
              <th style={{ textAlign: 'left', padding: 12, width: 420 }}>
                행사
              </th>
              <th style={{ textAlign: 'left', padding: 12, width: 220 }}>
                기간
              </th>
              <th style={{ textAlign: 'left', padding: 12, width: 120 }}>
                상태
              </th>
              <th style={{ textAlign: 'left', padding: 12, width: 120 }}>
                상세
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
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 18, textAlign: 'center' }}>
                  등록한 행사가 없습니다.
                </td>
              </tr>
            ) : (
              items.map((ev) => (
                <tr
                  key={ev.eventId}
                  style={{ borderBottom: '1px solid #F1F5F9' }}
                >
                  <td style={{ padding: 12 }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 12 }}
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
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>
                          {ev.title || `행사 #${ev.eventId}`}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>
                          {ev.simpleExplain || ''}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: 12, color: '#334155' }}>
                    {formatDateRange(ev.startDate, ev.endDate)}
                  </td>

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
                      {ev.eventStatus || '-'}
                    </span>
                  </td>

                  <td style={{ padding: 12 }}>
                    <button
                      type="button"
                      onClick={() => navigate(`/events/${ev.eventId}`)}
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
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
            }}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          disabled={page >= (totalPages || 1)}
          onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
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
    </div>
  );
}
