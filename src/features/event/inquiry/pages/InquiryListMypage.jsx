import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import UseMyInquiryList from '../hooks/UseMyInquiryList';
import styles from './InquiryListMypage.module.css';

const TABS = [
  { key: 'ALL', label: '전체' },
  { key: 'WRITTEN', label: '작성 문의' },
  { key: 'RECEIVED', label: '받은 문의' },
];

function formatKDateTime(dt) {
  if (!dt) return '-';
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return '-';
  // 2026.02.25 11:23
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
}

export default function InquiryListMypage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('ALL');
  const [page, setPage] = useState(1);
  const size = 5;

  const { items, totalPages, loading } = UseMyInquiryList(tab, page, size);

  const pageButtons = useMemo(() => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages || 1, start + 4);
    for (let p = start; p <= end; p += 1) pages.push(p);
    return pages;
  }, [page, totalPages]);

  const onClickRow = (eventId) => {
    if (!eventId) return;
    // 행사 상세페이지의 문의 섹션으로 이동
    navigate(`/events/${eventId}?tab=inquiry`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageTitle}>문의 내역</div>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`${styles.tabBtn} ${tab === t.key ? styles.tabActive : ''}`}
            onClick={() => {
              setTab(t.key);
              setPage(1);
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colEvent}>행사</th>
              <th className={styles.colTitle}>문의 내용</th>
              <th className={styles.colStatus}>상태</th>
              <th className={styles.colDate}>작성일</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className={styles.empty}>로딩중...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.empty}>문의 내역이 없습니다.</td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.inqId}>
                  <td>
                    <div className={styles.eventCell}>
                      <img
                        className={styles.eventCellThumb}
                        src={row.eventThumbnail ? `/images/${row.eventThumbnail}` : '/images/moheng.png'}
                        alt="event"
                        onError={(e) => {
                          // fallback
                          e.currentTarget.src = '/images/moheng.png';
                        }}
                      />
                      <div className={styles.eventCellTitle} title={row.eventTitle || ''}>
                        {row.eventTitle || `행사 #${row.eventId}`}
                      </div>
                    </div>
                  </td>

                  <td className={styles.titleCell}>
                    <button
                      type="button"
                      className={styles.linkTitle}
                      onClick={() => onClickRow(row.eventId)}
                      title="행사 상세(문의)로 이동"
                    >
                      {row.content}
                    </button>
                    {row.replyContent ? (
                      <div className={styles.replyPreview}>답변: {row.replyContent}</div>
                    ) : null}
                  </td>

                  <td>
                    <span
                      className={`${styles.badge} ${row.status === '완료' ? styles.badgeDone : styles.badgeWait}`}
                    >
                      {row.status}
                    </span>
                  </td>

                  <td>{formatKDateTime(row.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            ‹
          </button>

          {pageButtons.map((p) => (
            <button
              key={p}
              type="button"
              className={`${styles.pageBtn} ${p === page ? styles.pageActive : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            ›
          </button>
        </div>
      ) : null}
    </div>
  );
}
