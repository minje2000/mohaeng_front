import React, { useEffect, useMemo, useState } from 'react';
import { fetchAdminAiLogs } from '../../../../shared/api/adminAiApi';
import Pagination from '../../../../shared/components/common/Pagination';

const PAGE_SIZE = 5;

export default function AdminAiLogPage() {
  const [summary, setSummary] = useState({});
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
        const payload = await fetchAdminAiLogs(150);
        if (!mounted) return;
        setSummary(payload.summary || {});
        setItems(Array.isArray(payload.items) ? payload.items : []);
      } catch (e) {
        if (mounted)
          setError(
            e?.response?.data?.message || 'AI 로그를 불러오지 못했어요.'
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
        AI 로그 분석
      </h2>

      {!loading && !error ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <SummaryCard
            title="전체 로그"
            value={summary.total ?? items.length}
          />
          <SummaryCard title="오류" value={summary.errors ?? 0} />
          <SummaryCard
            title="주요 인텐트"
            value={summary.topIntents?.[0]?.intent || '-'}
          />
        </div>
      ) : null}

      {loading ? <div>불러오는 중...</div> : null}
      {error ? <div style={{ color: '#B91C1C' }}>{error}</div> : null}
      {!loading && !error && items.length === 0 ? (
        <div>저장된 AI 로그가 없습니다.</div>
      ) : null}
      <div style={{ display: 'grid', gap: 12 }}>
        {pagedItems.map((item) => (
          <div
            key={item.id}
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
              <strong>{item.intent || 'chat'}</strong>
              <span style={{ color: '#6B7280', fontSize: 13 }}>
                {item.createdAt || item.created_at || ''}
              </span>
            </div>
            <div style={{ marginBottom: 8, whiteSpace: 'pre-wrap' }}>
              <b>질문</b> {item.question || item.message || ''}
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
              <b>답변</b> {item.answer || item.answer_preview || ''}
            </div>
          </div>
        ))}
      </div>
      {!loading && !error ? (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      ) : null}
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: 16,
        padding: 16,
        background: '#fff',
      }}
    >
      <div style={{ color: '#6B7280', fontSize: 13, marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800 }}>
        {String(value ?? '-')}
      </div>
    </div>
  );
}
