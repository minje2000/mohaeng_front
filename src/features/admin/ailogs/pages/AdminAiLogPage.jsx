import React, { useEffect, useMemo, useState } from 'react';
import { fetchAdminAiLogs } from '../../../../shared/api/adminAiApi';
import Pagination from '../../../../shared/components/common/Pagination';

const PAGE_SIZE = 10;
const STATUS_FILTERS = ['전체', '정상', '오류', 'Rate Limit'];

export default function AdminAiLogPage() {
  const [summary, setSummary] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [intentFilter, setIntentFilter] = useState('전체');
  const [selectedId, setSelectedId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await fetchAdminAiLogs(300);
      setSummary(payload.summary || {});
      setItems(Array.isArray(payload.items) ? payload.items : []);
    } catch (e) {
      setError(e?.response?.data?.message || 'AI 로그를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const normalizedItems = useMemo(
    () => items.map((item, index) => normalizeLog(item, index)),
    [items],
  );

  const intentOptions = useMemo(() => {
    const intents = Array.from(
      new Set(normalizedItems.map((item) => item.intent).filter(Boolean)),
    );
    return ['전체', ...intents];
  }, [normalizedItems]);

  const safeSummary = useMemo(() => {
    const total = Number(summary.total ?? normalizedItems.length ?? 0);
    const errors = Number(summary.errors ?? normalizedItems.filter((item) => item.isError).length ?? 0);
    const rateLimited = Number(
      summary.rateLimited ??
        normalizedItems.filter((item) => item.rateLimited).length ??
        0,
    );
    const avgLatencyMs = Number(
      summary.avgLatencyMs ??
        average(normalizedItems.map((item) => item.latencyMs).filter(Boolean)) ??
        0,
    );
    const topIntent = summary.topIntents?.[0]?.intent || normalizedItems[0]?.intent || '-';
    return { total, errors, rateLimited, avgLatencyMs, topIntent };
  }, [summary, normalizedItems]);

  const filteredItems = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return normalizedItems.filter((item) => {
      const matchesKeyword =
        !q ||
        [
          item.question,
          item.answer,
          item.intent,
          item.pageType,
          item.sessionId,
          item.clientKey,
        ]
          .join(' ')
          .toLowerCase()
          .includes(q);

      const matchesStatus =
        statusFilter === '전체'
          ? true
          : statusFilter === '오류'
            ? item.isError
            : statusFilter === '정상'
              ? !item.isError && !item.rateLimited
              : item.rateLimited;

      const matchesIntent =
        intentFilter === '전체' ? true : item.intent === intentFilter;

      return matchesKeyword && matchesStatus && matchesIntent;
    });
  }, [normalizedItems, keyword, statusFilter, intentFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  const selectedItem = useMemo(() => {
    const candidate = filteredItems.find((item) => item.id === selectedId);
    return candidate || pagedItems[0] || null;
  }, [filteredItems, pagedItems, selectedId]);

  useEffect(() => {
    if (selectedItem) setSelectedId(selectedItem.id);
  }, [selectedItem?.id]);

  return (
    <div>
      <div style={headerRowStyle}>
        <div>
          <h2 style={titleStyle}>AI 로그 분석</h2>
          <p style={descStyle}>
            챗봇 응답 품질, 장애 발생 구간, 주요 인텐트 흐름을 실서비스 운영
            관점으로 모니터링합니다.
          </p>
        </div>
        <button type="button" onClick={load} style={refreshButtonStyle}>
          새로고침
        </button>
      </div>

      <div style={summaryGridStyle}>
        <SummaryCard title="전체 로그" value={safeSummary.total} sub="최근 누적 호출" />
        <SummaryCard title="오류 건수" value={safeSummary.errors} sub="HTTP 400 이상" />
        <SummaryCard title="Rate Limit" value={safeSummary.rateLimited} sub="과호출 차단" />
        <SummaryCard title="평균 응답시간" value={`${safeSummary.avgLatencyMs} ms`} sub="서비스 지연 지표" />
        <SummaryCard title="주요 인텐트" value={safeSummary.topIntent} sub="가장 많이 호출됨" />
      </div>

      <div style={filterPanelStyle}>
        <div style={chipWrapStyle}>
          {STATUS_FILTERS.map((option) => {
            const active = statusFilter === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setStatusFilter(option);
                  setPage(1);
                }}
                style={filterChipStyle(active)}
              >
                {option}
              </button>
            );
          })}
        </div>
        <div style={filterControlsStyle}>
          <select
            value={intentFilter}
            onChange={(e) => {
              setIntentFilter(e.target.value);
              setPage(1);
            }}
            style={selectStyle}
          >
            {intentOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            placeholder="질문, 답변, 세션, 페이지 유형 검색"
            style={searchInputStyle}
          />
        </div>
      </div>

      {loading ? <StateBox text="AI 로그를 불러오는 중입니다..." /> : null}
      {error ? <StateBox text={error} tone="error" /> : null}
      {!loading && !error && filteredItems.length === 0 ? (
        <StateBox text="조건에 맞는 AI 로그가 없습니다." />
      ) : null}

      {!loading && !error && filteredItems.length > 0 ? (
        <>
          <div style={layoutStyle}>
            <section style={tablePanelStyle}>
              <div style={panelHeaderStyle}>
                <strong>로그 목록</strong>
                <span style={mutedStyle}>{filteredItems.length}건</span>
              </div>
              <div style={tableWrapStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>상태</th>
                      <th style={thStyle}>인텐트</th>
                      <th style={thStyle}>질문</th>
                      <th style={thStyle}>응답시간</th>
                      <th style={thStyle}>시각</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedItems.map((item) => {
                      const active = selectedItem?.id === item.id;
                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedId(item.id)}
                          style={trStyle(active)}
                        >
                          <td style={tdStyle}>
                            <span style={statusBadgeStyle(item.statusTone)}>
                              {item.statusLabel}
                            </span>
                          </td>
                          <td style={tdStyle}>{item.intent}</td>
                          <td style={tdStyle}>
                            <div style={questionCellStyle}>{item.question}</div>
                            <div style={subTextStyle}>{item.pageTypeLabel}</div>
                          </td>
                          <td style={tdStyle}>{item.latencyLabel}</td>
                          <td style={tdStyle}>{item.createdAtLabel}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section style={detailPanelStyle}>
              {selectedItem ? (
                <>
                  <div style={panelHeaderStyle}>
                    <div>
                      <strong>로그 상세</strong>
                      <div style={mutedStyle}>로그 ID {selectedItem.id}</div>
                    </div>
                    <span style={statusBadgeStyle(selectedItem.statusTone)}>
                      {selectedItem.statusLabel}
                    </span>
                  </div>

                  <div style={detailGridStyle}>
                    <DetailField label="발생 시각" value={selectedItem.createdAtLabel} />
                    <DetailField label="인텐트" value={selectedItem.intent} />
                    <DetailField label="세션 ID" value={selectedItem.sessionId || '-'} />
                    <DetailField label="Client Key" value={selectedItem.clientKey || '-'} />
                    <DetailField label="페이지 유형" value={selectedItem.pageTypeLabel} />
                    <DetailField label="HTTP 상태" value={String(selectedItem.statusCode)} />
                    <DetailField label="응답시간" value={selectedItem.latencyLabel} />
                    <DetailField label="카드/소스" value={`${selectedItem.cardCount} / ${selectedItem.sourceCount}`} />
                  </div>

                  <div style={contentSectionStyle}>
                    <div style={sectionTitleStyle}>사용자 질문</div>
                    <div style={messageBoxStyle}>{selectedItem.question}</div>
                  </div>

                  <div style={contentSectionStyle}>
                    <div style={sectionTitleStyle}>응답 미리보기</div>
                    <div style={messageBoxStyle}>{selectedItem.answer}</div>
                  </div>

                  <div style={{ padding: 18 }}>
                    <div style={sectionTitleStyle}>운영 메타 정보</div>
                    <div style={metaTagWrapStyle}>
                      <MetaTag label={`rate_limited: ${selectedItem.rateLimited ? 'true' : 'false'}`} />
                      <MetaTag label={`status_code: ${selectedItem.statusCode}`} />
                      <MetaTag label={`card_count: ${selectedItem.cardCount}`} />
                      <MetaTag label={`source_count: ${selectedItem.sourceCount}`} />
                    </div>
                    <pre style={metaBoxStyle}>{selectedItem.metadataText}</pre>
                  </div>
                </>
              ) : null}
            </section>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      ) : null}
    </div>
  );
}

function normalizeLog(item, index) {
  const id = String(item?.id ?? `log-${index}`);
  const statusCode = Number(item?.status_code ?? item?.statusCode ?? (item?.isError ? 500 : 200));
  const latencyMs = Number(item?.latency_ms ?? item?.latencyMs ?? 0);
  const rateLimited = Boolean(item?.rate_limited ?? item?.rateLimited);
  const isError = Boolean(item?.isError) || statusCode >= 400;
  const statusTone = rateLimited ? 'warn' : isError ? 'error' : 'success';
  const statusLabel = rateLimited ? 'Rate Limit' : isError ? '오류' : '정상';
  const metadataRaw = item?.metadata_json ?? item?.metadataJson ?? item?.metadata ?? {};
  const metadataText = stringifyMeta(metadataRaw);
  const pageType = String(item?.page_type ?? item?.pageType ?? '').trim();
  const question = String(item?.question ?? item?.message ?? '').trim() || '-';
  const answer = String(item?.answer ?? item?.answer_preview ?? item?.answerPreview ?? '').trim() || '-';
  const intent = String(item?.intent || 'unknown').trim() || 'unknown';
  const createdAt = item?.createdAt ?? item?.created_at ?? '';

  return {
    ...item,
    id,
    statusCode,
    latencyMs,
    latencyLabel: latencyMs ? `${latencyMs} ms` : '-',
    rateLimited,
    isError,
    statusTone,
    statusLabel,
    question,
    answer,
    intent,
    createdAt,
    createdAtLabel: formatDateTime(createdAt),
    sessionId: String(item?.session_id ?? item?.sessionId ?? '').trim(),
    clientKey: String(item?.client_key ?? item?.clientKey ?? '').trim(),
    pageType,
    pageTypeLabel: pageType || '미지정',
    cardCount: Number(item?.card_count ?? item?.cardCount ?? 0),
    sourceCount: Number(item?.source_count ?? item?.sourceCount ?? 0),
    metadataText,
  };
}

function stringifyMeta(value) {
  if (!value) return '{}';
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
    }
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
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

function average(values) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length);
}

function SummaryCard({ title, value, sub }) {
  return (
    <div style={summaryCardStyle}>
      <div style={summaryTitleStyle}>{title}</div>
      <div style={summaryValueStyle}>{String(value ?? '-')}</div>
      <div style={summarySubStyle}>{sub}</div>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div style={detailFieldStyle}>
      <div style={detailLabelStyle}>{label}</div>
      <div style={detailValueStyle}>{value || '-'}</div>
    </div>
  );
}

function MetaTag({ label }) {
  return <span style={metaTagStyle}>{label}</span>;
}

function StateBox({ text, tone = 'default' }) {
  return <div style={stateBoxStyle(tone)}>{text}</div>;
}

const titleStyle = { fontSize: 28, fontWeight: 800, margin: 0, color: '#111827' };
const descStyle = { margin: '8px 0 0', color: '#6B7280', fontSize: 14, lineHeight: 1.6 };
const mutedStyle = { color: '#6B7280', fontSize: 13 };
const subTextStyle = { color: '#9CA3AF', fontSize: 12, marginTop: 4 };
const headerRowStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 16,
  marginBottom: 20,
  flexWrap: 'wrap',
};
const refreshButtonStyle = {
  border: '1px solid #E5E7EB',
  background: '#fff',
  borderRadius: 12,
  padding: '10px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};
const summaryGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12,
  marginBottom: 18,
};
const summaryCardStyle = {
  border: '1px solid #E5E7EB',
  background: '#fff',
  borderRadius: 18,
  padding: 18,
  boxShadow: '0 8px 24px rgba(17,24,39,0.04)',
};
const summaryTitleStyle = { color: '#6B7280', fontSize: 13, marginBottom: 8, fontWeight: 700 };
const summaryValueStyle = { color: '#111827', fontSize: 24, fontWeight: 800, marginBottom: 6 };
const summarySubStyle = { color: '#9CA3AF', fontSize: 12 };
const filterPanelStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  marginBottom: 18,
  flexWrap: 'wrap',
};
const chipWrapStyle = { display: 'flex', gap: 8, flexWrap: 'wrap' };
const filterChipStyle = (active) => ({
  border: active ? '1px solid #FACC15' : '1px solid #E5E7EB',
  background: active ? '#FFF8D6' : '#fff',
  color: '#111827',
  borderRadius: 999,
  padding: '9px 14px',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
});
const filterControlsStyle = { display: 'flex', gap: 10, flexWrap: 'wrap', flex: '1 1 420px' };
const selectStyle = {
  minWidth: 160,
  border: '1px solid #E5E7EB',
  background: '#fff',
  borderRadius: 12,
  padding: '11px 14px',
  fontSize: 14,
  color: '#111827',
};
const searchInputStyle = {
  minWidth: 260,
  flex: '1 1 280px',
  border: '1px solid #E5E7EB',
  background: '#fff',
  borderRadius: 12,
  padding: '11px 14px',
  fontSize: 14,
  color: '#111827',
};
const stateBoxStyle = (tone) => ({
  border: `1px solid ${tone === 'error' ? '#FCA5A5' : '#E5E7EB'}`,
  color: tone === 'error' ? '#B91C1C' : '#4B5563',
  background: tone === 'error' ? '#FEF2F2' : '#fff',
  borderRadius: 16,
  padding: 18,
  marginBottom: 16,
});
const layoutStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.25fr) minmax(360px, 0.95fr)',
  gap: 16,
  alignItems: 'start',
};
const basePanelStyle = {
  border: '1px solid #E5E7EB',
  background: '#fff',
  borderRadius: 20,
  overflow: 'hidden',
  boxShadow: '0 8px 24px rgba(17,24,39,0.04)',
};
const tablePanelStyle = { ...basePanelStyle };
const detailPanelStyle = { ...basePanelStyle };
const panelHeaderStyle = {
  padding: '18px 18px 14px',
  borderBottom: '1px solid #F3F4F6',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
};
const tableWrapStyle = { overflowX: 'auto' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thStyle = {
  textAlign: 'left',
  padding: '14px 16px',
  fontSize: 12,
  fontWeight: 800,
  color: '#6B7280',
  background: '#F9FAFB',
  borderBottom: '1px solid #E5E7EB',
  whiteSpace: 'nowrap',
};
const trStyle = (active) => ({
  background: active ? '#FFFBEB' : '#fff',
  cursor: 'pointer',
});
const tdStyle = {
  padding: '14px 16px',
  borderBottom: '1px solid #F3F4F6',
  fontSize: 14,
  color: '#111827',
  verticalAlign: 'top',
};
const questionCellStyle = {
  maxWidth: 320,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  lineHeight: 1.5,
};
const statusBadgeStyle = (tone) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 74,
  padding: '6px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
  color:
    tone === 'success' ? '#166534' : tone === 'warn' ? '#92400E' : '#991B1B',
  background:
    tone === 'success' ? '#DCFCE7' : tone === 'warn' ? '#FEF3C7' : '#FEE2E2',
});
const detailGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 12,
  padding: 18,
  borderBottom: '1px solid #F3F4F6',
};
const detailFieldStyle = {
  border: '1px solid #F3F4F6',
  borderRadius: 14,
  padding: 14,
  background: '#F9FAFB',
};
const detailLabelStyle = { color: '#6B7280', fontSize: 12, marginBottom: 6, fontWeight: 700 };
const detailValueStyle = { color: '#111827', fontSize: 14, fontWeight: 600, wordBreak: 'break-word' };
const contentSectionStyle = { padding: 18, borderBottom: '1px solid #F3F4F6' };
const sectionTitleStyle = { fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 10 };
const messageBoxStyle = {
  border: '1px solid #E5E7EB',
  borderRadius: 16,
  background: '#fff',
  padding: 16,
  whiteSpace: 'pre-wrap',
  lineHeight: 1.7,
  color: '#111827',
  minHeight: 110,
};
const metaTagWrapStyle = { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 };
const metaTagStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  border: '1px solid #E5E7EB',
  padding: '7px 10px',
  background: '#F9FAFB',
  color: '#374151',
  fontSize: 12,
  fontWeight: 700,
};
const metaBoxStyle = {
  margin: 0,
  background: '#111827',
  color: '#F9FAFB',
  padding: 16,
  borderRadius: 16,
  fontSize: 12,
  lineHeight: 1.7,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  overflowX: 'auto',
};
