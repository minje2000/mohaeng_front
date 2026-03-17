import React, { useEffect, useMemo, useState } from 'react';
import { fetchAdminAiFaqs, saveAdminAiFaqs } from '../api/AdminAiFaqApi';
import Pagination from '../../../../shared/components/common/Pagination';

const PAGE_SIZE = 5;

function normalizeFaq(item, index = 0) {
  return {
    id: item?.id ?? `new-${Date.now()}-${index}`,
    title: item?.title || '',
    question: item?.question || '',
    answer: item?.answer || '',
    keywords: Array.isArray(item?.keywords)
      ? item.keywords.join(', ')
      : item?.keywords || '',
    enabled: item?.enabled !== false,
    sortOrder: Number(item?.sortOrder ?? index),
    isNew: typeof item?.id !== 'number',
  };
}

function createEmptyFaq(index = 0) {
  return normalizeFaq(
    {
      title: '',
      question: '',
      answer: '',
      keywords: '',
      enabled: true,
      sortOrder: index,
    },
    index
  );
}

function parseKeywords(value) {
  return String(value || '')
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function badgeStyle(type) {
  if (type === 'enabled') {
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      borderRadius: 999,
      padding: '6px 10px',
      fontSize: 12,
      fontWeight: 700,
      background: '#ECFDF5',
      color: '#047857',
      border: '1px solid #A7F3D0',
    };
  }

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    padding: '6px 10px',
    fontSize: 12,
    fontWeight: 700,
    background: '#F3F4F6',
    color: '#6B7280',
    border: '1px solid #E5E7EB',
  };
}

function StatCard({ title, value, description }) {
  return (
    <div style={statCardStyle}>
      <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 700 }}>
        {title}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 900,
          color: '#111827',
          marginTop: 8,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>
        {description}
      </div>
    </div>
  );
}

export default function AdminAiFaqPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const data = await fetchAdminAiFaqs();
        if (!mounted) return;
        const normalized = (Array.isArray(data) ? data : []).map(
          (item, index) => normalizeFaq(item, index)
        );
        setItems(normalized);
        setSelectedId(normalized[0]?.id ?? null);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || 'AI FAQ를 불러오지 못했습니다.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const enabledCount = items.filter((item) => item.enabled).length;
    const disabledCount = Math.max(0, items.length - enabledCount);
    const keywordCount = items.reduce(
      (acc, item) => acc + parseKeywords(item.keywords).length,
      0
    );

    return {
      total: items.length,
      enabled: enabledCount,
      disabled: disabledCount,
      keywords: keywordCount,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter === 'enabled' && !item.enabled) return false;
      if (statusFilter === 'disabled' && item.enabled) return false;
      if (!keyword) return true;

      const haystack = [item.title, item.question, item.answer, item.keywords]
        .join(' ')
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [items, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const pageStartIndex = (page - 1) * PAGE_SIZE;
  const visibleItems = useMemo(
    () => filteredItems.slice(pageStartIndex, pageStartIndex + PAGE_SIZE),
    [filteredItems, pageStartIndex]
  );

  const selectedItem = useMemo(() => {
    if (selectedId == null) return visibleItems[0] || filteredItems[0] || null;
    return (
      items.find((item) => item.id === selectedId) ||
      visibleItems[0] ||
      filteredItems[0] ||
      null
    );
  }, [items, selectedId, visibleItems, filteredItems]);

  useEffect(() => {
    if (selectedItem && selectedId !== selectedItem.id) {
      setSelectedId(selectedItem.id);
    }
    if (!selectedItem && items.length === 0) {
      setSelectedId(null);
    }
  }, [selectedItem, selectedId, items.length]);

  const updateItem = (id, patch) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const addItem = () => {
    const newItem = createEmptyFaq(items.length);
    setItems((prev) => [...prev, newItem]);
    setSelectedId(newItem.id);
    setStatusFilter('all');
    setSearch('');
    setPage(Math.max(1, Math.ceil((items.length + 1) / PAGE_SIZE)));
    setNotice('');
  };

  const duplicateSelected = () => {
    if (!selectedItem) return;
    const duplicated = normalizeFaq(
      {
        ...selectedItem,
        id: null,
        title: `${selectedItem.title || '새 FAQ'} 복사본`,
      },
      items.length
    );
    duplicated.id = `new-${Date.now()}-copy`;
    duplicated.isNew = true;
    setItems((prev) => [...prev, duplicated]);
    setSelectedId(duplicated.id);
    setStatusFilter('all');
    setSearch('');
  };

  const removeSelected = () => {
    if (!selectedItem) return;
    const next = items.filter((item) => item.id !== selectedItem.id);
    setItems(next);
    setSelectedId(next[0]?.id ?? null);
    setNotice('');
  };

  const onSave = async () => {
    try {
      setSaving(true);
      setError('');
      setNotice('');

      const payload = items.map((item, index) => ({
        id: typeof item.id === 'number' ? item.id : null,
        title: String(item.title || '').trim(),
        question: String(item.question || '').trim(),
        answer: String(item.answer || '').trim(),
        keywords: parseKeywords(item.keywords),
        enabled: item.enabled !== false,
        sortOrder: index,
      }));

      const saved = await saveAdminAiFaqs(payload);
      const normalized = (Array.isArray(saved) ? saved : []).map(
        (item, index) => normalizeFaq(item, index)
      );
      setItems(normalized);
      setSelectedId(normalized[0]?.id ?? null);
      setNotice(
        'AI FAQ를 저장했습니다. 챗봇 답변 기준 문서가 즉시 갱신됩니다.'
      );
    } catch (e) {
      setError(
        e?.response?.data?.message || 'AI FAQ 저장 중 문제가 생겼습니다.'
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedKeywords = selectedItem
    ? parseKeywords(selectedItem.keywords)
    : [];

  return (
    <div style={{ padding: 24, background: '#F9FAFB' }}>
      <div style={heroStyle}>
        <div>
          <div style={heroBadge}>AI 운영센터</div>
          <h2
            style={{
              margin: '10px 0 8px',
              fontSize: 30,
              fontWeight: 900,
              color: '#111827',
            }}
          >
            AI FAQ 관리
          </h2>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          <button type="button" onClick={addItem} style={ghostBtn}>
            FAQ 추가
          </button>
          <button
            type="button"
            onClick={duplicateSelected}
            disabled={!selectedItem}
            style={ghostBtn}
          >
            선택 복제
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || loading}
            style={primaryBtn(saving || loading)}
          >
            {saving ? '저장 중...' : '전체 저장'}
          </button>
        </div>
      </div>

      <div style={statsGridStyle}>
        <StatCard
          title="전체 FAQ"
          value={summary.total}
          description="챗봇 지식 베이스 전체 항목 수"
        />
        <StatCard
          title="사용 중"
          value={summary.enabled}
          description="실제 답변에 반영 가능한 활성 FAQ"
        />
        <StatCard
          title="비활성"
          value={summary.disabled}
          description="검수 중이거나 임시 중단된 항목"
        />
        <StatCard
          title="등록 키워드"
          value={summary.keywords}
          description="질문 매칭에 사용되는 전체 키워드 수"
        />
      </div>

      {error ? <div style={errorBox}>{error}</div> : null}
      {notice ? <div style={noticeBox}>{notice}</div> : null}

      {loading ? (
        <div style={panelStyle}>불러오는 중...</div>
      ) : (
        <div style={mainGridStyle}>
          <div style={panelStyle}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}
                >
                  FAQ 목록
                </div>
              </div>
              <button
                type="button"
                onClick={removeSelected}
                disabled={!selectedItem}
                style={dangerBtn(Boolean(!selectedItem))}
              >
                선택 삭제
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) minmax(132px, 148px)',
                gap: 10,
                marginBottom: 14,
                alignItems: 'stretch',
              }}
            >
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="제목, 질문, 답변, 키워드 검색"
                style={inputStyle}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={inputStyle}
              >
                <option value="all">전체 상태</option>
                <option value="enabled">사용 중</option>
                <option value="disabled">비활성</option>
              </select>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              {visibleItems.length === 0 ? (
                <div style={emptyBoxStyle}>조건에 맞는 FAQ가 없습니다.</div>
              ) : (
                visibleItems.map((item, index) => {
                  const keywords = parseKeywords(item.keywords);
                  const active = selectedItem?.id === item.id;
                  return (
                    <button
                      key={item.id || index}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      style={listItemStyle(active)}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 10,
                          alignItems: 'flex-start',
                        }}
                      >
                        <div style={{ textAlign: 'left', minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: 800,
                              color: '#111827',
                              marginBottom: 6,
                            }}
                          >
                            {item.title || item.question || '제목 없는 FAQ'}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: '#4B5563',
                              lineHeight: 1.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {item.question || '질문을 입력해 주세요.'}
                          </div>
                        </div>
                        <span
                          style={badgeStyle(
                            item.enabled ? 'enabled' : 'disabled'
                          )}
                        >
                          {item.enabled ? '사용 중' : '비활성'}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: 6,
                          flexWrap: 'wrap',
                          marginTop: 10,
                        }}
                      >
                        {keywords.length ? (
                          keywords.slice(0, 4).map((keyword) => (
                            <span key={keyword} style={keywordChipStyle}>
                              #{keyword}
                            </span>
                          ))
                        ) : (
                          <span style={mutedTextStyle}>키워드 없음</span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div style={{ marginTop: 14 }}>
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
              />
            </div>
          </div>

          <div style={panelStyle}>
            {!selectedItem ? (
              <div style={emptyBoxStyle}>편집할 FAQ를 선택해 주세요.</div>
            ) : (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'flex-start',
                    marginBottom: 18,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: '#111827',
                      }}
                    >
                      FAQ 상세 편집
                    </div>
                  </div>
                  <span
                    style={badgeStyle(
                      selectedItem.enabled ? 'enabled' : 'disabled'
                    )}
                  >
                    {selectedItem.enabled ? '실사용 반영 중' : '비활성 상태'}
                  </span>
                </div>

                <div style={editorGridStyle}>
                  <label style={fieldStyle}>
                    <span>FAQ 제목</span>
                    <input
                      value={selectedItem.title}
                      onChange={(e) =>
                        updateItem(selectedItem.id, { title: e.target.value })
                      }
                      placeholder="예: 환불 규정 안내"
                      style={inputStyle}
                    />
                  </label>
                  <label style={fieldStyle}>
                    <span>노출 상태</span>
                    <select
                      value={selectedItem.enabled ? 'enabled' : 'disabled'}
                      onChange={(e) =>
                        updateItem(selectedItem.id, {
                          enabled: e.target.value === 'enabled',
                        })
                      }
                      style={inputStyle}
                    >
                      <option value="enabled">사용 중</option>
                      <option value="disabled">비활성</option>
                    </select>
                  </label>
                </div>

                <label style={fieldStyle}>
                  <span>질문</span>
                  <input
                    value={selectedItem.question}
                    onChange={(e) =>
                      updateItem(selectedItem.id, { question: e.target.value })
                    }
                    placeholder="사용자가 실제로 입력하는 질문 문장을 넣어 주세요."
                    style={inputStyle}
                  />
                </label>

                <label style={fieldStyle}>
                  <span>키워드</span>
                  <input
                    value={selectedItem.keywords}
                    onChange={(e) =>
                      updateItem(selectedItem.id, { keywords: e.target.value })
                    }
                    placeholder="환불, 취소, 결제, 마이페이지"
                    style={inputStyle}
                  />
                </label>

                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                    flexWrap: 'wrap',
                    marginTop: -2,
                    marginBottom: 14,
                  }}
                >
                  {selectedKeywords.length ? (
                    selectedKeywords.map((keyword) => (
                      <span key={keyword} style={keywordChipStyle}>
                        #{keyword}
                      </span>
                    ))
                  ) : (
                    <span style={mutedTextStyle}>
                      쉼표로 구분해서 입력하면 키워드 칩으로 반영됩니다.
                    </span>
                  )}
                </div>

                <label style={fieldStyle}>
                  <span>답변</span>
                  <textarea
                    value={selectedItem.answer}
                    onChange={(e) =>
                      updateItem(selectedItem.id, { answer: e.target.value })
                    }
                    rows={10}
                    placeholder="챗봇이 그대로 참고할 수 있도록 정책/절차 중심으로 작성해 주세요."
                    style={textareaStyle}
                  />
                </label>

                <div style={previewCardStyle}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: '#111827',
                      marginBottom: 8,
                    }}
                  >
                    챗봇 응답 미리보기
                  </div>
                  <div
                    style={{ fontSize: 13, color: '#6B7280', marginBottom: 10 }}
                  >
                    실제 챗봇은 질문 유사도와 키워드 매칭을 함께 사용합니다.
                  </div>
                  <div
                    style={{
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: 14,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#374151',
                        marginBottom: 8,
                      }}
                    >
                      Q.{' '}
                      {selectedItem.question ||
                        '질문을 입력하면 여기서 미리볼 수 있습니다.'}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: '#111827',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {selectedItem.answer ||
                        '답변을 입력하면 챗봇 응답 미리보기가 표시됩니다.'}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const heroStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8DB 100%)',
  border: '1px solid #F3E7A4',
  borderRadius: 24,
  padding: 24,
  boxShadow: '0 16px 40px rgba(17, 24, 39, 0.06)',
  marginBottom: 18,
};

const heroBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  background: '#111827',
  color: '#FFD84D',
  padding: '7px 12px',
  fontSize: 12,
  fontWeight: 800,
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 12,
  marginBottom: 18,
};

const statCardStyle = {
  background: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: 20,
  padding: 18,
  boxShadow: '0 10px 24px rgba(17, 24, 39, 0.05)',
};

const mainGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(360px, 0.95fr) minmax(480px, 1.25fr)',
  gap: 16,
  alignItems: 'start',
};

const panelStyle = {
  background: '#fff',
  border: '1px solid #E5E7EB',
  borderRadius: 22,
  padding: 20,
  boxShadow: '0 12px 28px rgba(17, 24, 39, 0.05)',
};

const editorGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1.3fr 0.7fr',
  gap: 12,
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  color: '#374151',
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 14,
};

const inputStyle = {
  border: '1px solid #D1D5DB',
  borderRadius: 14,
  padding: '12px 14px',
  fontSize: 14,
  outline: 'none',
  background: '#FFFFFF',
  width: '100%',
  boxSizing: 'border-box',
};

const textareaStyle = {
  ...inputStyle,
  minHeight: 220,
  resize: 'vertical',
  lineHeight: 1.6,
};

const listItemStyle = (active) => ({
  width: '100%',
  border: active ? '1px solid #F2C94C' : '1px solid #E5E7EB',
  background: active ? '#FFFBEB' : '#FFFFFF',
  borderRadius: 18,
  padding: 16,
  cursor: 'pointer',
  boxShadow: active ? '0 10px 22px rgba(242, 201, 76, 0.18)' : 'none',
});

const previewCardStyle = {
  marginTop: 4,
  background: '#FFFDF5',
  border: '1px solid #F3E7A4',
  borderRadius: 18,
  padding: 16,
};

const keywordChipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  padding: '6px 10px',
  background: '#FEF3C7',
  color: '#92400E',
  fontSize: 12,
  fontWeight: 700,
};

const mutedTextStyle = {
  fontSize: 12,
  color: '#9CA3AF',
};

const emptyBoxStyle = {
  border: '1px dashed #D1D5DB',
  borderRadius: 16,
  padding: 20,
  textAlign: 'center',
  color: '#6B7280',
  background: '#F9FAFB',
};

const ghostBtn = {
  border: '1px solid #D1D5DB',
  background: '#fff',
  color: '#111827',
  borderRadius: 12,
  padding: '11px 16px',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};

const dangerBtn = (disabled) => ({
  border: 'none',
  background: disabled ? '#F3F4F6' : '#FEE2E2',
  color: disabled ? '#9CA3AF' : '#991B1B',
  borderRadius: 12,
  padding: '11px 16px',
  fontSize: 14,
  fontWeight: 800,
  cursor: disabled ? 'not-allowed' : 'pointer',
});

const primaryBtn = (disabled) => ({
  border: 'none',
  background: disabled ? '#E5E7EB' : '#111827',
  color: disabled ? '#9CA3AF' : '#FFD84D',
  borderRadius: 12,
  padding: '11px 16px',
  fontSize: 14,
  fontWeight: 800,
  cursor: disabled ? 'not-allowed' : 'pointer',
});

const errorBox = {
  marginBottom: 14,
  background: '#FEF2F2',
  color: '#B91C1C',
  border: '1px solid #FECACA',
  padding: '12px 14px',
  borderRadius: 12,
};

const noticeBox = {
  marginBottom: 14,
  background: '#ECFDF5',
  color: '#047857',
  border: '1px solid #A7F3D0',
  padding: '12px 14px',
  borderRadius: 12,
};
