import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiJson } from '../../../../app/http/request';
import styles from './ParticipationMypage.module.css';
import RefundPolicy from '../../../payment/pages/RefundPolicy';

const THUMBNAIL_BASE = 'http://localhost:8080/upload_files/event/';
const PAGE_SIZE = 5;

const fmtDate = (d) => (d ? String(d).slice(0, 10).replaceAll('-', '.') : '-');
const fmt = (n) => (n == null ? '-' : Number(n).toLocaleString());

function isPast(pctDate) {
  if (!pctDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(pctDate);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

const STATUS_STYLE = {
  참여예정: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', color: '#065f46' },
  참여완료: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)', color: '#1e40af' },
};

function StatusBadge({ label }) {
  const s = STATUS_STYLE[label] || { bg: '#f3f4f6', border: '#e5e7eb', color: '#374151' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 30,
        padding: '0 12px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 900,
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

function getPageNumbers(page, totalPages) {
  const safeTotal = Math.max(1, totalPages || 1);
  const start = Math.max(1, Math.min(page - 2, safeTotal - 4));
  const end = Math.min(safeTotal, start + 4);
  return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
}

function Pagination({ page, totalPages, onChange }) {
  if ((totalPages || 1) <= 1) return null;
  const pages = getPageNumbers(page, totalPages);

  return (
    <div className={styles.pagination}>
      <button className={styles.pageTextBtn} onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}>이전</button>
      {pages.map((p) => (
        <button key={p} className={`${styles.pageBtn} ${page === p ? styles.pageActive : ''}`} onClick={() => onChange(p)}>{p}</button>
      ))}
      <button className={styles.pageTextBtn} onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}>다음</button>
    </div>
  );
}

export default function ParticipationMypage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [page, setPage] = useState(1);
  const [refundModal, setRefundModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiJson().get('/api/mypage/events/participations');
      setParticipations(res.data || []);
    } catch (e) {
      console.error('참여 내역 로딩 실패', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [filter]);

  const filtered = useMemo(() => participations.filter((pct) => {
    if (pct.pctStatus === '취소' || pct.pctStatus === '참여삭제') return false;
    if (filter === 'all') return true;
    if (filter === 'upcoming') return !isPast(pct.pctDate);
    if (filter === 'done') return isPast(pct.pctDate);
    return true;
  }), [participations, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = useMemo(() => ({
    all: participations.filter((pct) => pct.pctStatus !== '취소' && pct.pctStatus !== '참여삭제').length,
    upcoming: participations.filter((pct) => pct.pctStatus !== '취소' && pct.pctStatus !== '참여삭제' && !isPast(pct.pctDate)).length,
    done: participations.filter((pct) => pct.pctStatus !== '취소' && pct.pctStatus !== '참여삭제' && isPast(pct.pctDate)).length,
  }), [participations]);

  const handleEventClick = (pct) => {
    if (!pct.eventId) return;
    const status = (pct.eventStatus ?? '').toString();
    if (status === 'REPORTDELETED') {
      alert('이 행사에 대한 신고가 접수되어 삭제 처리 되었습니다.');
      return;
    }
    if (status === 'DELETED') {
      alert('주최자에 의하여 행사가 삭제되었습니다.');
      return;
    }
    navigate(`/events/${pct.eventId}`);
  };

  const handleCancelClick = (pct) => {
    setRefundModal({ pct });
  };

  const handleCancelConfirm = async () => {
    const { pct } = refundModal;
    setRefundModal(null);
    setProcessingId(pct.pctId);
    try {
      await apiJson().delete(`/api/eventParticipation/cancelParticipation?pctId=${pct.pctId}`);
      alert('취소가 완료되었습니다.');
      load();
    } catch (e) {
      alert(e?.response?.data?.message || '취소 중 오류가 발생했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (pct) => {
    if (!window.confirm('참여 내역을 삭제하시겠습니까?\n마이페이지에서만 삭제되며 복구할 수 없습니다.')) return;
    setProcessingId(pct.pctId);
    try {
      await apiJson().put(`/api/eventParticipation/deleteParticipation?pctId=${pct.pctId}`);
      load();
    } catch (e) {
      alert(e?.response?.data?.message || '삭제 중 오류가 발생했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const EMPTY_MSG = {
    all: '참여한 행사가 없습니다.',
    upcoming: '참여 예정인 행사가 없습니다.',
    done: '참여 완료된 행사가 없습니다.',
  };

  const tabs = [
    { key: 'all', label: '전체' },
    { key: 'upcoming', label: '참여 예정' },
    { key: 'done', label: '참여 완료' },
  ];

  return (
    <div className={styles.pageShell}>
      <div className={styles.container}>
        <h2 className={styles.pageTitle}>행사 참여 내역</h2>

        <div className={styles.filterTabs}>
          {tabs.map((f) => {
            const active = filter === f.key;
            return (
              <button key={f.key} onClick={() => setFilter(f.key)} className={`${styles.filterBtn} ${active ? styles.filterBtnActive : ''}`}>
                <span>{f.label}</span>
                <span className={`${styles.filterCount} ${active ? styles.filterCountActive : ''}`}>{counts[f.key]}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.headerBar}>
          <div className={styles.colEvent}>행사</div>
          <div className={styles.colPeriod}>행사 기간</div>
          <div className={styles.colJoin}>참여일</div>
          <div className={styles.colStatus}>상태</div>
          <div className={styles.colPrice}>결제 금액</div>
          <div className={styles.colManage}>관리</div>
        </div>

        <div className={styles.listWrap}>
          {loading ? (
            <div className={styles.stateCard}>불러오는 중...</div>
          ) : paged.length === 0 ? (
            <div className={styles.emptyCard}>{EMPTY_MSG[filter]}</div>
          ) : paged.map((pct) => {
            const displayStatus = isPast(pct.pctDate) ? '참여완료' : '참여예정';
            const isProcessing = processingId === pct.pctId;
            const eventStatus = (pct.eventStatus ?? '').toString().toUpperCase();
            const isDeleted = eventStatus === 'DELETED' || eventStatus === 'REPORTDELETED';

            return (
              <div key={pct.pctId} className={styles.rowCard}>
                <div className={styles.colEvent}>
                  <div className={styles.eventCell}>
                    <img
                      src={pct.thumbnail ? `${THUMBNAIL_BASE}${pct.thumbnail}` : '/images/moheng.png'}
                      alt=""
                      className={styles.eventCellThumb}
                      onClick={() => handleEventClick(pct)}
                      style={{ cursor: 'pointer' }}
                      onError={(e) => { e.currentTarget.src = '/images/moheng.png'; }}
                    />
                    <div className={styles.eventTextWrap}>
                      <button className={styles.linkTitle} onClick={() => handleEventClick(pct)} style={{ color: isDeleted ? '#9ca3af' : undefined }}>
                        {pct.eventTitle || `행사 #${pct.eventId}`}
                      </button>
                      {pct.simpleExplain ? <span className={styles.eventSummary}>{pct.simpleExplain}</span> : null}
                    </div>
                  </div>
                </div>

                <div className={styles.colPeriod}>{fmtDate(pct.eventStartDate)} ~ {fmtDate(pct.eventEndDate)}</div>
                <div className={styles.colJoin}>{fmtDate(pct.pctDate)}</div>
                <div className={styles.colStatus}><StatusBadge label={displayStatus} /></div>
                <div className={styles.colPrice}>{pct.payAmount > 0 ? `${fmt(pct.payAmount)}원` : '무료'}</div>
                <div className={styles.colManage}>
                  {displayStatus === '참여예정' ? (
                    <button onClick={() => handleCancelClick(pct)} disabled={isProcessing} className={styles.cancelBtn}>
                      {isProcessing ? '처리중...' : '취소'}
                    </button>
                  ) : (
                    <button onClick={() => handleDelete(pct)} disabled={isProcessing} className={styles.deleteBtn}>
                      {isProcessing ? '처리중...' : '삭제'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />

        {refundModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: 480 }}>
              <RefundPolicy onClose={() => setRefundModal(null)} onConfirm={handleCancelConfirm} eventStartDate={refundModal.pct.eventStartDate} paidAmount={refundModal.pct.payAmount || 0} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
