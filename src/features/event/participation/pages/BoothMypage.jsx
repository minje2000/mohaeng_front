import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStore } from '../../../../app/http/tokenStore';
import eventThumbUrl from '../../../../shared/utils/eventThumbUrl';
// ❌ import { ParticipationBoothApi } from '../api/ParticipationBoothApi';
import { cancelBoothParticipation } from '../api/ParticipationBoothApi';
import UseBoothMypage from '../hooks/UseBoothMypage';

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return '-';
  const s = startDate ? String(startDate).replaceAll('-', '.') : '-';
  const e = endDate ? String(endDate).replaceAll('-', '.') : '-';
  return `${s} ~ ${e}`;
}

export default function BoothMypage() {
  const navigate = useNavigate();
  const hasToken = useMemo(() => !!tokenStore.getAccess?.(), []);

  const [page, setPage] = useState(1);
  const size = 5;

  const { items, totalPages, loading, reload } = UseBoothMypage(page, size);

  const pages = useMemo(() => {
    const out = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages || 1, start + 4);
    for (let p = start; p <= end; p += 1) out.push(p);
    return out;
  }, [page, totalPages]);

  const onCancel = async (pctBoothId) => {
    if (!pctBoothId) return;
    if (!window.confirm('부스 신청을 취소할까요?')) return;
    await cancelBoothParticipation(pctBoothId);
    reload();
  };

  if (!hasToken) return <div style={{ padding: 16 }}>로그인이 필요합니다.</div>;

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 16 }}>
      <h2 style={{ margin: '8px 0 16px' }}>부스 관리</h2>

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
              <th style={{ textAlign: 'left', padding: 12, width: 360 }}>
                행사
              </th>
              <th style={{ textAlign: 'left', padding: 12, width: 220 }}>
                부스
              </th>
              <th style={{ textAlign: 'left', padding: 12, width: 160 }}>
                신청
              </th>
              <th style={{ textAlign: 'left', padding: 12, width: 110 }}>
                상태
              </th>
              <th style={{ textAlign: 'left', padding: 12, width: 170 }}>
                신청일
              </th>
              <th style={{ textAlign: 'left', padding: 12, width: 120 }}>
                관리
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: 18, textAlign: 'center' }}>
                  불러오는 중...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 18, textAlign: 'center' }}>
                  부스 신청 내역이 없습니다.
                </td>
              </tr>
            ) : (
              items.map((b) => (
                <tr
                  key={b.pctBoothId}
                  style={{ borderBottom: '1px solid #F1F5F9' }}
                >
                  <td style={{ padding: 12 }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                    >
                      <img
                        src={eventThumbUrl(b.eventThumbnail)}
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
                          {b.eventTitle || `행사 #${b.eventId}`}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>
                          {formatDateRange(b.startDate, b.endDate)}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: 12 }}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>
                        {b.boothTitle || '-'}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>
                        {b.boothTopic || ''}
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: 12, color: '#334155' }}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}
                    >
                      <div>수량: {b.boothCount ?? '-'}</div>
                      <div>금액: {b.totalPrice ?? 0}원</div>
                    </div>
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
                      {b.status || '-'}
                    </span>
                  </td>

                  <td style={{ padding: 12, color: '#334155' }}>
                    {b._createdAtText || '-'}
                  </td>

                  <td style={{ padding: 12, display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() =>
                        b.eventId && navigate(`/events/${b.eventId}`)
                      }
                      style={{
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: '1px solid #E5E7EB',
                        background: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      행사
                    </button>
                    <button
                      type="button"
                      onClick={() => onCancel(b.pctBoothId)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: '1px solid #E5E7EB',
                        background: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      취소
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
