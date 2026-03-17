import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import UseMyInquiryList from '../hooks/UseMyInquiryList';
import eventThumbUrl from '../../../../shared/utils/eventThumbUrl';
import { fetchMyAiContacts } from '../../../../shared/api/adminAiApi';

const SERVICE_TABS = [
  { key: 'EVENT', label: '행사 문의' },
  { key: 'AI', label: 'AI 문의' },
];

const EVENT_TABS = [
  { key: 'ALL', label: '전체' },
  { key: 'WRITTEN', label: '작성 문의' },
  { key: 'RECEIVED', label: '받은 문의' },
];

function StatusBadge({ status }) {
  const done = status === '완료' || status === '답변완료';
  const style = done
    ? { border: '1px solid #86EFAC', background: '#F0FDF4', color: '#166534' }
    : { border: '1px solid #FDE68A', background: '#FFFBEB', color: '#92400E' };

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

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function normalizeAiContact(item, index) {
  const history = Array.isArray(item?.history) ? item.history : [];
  const answer = String(item?.answer ?? '').trim();
  const statusRaw = String(item?.status ?? '').trim();
  const status =
    ['답변완료', '종결'].includes(statusRaw) || answer ? '답변완료' : '대기';
  return {
    id: String(item?.id ?? item?.ticketId ?? `ai-${index}`),
    content: String(item?.content ?? item?.message ?? '').trim(),
    answer,
    status,
    createdAt: item?.createdAt ?? '',
    updatedAt: item?.updatedAt ?? '',
    answeredAt: item?.answeredAt ?? '',
    category: String(item?.category ?? '일반').trim() || '일반',
    priority: String(item?.priority ?? '보통').trim() || '보통',
    sessionId: String(item?.sessionId ?? '').trim(),
    assignee: String(item?.assignee ?? '').trim(),
    history,
  };
}

export default function InquiryListMypage() {
  const navigate = useNavigate();
  const [serviceTab, setServiceTab] = useState('EVENT');
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

  const [aiItems, setAiItems] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    if (serviceTab !== 'AI') return;
    let mounted = true;
    (async () => {
      setAiLoading(true);
      setAiError('');
      try {
        const rows = await fetchMyAiContacts(100);
        if (!mounted) return;
        setAiItems(Array.isArray(rows) ? rows.map(normalizeAiContact) : []);
      } catch (e) {
        if (!mounted) return;
        setAiError(
          e?.response?.data?.message || 'AI 문의 내역을 불러오지 못했어요.'
        );
      } finally {
        if (mounted) setAiLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [serviceTab]);

  const aiPageButtons = useMemo(() => {
    const total = Math.max(1, Math.ceil(aiItems.length / size));
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(total, start + 4);
    for (let p = start; p <= end; p += 1) pages.push(p);
    return pages;
  }, [aiItems.length, page]);

  const aiTotalPages = Math.max(1, Math.ceil(aiItems.length / size));
  const aiPagedItems = useMemo(() => {
    const start = (page - 1) * size;
    return aiItems.slice(start, start + size);
  }, [aiItems, page]);

  const pageButtons = useMemo(() => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages || 1, start + 4);
    for (let p = start; p <= end; p += 1) pages.push(p);
    return pages;
  }, [page, totalPages]);

  const goEventDetail = (row) => {
    if (!row?.eventId) return;
    const status = (row?.eventStatus ?? '')
      .toString()
      .toUpperCase()
      .replace('_', '');
    if (status === 'REPORTDELETED') {
      alert('이 행사에 대한 신고가 접수되어 삭제 처리 되었습니다.');
      return;
    }
    if (status === 'DELETED') {
      alert('주최자에 의하여 행사가 삭제되었습니다.');
      return;
    }
    navigate(`/events/${row.eventId}`);
  };

  const goEventInquiryTab = (row) => {
    if (!row?.eventId) return;
    const status = (row?.eventStatus ?? '')
      .toString()
      .toUpperCase()
      .replace('_', '');
    if (status === 'REPORTDELETED') {
      alert('이 행사에 대한 신고가 접수되어 삭제 처리 되었습니다.');
      return;
    }
    if (status === 'DELETED') {
      alert('주최자에 의하여 행사가 삭제되었습니다.');
      return;
    }
    navigate(`/events/${row.eventId}?tab=inquiry`);
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

        <div
          style={{
            marginTop: 18,
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {SERVICE_TABS.map((t) => {
            const active = serviceTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setServiceTab(t.key);
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
                  boxShadow: active
                    ? '0 10px 22px rgba(17,24,39,0.18)'
                    : '0 6px 14px rgba(17,24,39,0.06)',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {serviceTab === 'EVENT' ? (
          <>
            <div
              style={{
                marginTop: 18,
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              {EVENT_TABS.map((t) => {
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
                      border: active
                        ? '1px solid #111827'
                        : '1px solid #E5E7EB',
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
                        background: active
                          ? 'rgba(255,255,255,0.18)'
                          : '#F3F4F6',
                        color: active ? '#fff' : '#111827',
                      }}
                    >
                      {countLoading ? '…' : Number.isFinite(cnt) ? cnt : 0}
                    </span>
                  </button>
                );
              })}
            </div>

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
                  'minmax(240px, 1fr) minmax(360px, 2fr) 120px',
                gap: 12,
              }}
            >
              <div>행사</div>
              <div>문의내용</div>
              <div style={{ textAlign: 'right' }}>상태</div>
            </div>

            <div
              style={{
                marginTop: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {loading ? (
                <SimpleStateBox text="불러오는 중..." />
              ) : items.length === 0 ? (
                <SimpleStateBox
                  text="아직 문의가 없어요. 이벤트에서 궁금한 걸 바로 남겨보세요."
                  dashed
                  centered
                />
              ) : (
                items.map((row) => {
                  const simpleExplain = pickSimpleExplain(row);
                  const isDeleted = ['DELETED', 'REPORTDELETED'].includes(
                    (row?.eventStatus ?? '')
                      .toString()
                      .toUpperCase()
                      .replace('_', '')
                  );

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
                            onClick={() => goEventDetail(row)}
                            style={{
                              border: 'none',
                              padding: 0,
                              background: 'transparent',
                              cursor: 'pointer',
                              flex: '0 0 auto',
                            }}
                            title={
                              isDeleted
                                ? '삭제된 행사입니다'
                                : '행사 상세로 이동'
                            }
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
                                opacity: isDeleted ? 0.4 : 1,
                              }}
                              onError={(e) => {
                                e.currentTarget.src = '/images/moheng.png';
                              }}
                            />
                          </button>

                          <div style={{ minWidth: 0 }}>
                            <button
                              type="button"
                              onClick={() => goEventDetail(row)}
                              style={{
                                border: 'none',
                                padding: 0,
                                background: 'transparent',
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%',
                              }}
                              title={
                                isDeleted
                                  ? '삭제된 행사입니다'
                                  : '행사 상세로 이동'
                              }
                            >
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 900,
                                  color: isDeleted ? '#9ca3af' : '#111827',
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

                        <div style={{ minWidth: 0 }}>
                          <button
                            type="button"
                            onClick={() => goEventInquiryTab(row)}
                            style={{
                              border: '1px solid #E5E7EB',
                              background: '#F9FAFB',
                              padding: '10px 12px',
                              borderRadius: 14,
                              width: '100%',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                            title={
                              isDeleted
                                ? '삭제된 행사입니다'
                                : '행사 상세(문의 탭)으로 이동'
                            }
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

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <StatusBadge status={row.status} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {totalPages > 1 ? (
              <Pager
                page={page}
                totalPages={totalPages}
                pageButtons={pageButtons}
                onChange={setPage}
              />
            ) : null}
          </>
        ) : (
          <>
            <div
              style={{
                marginTop: 18,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 12,
              }}
            >
              <SummaryCard
                title="전체 AI 문의"
                value={aiItems.length}
                sub="챗봇으로 접수한 문의"
              />
              <SummaryCard
                title="답변 대기"
                value={
                  aiItems.filter((item) => item.status !== '답변완료').length
                }
                sub="운영 확인 중"
              />
              <SummaryCard
                title="답변 완료"
                value={
                  aiItems.filter((item) => item.status === '답변완료').length
                }
                sub="마이페이지에서 확인 가능"
              />
            </div>

            <div
              style={{
                marginTop: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {aiLoading ? (
                <SimpleStateBox text="AI 문의 내역을 불러오는 중입니다..." />
              ) : aiError ? (
                <SimpleStateBox text={aiError} tone="error" />
              ) : aiPagedItems.length === 0 ? (
                <SimpleStateBox
                  text="아직 AI 문의가 없어요. 챗봇에서 '관리자 문의: 내용' 형식으로 접수해보세요."
                  dashed
                  centered
                />
              ) : (
                aiPagedItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid #E5E7EB',
                      borderRadius: 18,
                      background: '#fff',
                      boxShadow: '0 10px 22px rgba(17,24,39,0.06)',
                      padding: 18,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          flexWrap: 'wrap',
                          alignItems: 'center',
                        }}
                      >
                        <StatusBadge status={item.status} />
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 10px',
                            borderRadius: 999,
                            background: '#F8FAFC',
                            color: '#475569',
                            fontSize: 12,
                            fontWeight: 800,
                            border: '1px solid #E2E8F0',
                          }}
                        >
                          {item.category}
                        </span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 10px',
                            borderRadius: 999,
                            background: '#F8FAFC',
                            color: '#475569',
                            fontSize: 12,
                            fontWeight: 800,
                            border: '1px solid #E2E8F0',
                          }}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#64748B',
                          fontWeight: 700,
                        }}
                      >
                        접수 {formatDateTime(item.createdAt)}
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 14,
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                        gap: 14,
                      }}
                    >
                      <div
                        style={{
                          border: '1px solid #E5E7EB',
                          borderRadius: 14,
                          background: '#F8FAFC',
                          padding: 14,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            color: '#64748B',
                            fontWeight: 900,
                          }}
                        >
                          내 문의
                        </div>
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 14,
                            color: '#111827',
                            fontWeight: 800,
                            lineHeight: 1.6,
                          }}
                        >
                          {item.content || '-'}
                        </div>
                      </div>
                      <div
                        style={{
                          border: '1px solid #E5E7EB',
                          borderRadius: 14,
                          background: '#FFFBEB',
                          padding: 14,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            color: '#92400E',
                            fontWeight: 900,
                          }}
                        >
                          관리자 답변
                        </div>
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 14,
                            color: '#111827',
                            fontWeight: 800,
                            lineHeight: 1.6,
                          }}
                        >
                          {item.answer ||
                            '아직 답변을 준비 중입니다. 확인되는 대로 이곳에 표시됩니다.'}
                        </div>
                        <div
                          style={{
                            marginTop: 10,
                            fontSize: 12,
                            color: '#64748B',
                            fontWeight: 700,
                          }}
                        >
                          답변일시{' '}
                          {item.answeredAt
                            ? formatDateTime(item.answeredAt)
                            : '-'}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 12,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                        gap: 10,
                      }}
                    >
                      <MiniField
                        label="담당자"
                        value={item.assignee || '배정 대기'}
                      />
                      <MiniField
                        label="세션 ID"
                        value={item.sessionId || '-'}
                      />
                      <MiniField
                        label="최종 수정"
                        value={formatDateTime(item.updatedAt)}
                      />
                    </div>

                    <div style={{ marginTop: 14 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 900,
                          color: '#111827',
                        }}
                      >
                        처리 이력
                      </div>
                      {item.history.length === 0 ? (
                        <div
                          style={{
                            marginTop: 8,
                            color: '#64748B',
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          접수 이력이 준비 중입니다.
                        </div>
                      ) : (
                        <div
                          style={{
                            marginTop: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                          }}
                        >
                          {item.history.slice(0, 5).map((row) => (
                            <div
                              key={row.id || `${row.createdAt}-${row.action}`}
                              style={{
                                borderLeft: '3px solid #E5E7EB',
                                paddingLeft: 12,
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  gap: 10,
                                  flexWrap: 'wrap',
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 13,
                                    color: '#111827',
                                    fontWeight: 900,
                                  }}
                                >
                                  {row.action || '수정'}
                                </div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: '#64748B',
                                    fontWeight: 700,
                                  }}
                                >
                                  {formatDateTime(row.createdAt)}
                                </div>
                              </div>
                              <div
                                style={{
                                  marginTop: 4,
                                  fontSize: 12,
                                  color: '#475569',
                                  fontWeight: 700,
                                }}
                              >
                                {row.actor || '관리자'}
                              </div>
                              {row?.changes &&
                              Object.keys(row.changes).length > 0 ? (
                                <div
                                  style={{
                                    marginTop: 4,
                                    fontSize: 12,
                                    color: '#64748B',
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {Object.entries(row.changes)
                                    .map(
                                      ([key, value]) =>
                                        `${key}: ${String(value)}`
                                    )
                                    .join(' · ')}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {aiTotalPages > 1 ? (
              <Pager
                page={page}
                totalPages={aiTotalPages}
                pageButtons={aiPageButtons}
                onChange={setPage}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function SimpleStateBox({
  text,
  tone = 'default',
  dashed = false,
  centered = false,
}) {
  return (
    <div
      style={{
        padding: '22px 16px',
        border: dashed
          ? '1px dashed #D1D5DB'
          : tone === 'error'
            ? '1px solid #FCA5A5'
            : '1px solid #E5E7EB',
        borderRadius: 16,
        background: tone === 'error' ? '#FEF2F2' : '#fff',
        color: tone === 'error' ? '#DC2626' : '#6B7280',
        fontWeight: 700,
        textAlign: centered ? 'center' : 'left',
      }}
    >
      {text}
    </div>
  );
}

function Pager({ page, totalPages, pageButtons, onChange }) {
  return (
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
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        style={pagerButtonStyle(page <= 1, true)}
      >
        이전
      </button>
      {pageButtons.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          style={pagerNumberStyle(p === page)}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        style={pagerButtonStyle(page >= totalPages, false)}
      >
        다음
      </button>
    </div>
  );
}

function SummaryCard({ title, value, sub }) {
  return (
    <div
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: 18,
        background: '#fff',
        padding: 18,
        boxShadow: '0 8px 18px rgba(17,24,39,0.05)',
      }}
    >
      <div style={{ fontSize: 13, color: '#64748B', fontWeight: 800 }}>
        {title}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 28,
          color: '#111827',
          fontWeight: 900,
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 12,
          color: '#94A3B8',
          fontWeight: 700,
        }}
      >
        {sub}
      </div>
    </div>
  );
}

function MiniField({ label, value }) {
  return (
    <div
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: 14,
        background: '#fff',
        padding: 12,
      }}
    >
      <div style={{ fontSize: 12, color: '#64748B', fontWeight: 900 }}>
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 13,
          color: '#111827',
          fontWeight: 800,
          wordBreak: 'break-all',
        }}
      >
        {value || '-'}
      </div>
    </div>
  );
}

function pagerButtonStyle(disabled, prev) {
  return {
    minWidth: 56,
    height: 44,
    padding: '0 18px',
    borderRadius: 14,
    border: '1px solid #D1D5DB',
    background: '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 800,
    color: prev ? '#9CA3AF' : '#0F172A',
    opacity: disabled ? 0.45 : 1,
  };
}

function pagerNumberStyle(active) {
  return {
    width: 44,
    height: 44,
    borderRadius: 14,
    border: active ? '1px solid #0F172A' : '1px solid #D1D5DB',
    background: active ? '#0F172A' : '#fff',
    color: active ? '#fff' : '#0F172A',
    cursor: 'pointer',
    fontWeight: 800,
  };
}
