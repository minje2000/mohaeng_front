import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import UseMyInquiryList from '../hooks/UseMyInquiryList';
import eventThumbUrl from '../../../../shared/utils/eventThumbUrl';

const TABS = [
  { key: 'ALL', label: '전체' },
  { key: 'WRITTEN', label: '작성 문의' },
  { key: 'RECEIVED', label: '받은 문의' },
];

function StatusBadge({ status }) {
  const done = status === '완료';
  const style = done
    ? { border: '1px solid #86EFAC', background: '#F0FDF4', color: '#166534' } // green
    : { border: '1px solid #FDE68A', background: '#FFFBEB', color: '#92400E' }; // amber

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {done ? '완료' : '대기'}
    </span>
  );
}

function clampText(text, max = 120) {
  const t = (text ?? '').toString().trim();
  if (!t) return '';
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export default function InquiryListMypage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('ALL');
  const [page, setPage] = useState(1);
  const size = 5;

  const {
    items,
    totalPages,
    countsByTab,
    loading,
    countLoading,
    eventSimpleExplainById,
  } = UseMyInquiryList(tab, page, size);

  const pageButtons = useMemo(() => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages || 1, start + 4);
    for (let p = start; p <= end; p += 1) pages.push(p);
    return pages;
  }, [page, totalPages]);

  const goEventDetail = (eventId) => {
    if (!eventId) return;
    navigate(`/events/${eventId}`);
  };

  const goEventInquiryTab = (eventId) => {
    if (!eventId) return;
    // ✅ 행사 상세페이지의 문의 탭으로 이동(기존 방식 유지)
    navigate(`/events/${eventId}?tab=inquiry`);
  };

  const pickSimpleExplain = (row) => {
    return (
      row?.eventSimpleExplain ??
      row?.simpleExplain ??
      row?.event?.simpleExplain ??
      eventSimpleExplainById?.[row?.eventId] ??
      ''
    );
  };

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
              문의 내역
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
            const cnt = countsByTab?.[t.key];
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setTab(t.key);
                  setPage(1);
                }}
                style={{
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
                }}
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
                  {countLoading ? '…' : Number.isFinite(cnt) ? cnt : 0}
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
            gridTemplateColumns: 'minmax(240px, 1fr) minmax(360px, 2fr) 120px',
            gap: 12,
          }}
        >
          <div>행사</div>
          <div>문의내용</div>
          <div style={{ textAlign: 'right' }}>상태</div>
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
                borderRadius: 16,
                background: '#fff',
                color: '#6B7280',
                fontWeight: 700,
              }}
            >
              불러오는 중...
            </div>
          ) : items.length === 0 ? (
            <div
              style={{
                padding: '26px 16px',
                border: '1px dashed #D1D5DB',
                borderRadius: 16,
                background: '#fff',
                color: '#6B7280',
                textAlign: 'center',
                fontWeight: 800,
              }}
            >
              아직 문의가 없어요. 이벤트에서 궁금한 걸 바로 남겨보세요.
            </div>
          ) : (
            items.map((row) => {
              const simpleExplain = pickSimpleExplain(row);

              return (
                <div
                  key={row.inqId}
                  style={{
                    border: '1px solid #E5E7EB',
                    borderRadius: 18,
                    background: '#fff',
                    boxShadow: '0 10px 22px rgba(17,24,39,0.06)',
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'minmax(240px, 1fr) minmax(360px, 2fr) 120px',
                      gap: 12,
                      alignItems: 'center',
                    }}
                  >
                    {/* Event */}
                    <div
                      style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        minWidth: 0,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => goEventDetail(row.eventId)}
                        style={{
                          border: 'none',
                          padding: 0,
                          background: 'transparent',
                          cursor: 'pointer',
                          flex: '0 0 auto',
                        }}
                        title="행사 상세로 이동"
                      >
                        <img
                          src={eventThumbUrl(row.eventThumbnail)}
                          alt="event"
                          style={{
                            width: 54,
                            height: 54,
                            borderRadius: 14,
                            objectFit: 'cover',
                            border: '1px solid #E5E7EB',
                            background: '#F3F4F6',
                          }}
                          onError={(e) => {
                            e.currentTarget.src = '/images/moheng.png';
                          }}
                        />
                      </button>

                      <div style={{ minWidth: 0 }}>
                        <button
                          type="button"
                          onClick={() => goEventDetail(row.eventId)}
                          style={{
                            border: 'none',
                            padding: 0,
                            background: 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%',
                          }}
                          title="행사 상세로 이동"
                        >
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 900,
                              color: '#111827',
                              letterSpacing: '-0.02em',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
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
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ minWidth: 0 }}>
                      <button
                        type="button"
                        onClick={() => goEventInquiryTab(row.eventId)}
                        style={{
                          border: '1px solid #E5E7EB',
                          background: '#F9FAFB',
                          padding: '10px 12px',
                          borderRadius: 14,
                          width: '100%',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                        title="행사 상세(문의 탭)으로 이동"
                      >
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 900,
                            color: '#111827',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.35,
                          }}
                        >
                          {clampText(row.content, 140)}
                        </div>

                        <div
                          style={{
                            marginTop: 10,
                            fontSize: 12,
                            color: row.replyContent ? '#374151' : '#6B7280',
                            fontWeight: 800,
                            lineHeight: 1.35,
                            paddingLeft: 10,
                            borderLeft: '2px solid #E5E7EB',
                          }}
                        >
                          {row.replyContent
                            ? `ㄴ ${clampText(row.replyContent, 120)}`
                            : 'ㄴ 답변 준비 중입니다. 확인되는 대로 빠르게 안내드릴게요.'}
                        </div>
                      </button>
                    </div>

                    {/* Status */}
                    <div
                      style={{ display: 'flex', justifyContent: 'flex-end' }}
                    >
                      <StatusBadge status={row.status} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 ? (
          <div
            style={{
              marginTop: 18,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                border: '1px solid #E5E7EB',
                background: '#fff',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                fontWeight: 900,
                color: '#111827',
                opacity: page <= 1 ? 0.45 : 1,
              }}
            >
              ‹
            </button>

            {pageButtons.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  border:
                    p === page ? '1px solid #111827' : '1px solid #E5E7EB',
                  background: p === page ? '#111827' : '#fff',
                  color: p === page ? '#fff' : '#111827',
                  cursor: 'pointer',
                  fontWeight: 900,
                }}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                border: '1px solid #E5E7EB',
                background: '#fff',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                fontWeight: 900,
                color: '#111827',
                opacity: page >= totalPages ? 0.45 : 1,
              }}
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
