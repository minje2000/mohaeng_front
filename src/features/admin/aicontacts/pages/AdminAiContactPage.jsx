import React, { useEffect, useMemo, useState } from 'react';
import { fetchAdminAiContacts } from '../../../../shared/api/adminAiApi';
import Pagination from '../../../../shared/components/common/Pagination';

const PAGE_SIZE = 5;

export default function AdminAiContactPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const rows = await fetchAdminAiContacts(100);
        if (mounted) setItems(rows);
      } catch (e) {
        if (mounted)
          setError(
            e?.response?.data?.message || 'AI 문의를 불러오지 못했어요.'
          );
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 20 }}>
        AI 문의 관리
      </h2>
      {loading ? <div>불러오는 중...</div> : null}
      {error ? <div style={{ color: '#B91C1C' }}>{error}</div> : null}
      {!loading && !error && items.length === 0 ? (
        <div>접수된 AI 문의가 없습니다.</div>
      ) : null}
      <div style={{ display: 'grid', gap: 12 }}>
        {pagedItems.map((item) => (
          <div
            key={item.id || item.ticketId}
            style={{
              border: '1px solid #E5E7EB',
              borderRadius: 16,
              padding: 16,
              background: '#fff',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 8,
              }}
            >
              <strong>{item.status || '대기'}</strong>
              <span style={{ color: '#6B7280', fontSize: 13 }}>
                {item.createdAt || ''}
              </span>
            </div>
            <div
              style={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
                marginBottom: item.answer ? 10 : 0,
              }}
            >
              {item.content || item.message || ''}
            </div>
            {item.answer ? (
              <div
                style={{
                  borderTop: '1px solid #F3F4F6',
                  paddingTop: 10,
                  color: '#374151',
                  whiteSpace: 'pre-wrap',
                }}
              >
                <b>답변</b> {item.answer}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {!loading && !error ? (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      ) : null}
    </div>
  );
}
