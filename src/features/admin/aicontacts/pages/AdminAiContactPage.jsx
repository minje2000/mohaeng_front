import React, { useEffect, useMemo, useState } from 'react';
import {
  deleteAdminAiContact,
  fetchAdminAiContacts,
  updateAdminAiContact,
} from '../../../../shared/api/adminAiApi';
import Pagination from '../../../../shared/components/common/Pagination';

const PAGE_SIZE = 7;
const STATUS_OPTIONS = ['전체', '대기', '처리중', '답변완료', '종결'];
const CATEGORY_OPTIONS = ['전체', '일반', '회원 문의', '결제', '행사', '계정'];
const PRIORITY_OPTIONS = ['낮음', '보통', '높음', '긴급'];

export default function AdminAiContactPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [selectedId, setSelectedId] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [assignee, setAssignee] = useState('');
  const [status, setStatus] = useState('대기');
  const [category, setCategory] = useState('일반');
  const [priority, setPriority] = useState('보통');
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchAdminAiContacts(300);
      setItems(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError(e?.response?.data?.message || 'AI 문의를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const normalizedItems = useMemo(
    () => items.map((item, index) => normalizeContact(item, index)),
    [items]
  );

  const summary = useMemo(() => {
    const total = normalizedItems.length;
    const waiting = normalizedItems.filter(
      (item) => item.status === '대기'
    ).length;
    const progress = normalizedItems.filter(
      (item) => item.status === '처리중'
    ).length;
    const answered = normalizedItems.filter(
      (item) => item.status === '답변완료'
    ).length;
    const urgent = normalizedItems.filter(
      (item) => item.priority === '긴급'
    ).length;
    return { total, waiting, progress, answered, urgent };
  }, [normalizedItems]);

  const filteredItems = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return normalizedItems.filter((item) => {
      const matchesStatus =
        statusFilter === '전체' || item.status === statusFilter;
      const matchesCategory =
        categoryFilter === '전체' || item.category === categoryFilter;
      const matchesKeyword =
        !q ||
        [
          item.id,
          item.content,
          item.answer,
          item.sessionId,
          item.sourceLabel,
          item.assignee,
          item.category,
          item.priority,
        ]
          .join(' ')
          .toLowerCase()
          .includes(q);
      return matchesStatus && matchesCategory && matchesKeyword;
    });
  }, [normalizedItems, statusFilter, categoryFilter, keyword]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  const selectedItem = useMemo(() => {
    return (
      filteredItems.find((item) => item.id === selectedId) ||
      pagedItems[0] ||
      null
    );
  }, [filteredItems, pagedItems, selectedId]);

  useEffect(() => {
    if (!selectedItem) {
      setSelectedId(null);
      setAnswerText('');
      setAssignee('');
      setStatus('대기');
      setCategory('일반');
      setPriority('보통');
      setMemo('');
      return;
    }
    setSelectedId(selectedItem.id);
    setAnswerText(selectedItem.answer || '');
    setAssignee(selectedItem.assignee || '');
    setStatus(selectedItem.status || '대기');
    setCategory(selectedItem.category || '일반');
    setPriority(selectedItem.priority || '보통');
    setMemo('');
  }, [selectedItem?.id]);

  const upsertLocalItem = (updated) => {
    const normalized = normalizeContact(updated, 0);
    setItems((prev) => {
      const found = prev.some(
        (item, index) => normalizeContact(item, index).id === normalized.id
      );
      if (!found) return prev;
      return prev.map((item, index) =>
        normalizeContact(item, index).id === normalized.id
          ? { ...item, ...normalized }
          : item
      );
    });
  };

  const handleSave = async () => {
    if (!selectedItem) return;
    setSaving(true);
    setError('');
    try {
      const updated = await updateAdminAiContact(selectedItem.id, {
        answer: answerText.trim(),
        assignee: assignee.trim(),
        status,
        category,
        priority,
        memo: memo.trim(),
      });
      if (updated) {
        upsertLocalItem(updated);
        setMemo('');
      }
    } catch (e) {
      setError(e?.response?.data?.message || '문의 저장에 실패했어요.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    const ok = window.confirm(
      '이 문의를 삭제할까요? 삭제 후 복구할 수 없습니다.'
    );
    if (!ok) return;
    setDeleting(true);
    setError('');
    try {
      await deleteAdminAiContact(selectedItem.id);
      setItems((prev) =>
        prev.filter(
          (item, index) => normalizeContact(item, index).id !== selectedItem.id
        )
      );
      setSelectedId(null);
    } catch (e) {
      setError(e?.response?.data?.message || '문의 삭제에 실패했어요.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>AI 운영센터</div>
          <h2 style={titleStyle}>AI 문의 관리</h2>
        </div>
        <div style={heroActionsStyle}>
          <button type="button" onClick={load} style={secondaryBtnStyle}>
            새로고침
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !selectedItem}
            style={primaryBtnStyle(saving || !selectedItem)}
          >
            {saving ? '저장 중...' : '문의 저장'}
          </button>
        </div>
      </div>

      <div style={summaryGridStyle}>
        <SummaryCard
          title="전체 문의"
          value={summary.total}
          sub="누적 문의 수"
        />
        <SummaryCard
          title="대기"
          value={summary.waiting}
          sub="즉시 확인 필요"
        />
        <SummaryCard
          title="처리중"
          value={summary.progress}
          sub="담당자 진행 중"
        />
        <SummaryCard
          title="답변완료"
          value={summary.answered}
          sub="회원 확인 대기"
        />
        <SummaryCard title="긴급" value={summary.urgent} sub="우선 대응 대상" />
      </div>

      <div style={filterWrapStyle}>
        <div style={chipWrapStyle}>
          {STATUS_OPTIONS.map((option) => {
            const active = statusFilter === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setStatusFilter(option);
                  setPage(1);
                }}
                style={chipStyle(active)}
              >
                {option}
              </button>
            );
          })}
        </div>
        <div style={filterControlsStyle}>
          <input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            placeholder="문의 내용, 문의 ID, 세션 ID, 담당자 검색"
            style={searchInputStyle}
          />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            style={selectStyle}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? <StateBox text="AI 문의를 불러오는 중입니다..." /> : null}
      {error ? <StateBox text={error} tone="error" /> : null}
      {!loading && !error && filteredItems.length === 0 ? (
        <StateBox text="조건에 맞는 AI 문의가 없습니다." />
      ) : null}

      {!loading && !error && filteredItems.length > 0 ? (
        <>
          <div style={layoutStyle}>
            <section style={panelStyle}>
              <div style={panelHeaderStyle}>
                <strong>문의 목록</strong>
                <span style={mutedStyle}>{filteredItems.length}건</span>
              </div>
              <div style={listBodyStyle}>
                {pagedItems.map((item) => {
                  const active = selectedItem?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      style={listItemStyle(active)}
                    >
                      <div style={listTopStyle}>
                        <span style={statusBadgeStyle(item.status)}>
                          {item.status}
                        </span>
                        <span style={priorityBadgeStyle(item.priority)}>
                          {item.priority}
                        </span>
                      </div>
                      <div style={contentStyle}>{item.content}</div>
                      <div style={metaStyle}>접수 {item.createdAtLabel}</div>
                      <div style={metaRowStyle}>
                        <span>{item.category}</span>
                        <span>{item.assignee || '미배정'}</span>
                        <span>{item.sourceLabel}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section style={panelStyle}>
              {selectedItem ? (
                <>
                  <div style={panelHeaderStyle}>
                    <div>
                      <strong>문의 상세</strong>
                      <div style={detailIdStyle}>문의 ID {selectedItem.id}</div>
                    </div>
                    <div style={headerBadgeRowStyle}>
                      <span style={statusBadgeStyle(selectedItem.status)}>
                        {selectedItem.status}
                      </span>
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        style={dangerBtnStyle(deleting)}
                      >
                        {deleting ? '삭제 중...' : '문의 삭제'}
                      </button>
                    </div>
                  </div>

                  <div style={detailGridStyle}>
                    <DetailField
                      label="접수일시"
                      value={selectedItem.createdAtLabel}
                    />
                    <DetailField
                      label="최종 수정"
                      value={selectedItem.updatedAtLabel}
                    />
                    <DetailField
                      label="답변일시"
                      value={selectedItem.answeredAtLabel}
                    />
                    <DetailField
                      label="세션 ID"
                      value={selectedItem.sessionId}
                    />
                    <DetailField
                      label="접수 채널"
                      value={selectedItem.sourceLabel}
                    />
                    <DetailField
                      label="문의 유형"
                      value={selectedItem.category}
                    />
                  </div>

                  <div style={sectionStyle}>
                    <div style={sectionTitleStyle}>운영 처리 설정</div>
                    <div style={formGridStyle}>
                      <Field label="담당자">
                        <input
                          value={assignee}
                          onChange={(e) => setAssignee(e.target.value)}
                          placeholder="예: 운영자"
                          style={inputStyle}
                        />
                      </Field>
                      <Field label="상태">
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          style={inputStyle}
                        >
                          {STATUS_OPTIONS.filter((v) => v !== '전체').map(
                            (v) => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            )
                          )}
                        </select>
                      </Field>
                      <Field label="유형">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          style={inputStyle}
                        >
                          {CATEGORY_OPTIONS.filter((v) => v !== '전체').map(
                            (v) => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            )
                          )}
                        </select>
                      </Field>
                      <Field label="우선순위">
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          style={inputStyle}
                        >
                          {PRIORITY_OPTIONS.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field label="운영 메모">
                      <textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="상태 변경 사유나 내부 처리 메모를 남기세요."
                        style={memoStyle}
                      />
                    </Field>
                  </div>

                  <div style={sectionStyle}>
                    <div style={sectionTitleStyle}>문의 내용</div>
                    <div style={messageBoxStyle}>{selectedItem.content}</div>
                  </div>

                  <div style={sectionStyle}>
                    <div style={sectionTitleStyle}>관리자 답변</div>
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="회원에게 노출할 답변을 입력하세요."
                      style={textareaStyle}
                    />
                  </div>

                  <div style={sectionStyle}>
                    <div style={sectionTitleStyle}>답변 히스토리</div>
                    {selectedItem.history.length === 0 ? (
                      <div style={emptyHistoryStyle}>이력이 아직 없습니다.</div>
                    ) : (
                      <div style={historyListStyle}>
                        {selectedItem.history.map((row) => (
                          <div
                            key={row.id || `${row.createdAt}-${row.action}`}
                            style={historyItemStyle}
                          >
                            <div style={historyTopStyle}>
                              <strong>{row.action || '변경'}</strong>
                              <span style={mutedStyle}>
                                {formatDateTime(row.createdAt)}
                              </span>
                            </div>
                            <div style={mutedStyle}>
                              {row.actor || '관리자'}
                            </div>
                            {row.changes &&
                            Object.keys(row.changes).length > 0 ? (
                              <div style={historyChangesStyle}>
                                {formatChanges(row.changes)}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
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

function normalizeContact(item, index) {
  const id = String(item?.id ?? item?.ticketId ?? `contact-${index}`);
  const content = String(item?.content ?? item?.message ?? '').trim() || '-';
  const answer = String(item?.answer ?? '').trim();
  const sessionId =
    String(item?.sessionId ?? item?.session_id ?? '').trim() || `auto-${id}`;
  const status = normalizeStatus(item?.status, answer);
  const priority = normalizePriority(item?.priority);
  const category =
    String(
      item?.category ?? (item?.hasAuthorization ? '회원 문의' : '일반')
    ).trim() || '일반';
  const source = String(item?.source ?? 'chatbot').trim() || 'chatbot';
  const history = Array.isArray(item?.history) ? item.history : [];
  const assignee = String(item?.assignee ?? '').trim();
  const createdAt = item?.createdAt ?? item?.created_at ?? '';
  const updatedAt =
    item?.updatedAt ??
    item?.updated_at ??
    item?.answeredAt ??
    item?.answered_at ??
    createdAt;
  const answeredAt = item?.answeredAt ?? item?.answered_at ?? '';
  return {
    ...item,
    id,
    content,
    answer,
    sessionId,
    status,
    priority,
    category,
    assignee,
    source,
    sourceLabel: source === 'chatbot' ? 'AI 챗봇' : source,
    history,
    createdAt,
    updatedAt,
    answeredAt,
    createdAtLabel: formatDateTime(createdAt),
    updatedAtLabel: formatDateTime(updatedAt),
    answeredAtLabel: answeredAt ? formatDateTime(answeredAt) : '-',
  };
}

function normalizeStatus(status, answer) {
  const value = String(status || '').trim();
  if (['대기', '처리중', '답변완료', '종결'].includes(value)) return value;
  if (['RECEIVED', 'WAITING', 'PENDING'].includes(value)) return '대기';
  if (['IN_PROGRESS', 'PROCESSING'].includes(value)) return '처리중';
  if (['ANSWERED', 'DONE'].includes(value)) return '답변완료';
  if (['CLOSED'].includes(value)) return '종결';
  return answer ? '답변완료' : '대기';
}

function normalizePriority(priority) {
  const value = String(priority || '').trim();
  if (['낮음', '보통', '높음', '긴급'].includes(value)) return value;
  return '보통';
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

function formatChanges(changes) {
  return Object.entries(changes)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(' · ');
}

function Field({ label, children }) {
  return (
    <div>
      <div style={fieldLabelStyle}>{label}</div>
      {children}
    </div>
  );
}

function SummaryCard({ title, value, sub }) {
  return (
    <div style={summaryCardStyle}>
      <div style={summaryTitleStyle}>{title}</div>
      <div style={summaryValueStyle}>{value}</div>
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
function StateBox({ text, tone = 'default' }) {
  return <div style={stateBoxStyle(tone)}>{text}</div>;
}

const heroStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
  background: '#FFFBEB',
  border: '1px solid #F5E7A1',
  borderRadius: 24,
  padding: 24,
  marginBottom: 18,
};
const eyebrowStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  background: '#111827',
  color: '#FACC15',
  borderRadius: 999,
  padding: '8px 12px',
  fontSize: 13,
  fontWeight: 800,
  marginBottom: 14,
};
const titleStyle = {
  fontSize: 34,
  fontWeight: 900,
  margin: 0,
  color: '#0F172A',
};
const descStyle = {
  margin: '8px 0 0',
  color: '#6B7280',
  fontSize: 14,
  lineHeight: 1.6,
};
const heroActionsStyle = {
  display: 'flex',
  gap: 10,
  alignItems: 'flex-start',
  flexWrap: 'wrap',
};
const baseBtn = {
  border: '1px solid #CBD5E1',
  borderRadius: 14,
  padding: '12px 16px',
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
  background: '#fff',
  color: '#0F172A',
};
const secondaryBtnStyle = { ...baseBtn };
const primaryBtnStyle = (disabled) => ({
  ...baseBtn,
  background: disabled ? '#E5E7EB' : '#0F172A',
  color: disabled ? '#9CA3AF' : '#FACC15',
  borderColor: disabled ? '#E5E7EB' : '#0F172A',
  cursor: disabled ? 'not-allowed' : 'pointer',
});
const dangerBtnStyle = (disabled) => ({
  ...baseBtn,
  background: disabled ? '#F3F4F6' : '#FEF2F2',
  color: disabled ? '#9CA3AF' : '#B91C1C',
  borderColor: disabled ? '#E5E7EB' : '#FECACA',
  padding: '10px 14px',
});
const summaryGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12,
  marginBottom: 18,
};
const summaryCardStyle = {
  border: '1px solid #E5E7EB',
  background: '#fff',
  borderRadius: 20,
  padding: 18,
};
const summaryTitleStyle = {
  color: '#6B7280',
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 10,
};
const summaryValueStyle = {
  color: '#0F172A',
  fontSize: 30,
  fontWeight: 900,
  marginBottom: 6,
};
const summarySubStyle = { color: '#94A3B8', fontSize: 12 };
const filterWrapStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
  marginBottom: 18,
};
const chipWrapStyle = { display: 'flex', gap: 8, flexWrap: 'wrap' };
const chipStyle = (active) => ({
  border: active ? '1px solid #FACC15' : '1px solid #E5E7EB',
  background: active ? '#FFFBEB' : '#fff',
  borderRadius: 999,
  padding: '9px 14px',
  fontSize: 13,
  fontWeight: 800,
  cursor: 'pointer',
  color: '#0F172A',
});
const filterControlsStyle = {
  display: 'flex',
  gap: 10,
  flex: '1 1 420px',
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
};
const searchInputStyle = {
  minWidth: 280,
  flex: '1 1 320px',
  border: '1px solid #CBD5E1',
  borderRadius: 14,
  padding: '12px 14px',
  fontSize: 14,
  boxSizing: 'border-box',
};
const selectStyle = {
  minWidth: 150,
  border: '1px solid #CBD5E1',
  borderRadius: 14,
  padding: '12px 14px',
  fontSize: 14,
  background: '#fff',
  boxSizing: 'border-box',
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
  gridTemplateColumns: 'minmax(320px, 430px) minmax(0, 1fr)',
  gap: 16,
  alignItems: 'start',
};
const panelStyle = {
  border: '1px solid #E5E7EB',
  background: '#fff',
  borderRadius: 22,
  overflow: 'hidden',
};
const panelHeaderStyle = {
  padding: '18px 18px 14px',
  borderBottom: '1px solid #F3F4F6',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
  flexWrap: 'wrap',
};
const headerBadgeRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  flexWrap: 'nowrap',
  justifyContent: 'flex-end',
  marginLeft: 'auto',
};
const mutedStyle = { color: '#6B7280', fontSize: 13 };
const listBodyStyle = { display: 'grid', gap: 10, padding: 14 };
const listItemStyle = (active) => ({
  border: active ? '1px solid #FACC15' : '1px solid #E5E7EB',
  background: active ? '#FFFBEB' : '#fff',
  borderRadius: 18,
  padding: 14,
  textAlign: 'left',
  cursor: 'pointer',
});
const listTopStyle = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  marginBottom: 10,
  flexWrap: 'wrap',
};
const contentStyle = {
  fontSize: 15,
  lineHeight: 1.6,
  color: '#111827',
  marginBottom: 10,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};
const metaStyle = { fontSize: 12, color: '#94A3B8', marginBottom: 8 };
const metaRowStyle = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  color: '#6B7280',
  fontSize: 12,
};
const statusBadgeStyle = (status) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 74,
  padding: '6px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
  color:
    status === '답변완료'
      ? '#166534'
      : status === '처리중'
        ? '#1D4ED8'
        : status === '종결'
          ? '#374151'
          : '#92400E',
  background:
    status === '답변완료'
      ? '#DCFCE7'
      : status === '처리중'
        ? '#DBEAFE'
        : status === '종결'
          ? '#E5E7EB'
          : '#FEF3C7',
});
const priorityBadgeStyle = (priority) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 56,
  padding: '6px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
  color:
    priority === '긴급'
      ? '#991B1B'
      : priority === '높음'
        ? '#9A3412'
        : '#475569',
  background:
    priority === '긴급'
      ? '#FEE2E2'
      : priority === '높음'
        ? '#FFEDD5'
        : '#F1F5F9',
});
const detailGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 12,
  padding: 18,
  borderBottom: '1px solid #F3F4F6',
};
const detailFieldStyle = {
  border: '1px solid #E5E7EB',
  borderRadius: 16,
  padding: 14,
  background: '#F8FAFC',
};
const detailLabelStyle = {
  color: '#6B7280',
  fontSize: 12,
  marginBottom: 6,
  fontWeight: 800,
};
const detailValueStyle = {
  color: '#0F172A',
  fontSize: 14,
  fontWeight: 700,
  wordBreak: 'break-word',
};
const detailIdStyle = {
  color: '#6B7280',
  fontSize: 13,
  marginTop: 6,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};
const sectionStyle = { padding: 18, borderTop: '1px solid #F3F4F6' };
const sectionTitleStyle = {
  fontSize: 14,
  fontWeight: 900,
  color: '#0F172A',
  marginBottom: 12,
};
const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 12,
  marginBottom: 12,
};
const fieldLabelStyle = {
  fontSize: 12,
  color: '#6B7280',
  fontWeight: 800,
  marginBottom: 6,
};
const inputStyle = {
  width: '100%',
  border: '1px solid #CBD5E1',
  borderRadius: 12,
  padding: '11px 12px',
  fontSize: 14,
  boxSizing: 'border-box',
  background: '#fff',
};
const memoStyle = {
  width: '100%',
  minHeight: 88,
  border: '1px solid #CBD5E1',
  borderRadius: 14,
  padding: 12,
  fontSize: 14,
  resize: 'vertical',
  boxSizing: 'border-box',
};
const messageBoxStyle = {
  border: '1px solid #E5E7EB',
  borderRadius: 16,
  padding: 16,
  background: '#fff',
  whiteSpace: 'pre-wrap',
  lineHeight: 1.7,
  color: '#111827',
};
const textareaStyle = {
  width: '100%',
  minHeight: 140,
  border: '1px solid #CBD5E1',
  borderRadius: 16,
  padding: 14,
  fontSize: 14,
  lineHeight: 1.7,
  resize: 'vertical',
  boxSizing: 'border-box',
};
const emptyHistoryStyle = {
  border: '1px dashed #CBD5E1',
  borderRadius: 14,
  padding: 18,
  color: '#6B7280',
  background: '#F8FAFC',
};
const historyListStyle = { display: 'grid', gap: 10 };
const historyItemStyle = {
  border: '1px solid #E5E7EB',
  borderRadius: 14,
  padding: 14,
  background: '#fff',
};
const historyTopStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'center',
  marginBottom: 6,
  flexWrap: 'wrap',
};
const historyChangesStyle = {
  marginTop: 8,
  color: '#0F172A',
  fontSize: 13,
  lineHeight: 1.6,
};
