import React, { useEffect, useMemo, useState } from 'react';
import { fetchAdminAiLogs } from '../../../../shared/api/adminAiApi';
import Pagination from '../../../../shared/components/common/Pagination';

const PAGE_SIZE = 5;
const STATUS_ALL = 'all';
const STATUS_NORMAL = 'normal';
const STATUS_ERROR = 'error';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hour = date.getHours();
  const ampm = hour < 12 ? '오전' : '오후';
  const hh = String(((hour + 11) % 12) + 1).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}. ${m}. ${d}. ${ampm} ${hh}:${mm}`;
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
          fontSize: textValue ? 18 : 24,
          fontWeight: 800,
          color: '#0F172A',
          marginBottom: 10,
          lineHeight: 1.3,
          wordBreak: 'break-word',
        }}
      >
        {String(value ?? '-')}
      </div>
      <div style={{ fontSize: 13, color: '#94A3B8' }}>{description}</div>
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 46,
        padding: '0 20px',
        borderRadius: 999,
        border: active ? '1.5px solid #EAB308' : '1px solid #CBD5E1',
        background: active ? '#FFF8DB' : '#FFFFFF',
        color: '#0F172A',
        fontSize: 15,
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function Pill({ children, kind = 'default' }) {
  const map = {
    success: { bg: '#DCFCE7', fg: '#15803D' },
    error: { bg: '#FEE2E2', fg: '#B91C1C' },
    default: { bg: '#E2E8F0', fg: '#334155' },
  };
  const theme = map[kind] || map.default;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 76,
        height: 34,
        padding: '0 14px',
        borderRadius: 999,
        background: theme.bg,
        color: theme.fg,
        fontSize: 14,
        fontWeight: 700,
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
          fontWeight: 700,
          color: '#0F172A',
          lineHeight: multiline ? 1.65 : 1.45,
          whiteSpace: multiline ? 'pre-wrap' : 'normal',
          wordBreak: mono ? 'break-all' : 'keep-all',
          fontFamily: mono
            ? 'ui-monospace, SFMono-Regular, Menlo, monospace'
            : 'inherit',
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
        border: `1px solid ${error ? '#FECACA' : '#E2E8F0'}`,
        background: error ? '#FEF2F2' : '#FFFFFF',
        color: error ? '#B91C1C' : '#64748B',
        borderRadius: 18,
        padding: '18px 20px',
        fontSize: 14,
      }}
    >
      {text}
    </div>
  );
}

const searchInputStyle = {
  height: 46,
  width: '100%',
  borderRadius: 16,
  border: '1px solid #CBD5E1',
  background: '#FFFFFF',
  padding: '0 16px',
  boxSizing: 'border-box',
  fontSize: 15,
  color: '#0F172A',
  outline: 'none',
};

const panelStyle = {
  border: '1px solid #CBD5E1',
  borderRadius: 24,
  background: '#FFFFFF',
  overflow: 'hidden',
};

const panelHeaderStyle = {
  padding: '20px 20px 16px',
  borderBottom: '1px solid #E2E8F0',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 14,
};

const listCardStyle = {
  width: '100%',
  borderRadius: 20,
  padding: 18,
  cursor: 'pointer',
  textAlign: 'left',
  background: '#FFFFFF',
};
