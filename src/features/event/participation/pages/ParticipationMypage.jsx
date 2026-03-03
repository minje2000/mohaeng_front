// src/features/event/participation/pages/ParticipationMypage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiJson } from '../../../../app/http/request';
import styles from './ParticipationMypage.module.css';
import RefundPolicy from '../../../payment/pages/RefundPolicy';


const THUMBNAIL_BASE = 'http://localhost:8080/upload_files/event/';
const PAGE_SIZE = 10;

const fmtDate = (d) => (d ? String(d).slice(0, 10).replaceAll('-', '.') : '-');
const fmt     = (n) => (n == null ? '-' : Number(n).toLocaleString());

function isEnded(eventEndDate) {
  if (!eventEndDate) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const end   = new Date(eventEndDate); end.setHours(0, 0, 0, 0);
  return end < today;
}

const STATUS_STYLE = {
  '참여예정': { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', color: '#065f46' },
  '참여완료': { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)', color: '#1e40af' },
};

function StatusBadge({ label }) {
  const s = STATUS_STYLE[label] || { bg: '#f3f4f6', border: '#e5e7eb', color: '#374151' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', height: 26,
      padding: '0 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
    }}>
      {label}
    </span>
  );
}

export default function ParticipationMypage() {
  const navigate = useNavigate();
  const [filter, setFilter]             = useState('all');
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [page, setPage]                 = useState(1);

  // ✅ 환불 모달 상태
  const [refundModal, setRefundModal]   = useState(null); // { pct } | null

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

  const filtered = participations.filter(pct => {
    if (pct.pctStatus === '취소' || pct.pctStatus === '참여삭제') return false;
    if (filter === 'all')      return true;
    if (filter === 'upcoming') return !isEnded(pct.eventEndDate);
    if (filter === 'done')     return isEnded(pct.eventEndDate);
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ✅ 취소 버튼 클릭 → RefundPolicy 모달 오픈
  const handleCancelClick = (pct) => {
    setRefundModal({ pct });
  };

  // ✅ 모달에서 확인 → 실제 취소 API 호출
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

  // ✅ 삭제 (참여완료 → 마이페이지에서만 제거)
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
    all:      '참여한 행사가 없습니다.',
    upcoming: '참여 예정인 행사가 없습니다.',
    done:     '참여 완료된 행사가 없습니다.',
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>행사 참여 내역</h2>

      {/* 필터 탭 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { key: 'all',      label: '전체' },
          { key: 'upcoming', label: '참여 예정' },
          { key: 'done',     label: '참여 완료' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '7px 18px', borderRadius: 999, border: '1px solid',
            borderColor: filter === f.key ? '#111827' : '#e5e7eb',
            background:  filter === f.key ? '#111827' : '#fff',
            color:       filter === f.key ? '#fff'    : '#6b7280',
            fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.empty}>불러오는 중...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colEvent}>행사</th>
                <th className={styles.colPeriod}>행사 기간</th>
                <th className={styles.colStatus}>상태</th>
                <th className={styles.colCreated}>결제 금액</th>
                <th style={{ width: '12%', textAlign: 'left', padding: '12px 14px' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.empty}>{EMPTY_MSG[filter]}</td>
                </tr>
              ) : paged.map(pct => {
                const displayStatus = isEnded(pct.eventEndDate) ? '참여완료' : '참여예정';
                const isProcessing  = processingId === pct.pctId;

                return (
                  <tr key={pct.pctId}>
                    {/* 행사 */}
                    <td>
                      <div className={styles.eventCell}>
                        <img
                          src={pct.thumbnail ? `${THUMBNAIL_BASE}${pct.thumbnail}` : '/images/moheng.png'}
                          alt=""
                          className={styles.eventCellThumb}
                          onClick={() => pct.eventId && navigate(`/events/${pct.eventId}`)}
                          style={{ cursor: pct.eventId ? 'pointer' : 'default' }}
                          onError={e => { e.currentTarget.src = '/images/moheng.png'; }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
                          <button
                            className={styles.linkTitle}
                            onClick={() => pct.eventId && navigate(`/events/${pct.eventId}`)}>
                            {pct.eventTitle || `행사 #${pct.eventId}`}
                          </button>
                          {pct.simpleExplain && (
                            <span style={{
                              fontSize: 12, color: '#9ca3af',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              maxWidth: 340,
                            }}>
                              {pct.simpleExplain}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 행사 기간 */}
                    <td style={{ fontSize: 13, color: '#6b7280' }}>
                      {fmtDate(pct.eventStartDate)} ~ {fmtDate(pct.eventEndDate)}
                    </td>

                    {/* 상태 */}
                    <td><StatusBadge label={displayStatus} /></td>

                    {/* 결제 금액 */}
                    <td style={{ fontWeight: 700 }}>
                      {pct.payAmount > 0 ? `${fmt(pct.payAmount)}원` : '무료'}
                    </td>

                    {/* 관리 */}
                    <td>
                      {/* 참여예정: 취소 → RefundPolicy 모달 */}
                      {displayStatus === '참여예정' && (
                        <button
                          onClick={() => handleCancelClick(pct)}
                          disabled={isProcessing}
                          style={{
                            padding: '6px 12px', borderRadius: 8,
                            border: '1px solid #fca5a5', background: '#fef2f2',
                            color: '#b91c1c', fontSize: 12, fontWeight: 700,
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            whiteSpace: 'nowrap',
                          }}>
                          {isProcessing ? '처리중...' : '취소'}
                        </button>
                      )}
                      {/* 참여완료: 삭제 */}
                      {displayStatus === '참여완료' && (
                        <button
                          onClick={() => handleDelete(pct)}
                          disabled={isProcessing}
                          style={{
                            padding: '6px 12px', borderRadius: 8,
                            border: '1px solid #e5e7eb', background: '#f9fafb',
                            color: '#6b7280', fontSize: 12, fontWeight: 700,
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            whiteSpace: 'nowrap',
                          }}>
                          {isProcessing ? '처리중...' : '삭제'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
          {pages.map(p => (
            <button key={p}
              className={`${styles.pageBtn} ${page === p ? styles.pageActive : ''}`}
              onClick={() => setPage(p)}>
              {p}
            </button>
          ))}
          <button className={styles.pageBtn} onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
        </div>
      )}

      {/* ✅ RefundPolicy 모달 */}
      {refundModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px',
        }}>
          <div style={{ width: '100%', maxWidth: 480 }}>
            <RefundPolicy
              onClose={() => setRefundModal(null)}
              onConfirm={handleCancelConfirm}
              eventStartDate={refundModal.pct.eventStartDate}
              paidAmount={refundModal.pct.payAmount || 0}
            />
          </div>
        </div>
      )}
    </div>
  );
}
