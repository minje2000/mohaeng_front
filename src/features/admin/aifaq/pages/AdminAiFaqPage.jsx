import React, { useEffect, useMemo, useState } from 'react';
import { fetchAdminAiFaqs, saveAdminAiFaqs } from '../api/AdminAiFaqApi';
import Pagination from '../../../../shared/components/common/Pagination';

const PAGE_SIZE = 5;

function createEmptyItem(index = 0) {
  return {
    id: `new-${Date.now()}-${index}`,
    title: '',
    question: '',
    answer: '',
    keywords: [],
    enabled: true,
    sortOrder: index,
  };
}

export default function AdminAiFaqPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchAdminAiFaqs();
        if (!mounted) return;
        setItems(data);
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

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const pageStartIndex = (page - 1) * PAGE_SIZE;
  const visibleItems = useMemo(
    () => items.slice(pageStartIndex, pageStartIndex + PAGE_SIZE),
    [items, pageStartIndex]
  );

  const updateItem = (index, patch) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => {
      const next = [...prev, createEmptyItem(prev.length)];
      const nextTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
      setPage(nextTotalPages);
      return next;
    });
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const onSave = async () => {
    try {
      setSaving(true);
      setError('');
      setNotice('');
      const payload = items.map((item, index) => ({
        ...item,
        id: typeof item.id === 'number' ? item.id : null,
        keywords: String(item.keywords || '')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        sortOrder: index,
      }));
      const saved = await saveAdminAiFaqs(payload);
      setItems(
        saved.map((item) => ({
          ...item,
          keywords: (item.keywords || []).join(', '),
        }))
      );
      setNotice('AI FAQ를 저장했습니다. 챗봇 답변에 바로 반영됩니다.');
    } catch (e) {
      setError(
        e?.response?.data?.message || 'AI FAQ 저장 중 문제가 생겼습니다.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 800,
              color: '#111827',
            }}
          >
            AI FAQ 관리
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={addItem} style={ghostBtn}>
            항목 추가
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || loading}
            style={primaryBtn(saving || loading)}
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>

      {error ? <div style={errorBox}>{error}</div> : null}
      {notice ? <div style={noticeBox}>{notice}</div> : null}

      {loading ? (
        <div style={panelStyle}>불러오는 중...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: 14 }}>
            {visibleItems.map((item, localIndex) => {
              const actualIndex = pageStartIndex + localIndex;
              return (
                <div key={item.id || actualIndex} style={panelStyle}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 14,
                    }}
                  >
                    <strong style={{ fontSize: 16, color: '#111827' }}>
                      FAQ #{actualIndex + 1}
                    </strong>
                    <div
                      style={{ display: 'flex', gap: 12, alignItems: 'center' }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          color: '#374151',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(item.enabled)}
                          onChange={(e) =>
                            updateItem(actualIndex, {
                              enabled: e.target.checked,
                            })
                          }
                        />
                        사용
                      </label>
                      <button
                        type="button"
                        onClick={() => removeItem(actualIndex)}
                        style={dangerBtn}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  <div style={gridStyle}>
                    <label style={fieldStyle}>
                      <span>제목</span>
                      <input
                        value={item.title || ''}
                        onChange={(e) =>
                          updateItem(actualIndex, { title: e.target.value })
                        }
                        style={inputStyle}
                      />
                    </label>
                    <label style={fieldStyle}>
                      <span>키워드</span>
                      <input
                        value={
                          Array.isArray(item.keywords)
                            ? item.keywords.join(', ')
                            : item.keywords || ''
                        }
                        onChange={(e) =>
                          updateItem(actualIndex, { keywords: e.target.value })
                        }
                        placeholder="문의, 환불, 마이페이지"
                        style={inputStyle}
                      />
                    </label>
                  </div>
                  <label style={fieldStyle}>
                    <span>질문</span>
                    <input
                      value={item.question || ''}
                      onChange={(e) =>
                        updateItem(actualIndex, { question: e.target.value })
                      }
                      style={inputStyle}
                    />
                  </label>
                  <label style={fieldStyle}>
                    <span>답변</span>
                    <textarea
                      value={item.answer || ''}
                      onChange={(e) =>
                        updateItem(actualIndex, { answer: e.target.value })
                      }
                      rows={4}
                      style={textareaStyle}
                    />
                  </label>
                </div>
              );
            })}
            {items.length === 0 ? (
              <div style={panelStyle}>등록된 AI FAQ가 없습니다.</div>
            ) : null}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

const panelStyle = {
  background: '#fff',
  border: '1px solid #E5E7EB',
  borderRadius: 18,
  padding: 18,
  boxShadow: '0 10px 24px rgba(17, 24, 39, 0.05)',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  color: '#374151',
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 12,
};

const inputStyle = {
  border: '1px solid #D1D5DB',
  borderRadius: 12,
  padding: '12px 14px',
  fontSize: 14,
  outline: 'none',
};

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical',
  minHeight: 120,
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

const dangerBtn = {
  border: 'none',
  background: '#FEE2E2',
  color: '#991B1B',
  borderRadius: 10,
  padding: '8px 12px',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};

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
