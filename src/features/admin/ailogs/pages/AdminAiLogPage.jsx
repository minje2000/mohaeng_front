import React, { useEffect, useMemo, useState } from 'react';
import { fetchAdminAiLogs } from '../../../../shared/api/adminAiApi';
import Pagination from '../../../../shared/components/common/Pagination';

const PAGE_SIZE = 5;
const STATUS_ALL = 'all';
const STATUS_NORMAL = 'normal';
const STATUS_ERROR = 'error';

function parseAsDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const text = String(value).trim();
  if (!text) return null;

  const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(text);
  const normalized = hasTimezone ? text : text.replace(' ', 'T') + 'Z';
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseAsDate(value);
  if (!date) return value ? String(value) : '-';

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function isErrorLog(item) {
  const statusCode = Number(item?.statusCode ?? item?.status_code ?? 200);
  return Boolean(item?.isError || item?.is_error || statusCode >= 400);
}

function statusLabel(item) {
  return isErrorLog(item) ? '오류' : '정상';
}

function normalizeIntent(item) {
  return item?.intent || 'chat';
}

function normalizeQuestion(item) {
  return item?.question || item?.message || '-';
}

function normalizeAnswer(item) {
  return item?.answer || item?.answer_preview || item?.answerPreview || '-';
}

function normalizeCreatedAt(item) {
  return item?.createdAt || item?.created_at || '';
}

function normalizeSessionId(item) {
  return item?.sessionId || item?.session_id || '';
}

function getUniqueIntents(items) {
  return Array.from(
    new Set(items.map((item) => normalizeIntent(item)).filter(Boolean))
  );
}

export default function AdminAiLogPage() {
  const [summary, setSummary] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(STATUS_ALL);
  const [intentFilter, setIntentFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const payload = await fetchAdminAiLogs(150);
        if (!mounted) return;
        const nextItems = Array.isArray(payload.items) ? payload.items : [];
        setSummary(payload.summary || {});
        setItems(nextItems);
        setSelectedId((prev) => prev || nextItems[0]?.id || '');
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || 'AI 로그를 불러오지 못했어요.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const uniqueIntents = useMemo(() => getUniqueIntents(items), [items]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter === STATUS_NORMAL && isErrorLog(item)) return false;
      if (statusFilter === STATUS_ERROR && !isErrorLog(item)) return false;
      if (intentFilter !== 'all' && normalizeIntent(item) !== intentFilter)
        return false;
      if (!q) return true;
      const haystack = [
        item?.id,
        normalizeQuestion(item),
        normalizeAnswer(item),
        normalizeSessionId(item),
        normalizeIntent(item),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, statusFilter, intentFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  useEffect(() => {
    if (!pagedItems.length) {
      setSelectedId('');
      return;
    }
    if (!pagedItems.some((item) => String(item.id) === String(selectedId))) {
      setSelectedId(String(pagedItems[0].id));
    }
  }, [pagedItems, selectedId]);

  const selected = useMemo(
    () =>
      filteredItems.find((item) => String(item.id) === String(selectedId)) ||
      pagedItems[0] ||
      null,
    [filteredItems, pagedItems, selectedId]
  );

  const topIntent = summary?.topIntents?.[0]?.intent || uniqueIntents[0] || '-';
  const total = summary?.total ?? items.length;
  const errorsCount = summary?.errors ?? items.filter(isErrorLog).length;

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <style>{`
        .ai-log-id-scroll {
          overflow-x: auto;
          overflow-y: hidden;
          white-space: nowrap;
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          padding-bottom: 2px;
        }
        .ai-log-id-scroll:hover,
        .ai-log-id-scroll:focus-within {
          scrollbar-color: rgba(148,163,184,.65) transparent;
        }
        .ai-log-id-scroll::-webkit-scrollbar { height: 6px; }
        .ai-log-id-scroll::-webkit-scrollbar-track { background: transparent; }
        .ai-log-id-scroll::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 999px;
        }
        .ai-log-id-scroll:hover::-webkit-scrollbar-thumb,
        .ai-log-id-scroll:focus-within::-webkit-scrollbar-thumb {
          background: rgba(148,163,184,.65);
        }
      `}</style>

      <section
        style={{
          background: '#F8F3E4',
          border: '1px solid #E9D8A6',
          borderRadius: 28,
          padding: '26px 28px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 14px',
            borderRadius: 999,
            background: '#0F172A',
            color: '#FACC15',
            fontSize: 14,
            fontWeight: 800,
            marginBottom: 16,
          }}
        >
          AI 운영센터
        </div>
        <h2
          style={{ fontSize: 26, fontWeight: 800, margin: 0, color: '#0F172A' }}
        >
          AI 로그 분석
        </h2>
      </section>

      {!loading && !error ? (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 14,
          }}
        >
          <SummaryCard
            title="전체 로그"
            value={total}
            description="최근 조회 기준"
          />
          <SummaryCard
            title="오류 로그"
            value={errorsCount}
            description="오류 응답 건수"
            danger={errorsCount > 0}
          />
          <SummaryCard
            title="주요 인텐트"
            value={topIntent}
            description="가장 많이 들어온 질문"
            textValue
          />
        </section>
      ) : null}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto auto auto minmax(260px, 1fr) 180px',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <FilterChip
          active={statusFilter === STATUS_ALL}
          onClick={() => setStatusFilter(STATUS_ALL)}
        >
          전체
        </FilterChip>
        <FilterChip
          active={statusFilter === STATUS_NORMAL}
          onClick={() => setStatusFilter(STATUS_NORMAL)}
        >
          정상
        </FilterChip>
        <FilterChip
          active={statusFilter === STATUS_ERROR}
          onClick={() => setStatusFilter(STATUS_ERROR)}
        >
          오류
        </FilterChip>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="질문, 답변, 로그 ID 검색"
          style={searchInputStyle}
        />
        <select
          value={intentFilter}
          onChange={(e) => setIntentFilter(e.target.value)}
          style={searchInputStyle}
        >
          <option value="all">전체 인텐트</option>
          {uniqueIntents.map((intent) => (
            <option key={intent} value={intent}>
              {intent}
            </option>
          ))}
        </select>
      </section>

      {loading ? <StateBox text="불러오는 중..." /> : null}
      {error ? <StateBox text={error} error /> : null}
      {!loading && !error && filteredItems.length === 0 ? (
        <StateBox text="조건에 맞는 로그가 없습니다." />
      ) : null}

      {!loading && !error && filteredItems.length > 0 ? (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.95fr',
            gap: 16,
            alignItems: 'start',
          }}
        >
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <div
                  style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}
                >
                  로그 목록
                </div>
                <div style={{ marginTop: 6, fontSize: 14, color: '#64748B' }}>
                  {filteredItems.length}건 · 페이지당 {PAGE_SIZE}건
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12, padding: 16 }}>
              {pagedItems.map((item) => {
                const selectedNow = String(item.id) === String(selected?.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(String(item.id))}
                    style={{
                      ...listCardStyle,
                      border: selectedNow
                        ? '1.5px solid #EAB308'
                        : '1px solid #E2E8F0',
                      background: selectedNow ? '#FFFBEF' : '#FFFFFF',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
                      >
                        <Pill kind={isErrorLog(item) ? 'error' : 'success'}>
                          {statusLabel(item)}
                        </Pill>
                        <Pill>{normalizeIntent(item)}</Pill>
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          color: '#64748B',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatDate(normalizeCreatedAt(item))}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        lineHeight: 1.55,
                        color: '#0F172A',
                        textAlign: 'left',
                        marginBottom: 10,
                      }}
                    >
                      {normalizeQuestion(item)}
                    </div>

                    <div
                      style={{
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: '#64748B',
                        textAlign: 'left',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: 10,
                      }}
                    >
                      {normalizeAnswer(item)}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: 14,
                        flexWrap: 'wrap',
                        fontSize: 13,
                        color: '#94A3B8',
                      }}
                    >
                      <span>
                        로그 ID {String(item.id || '-').slice(0, 10)}...
                      </span>
                      {normalizeSessionId(item) ? (
                        <span>세션 연결됨</span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ padding: '0 16px 16px' }}>
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
              />
            </div>
          </div>

          <div style={panelStyle}>
            {selected ? (
              <>
                <div style={panelHeaderStyle}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: '#0F172A',
                      }}
                    >
                      로그 상세
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          color: '#64748B',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        로그 ID
                      </span>
                      <div
                        className="ai-log-id-scroll"
                        style={{ minWidth: 0, flex: 1 }}
                      >
                        <span style={{ fontSize: 14, color: '#475569' }}>
                          {String(selected.id || '-')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Pill kind={isErrorLog(selected) ? 'error' : 'success'}>
                    {statusLabel(selected)}
                  </Pill>
                </div>

                <div style={{ padding: 16, display: 'grid', gap: 12 }}>
                  <InfoRow
                    label="발생 시각"
                    value={formatDate(normalizeCreatedAt(selected))}
                  />
                  <InfoRow label="인텐트" value={normalizeIntent(selected)} />
                  {normalizeSessionId(selected) ? (
                    <InfoRow
                      label="세션 ID"
                      value={normalizeSessionId(selected)}
                      mono
                    />
                  ) : null}
                  <InfoRow
                    label="질문"
                    value={normalizeQuestion(selected)}
                    multiline
                  />
                  <InfoRow
                    label="답변"
                    value={normalizeAnswer(selected)}
                    multiline
                  />
                </div>
              </>
            ) : (
              <div style={{ padding: 24, color: '#64748B' }}>
                확인할 로그를 선택해 주세요.
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  danger = false,
  textValue = false,
}) {
  return (
    <div
      style={{
        border: `1px solid ${danger ? '#F5C2C7' : '#CBD5E1'}`,
        borderRadius: 22,
        padding: '22px 20px',
        background: '#FFFFFF',
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: '#334155',
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: textValue ? 28 : 34,
          fontWeight: 800,
          color: danger ? '#B91C1C' : '#0F172A',
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 10, fontSize: 13, color: '#64748B' }}>
        {description}
      </div>
    </div>
  );
}

function FilterChip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 44,
        borderRadius: 999,
        border: active ? '1px solid #EAB308' : '1px solid #E2E8F0',
        background: active ? '#FEF3C7' : '#FFFFFF',
        color: active ? '#92400E' : '#475569',
        fontWeight: 700,
        padding: '0 18px',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function Pill({ children, kind = 'default' }) {
  const palette =
    kind === 'success'
      ? { background: '#DCFCE7', color: '#166534' }
      : kind === 'error'
        ? { background: '#FEE2E2', color: '#B91C1C' }
        : { background: '#E2E8F0', color: '#334155' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 12px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 700,
        background: palette.background,
        color: palette.color,
      }}
    >
      {children}
    </span>
  );
}

function InfoRow({ label, value, multiline = false, mono = false }) {
  return (
    <div
      style={{
        border: '1px solid #E2E8F0',
        borderRadius: 18,
        padding: '14px 16px',
        background: '#F8FAFC',
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#64748B',
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: '#0F172A',
          lineHeight: multiline ? 1.7 : 1.5,
          whiteSpace: multiline ? 'pre-wrap' : 'normal',
          wordBreak: 'break-word',
          fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : 'inherit',
        }}
      >
        {value || '-'}
      </div>
    </div>
  );
}

function StateBox({ text, error = false }) {
  return (
    <div
      style={{
        borderRadius: 20,
        padding: '20px 22px',
        background: error ? '#FEF2F2' : '#F8FAFC',
        border: `1px solid ${error ? '#FECACA' : '#E2E8F0'}`,
        color: error ? '#B91C1C' : '#475569',
        fontWeight: 600,
      }}
    >
      {text}
    </div>
  );
}

const panelStyle = {
  background: '#FFFFFF',
  border: '1px solid #CBD5E1',
  borderRadius: 26,
  overflow: 'hidden',
};

const panelHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
  padding: '22px 20px 0',
};

const listCardStyle = {
  width: '100%',
  borderRadius: 20,
  padding: 18,
  cursor: 'pointer',
  textAlign: 'left',
};

const searchInputStyle = {
  width: '100%',
  height: 44,
  borderRadius: 14,
  border: '1px solid #CBD5E1',
  padding: '0 14px',
  fontSize: 14,
  color: '#0F172A',
  outline: 'none',
  background: '#FFFFFF',
};
