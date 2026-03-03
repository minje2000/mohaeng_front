// src/features/event/participation/pages/ParticipationMypage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiJson } from '../../../../app/http/request';

const THUMBNAIL_BASE = 'http://localhost:8080/upload_files/event/';

const fmtDate = (d) => (d ? String(d).replaceAll('-', '.') : '-');
const fmt = (n) => (n == null ? '-' : Number(n).toLocaleString());

// ─── 환불율 계산 (백엔드와 동일 로직) ───
function calcRefundRate(eventStartDate) {
  if (!eventStartDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(eventStartDate);
  start.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil((start - today) / (1000 * 60 * 60 * 24));

  if (daysLeft >= 30) return 100;
  if (daysLeft >= 15) return 80;
  if (daysLeft >= 7)  return 50;
  if (daysLeft >= 3)  return 30;
  return 0;
}

// ─── 참여 상태 배지 스타일 ───
const STATUS_STYLE = {
  '결제대기':  { bg: '#FEF3C7', color: '#92400E', label: '결제 대기' },     // ✅ 문제 4
  '결제완료':  { bg: '#DBEAFE', color: '#1D4ED8', label: '결제 완료' },
  '참여확정':  { bg: '#D1FAE5', color: '#065F46', label: '참여 확정' },
  '취소':      { bg: '#F3F4F6', color: '#6B7280', label: '취소됨' },
  '신청':      { bg: '#E0E7FF', color: '#4338CA', label: '신청 완료' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { bg: '#F3F4F6', color: '#374151', label: status || '-' };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 999,
      fontSize: 12, fontWeight: 700, background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  );
}

// ─── 부스 상태 배지 ───
const BOOTH_STATUS_STYLE = {
  '대기':      { bg: '#F3F4F6', color: '#6B7280' },
  '신청':      { bg: '#E0E7FF', color: '#4338CA' },
  '결제대기':  { bg: '#FEF3C7', color: '#92400E' },
  '결제완료':  { bg: '#DBEAFE', color: '#1D4ED8' },
  '승인':      { bg: '#D1FAE5', color: '#065F46' },
  // ✅ 문제 2: 취소 상태 명확히 표시
  '취소':      { bg: '#F3F4F6', color: '#9CA3AF' },
  '반려':      { bg: '#FEE2E2', color: '#B91C1C' },
};

function BoothStatusBadge({ status }) {
  const s = BOOTH_STATUS_STYLE[status] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 999,
      fontSize: 12, fontWeight: 700, background: s.bg, color: s.color,
    }}>
      {status || '-'}
    </span>
  );
}

// ─── RefundInfo: 환불 예정 금액 표시 ───
function RefundInfo({ payAmount, startDate }) {
  if (!payAmount || payAmount === 0) return null;
  const rate = calcRefundRate(startDate);
  const refundAmount = Math.floor(payAmount * rate / 100);

  return (
    <div style={{
      marginTop: 8, padding: '8px 12px',
      background: rate === 0 ? '#FEF2F2' : '#F0FDF4',
      borderRadius: 8, fontSize: 12,
      color: rate === 0 ? '#991B1B' : '#166534',
    }}>
      <span style={{ fontWeight: 700 }}>환불 예정액: {fmt(refundAmount)}원</span>
      <span style={{ marginLeft: 6, color: '#6B7280' }}>
        ({rate}% 환불 / 결제 {fmt(payAmount)}원)
      </span>
      {rate === 0 && <div style={{ marginTop: 2, color: '#B91C1C' }}>⚠️ 행사 시작 3일 이내 취소는 환불이 되지 않습니다.</div>}
    </div>
  );
}

// ══════════════════════════════════════════
//   메인 컴포넌트
// ══════════════════════════════════════════
export default function ParticipationMypage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('participation'); // 'participation' | 'booth'
  const [participations, setParticipations] = useState([]);
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const loadParticipations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiJson().get('/api/eventParticipation/myParticipations');
      setParticipations(res.data || []);
    } catch (e) {
      console.error('행사 참여 내역 로딩 실패', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBooths = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiJson().get('/api/eventParticipation/myBoothParticipations');
      setBooths(res.data || []);
    } catch (e) {
      console.error('부스 신청 내역 로딩 실패', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'participation') loadParticipations();
    else loadBooths();
  }, [activeTab, loadParticipations, loadBooths]);

  // ✅ 문제 7: 행사 참여 취소 (환불 포함)
  const handleCancelParticipation = async (pct) => {
    const cancelable = ['신청', '결제대기', '결제완료', '참여확정'];
    if (!cancelable.includes(pct.pctStatus)) {
      alert('이미 취소된 신청입니다.');
      return;
    }

    const rate = calcRefundRate(pct.eventStartDate);
    const refundAmount = pct.payAmount ? Math.floor(pct.payAmount * rate / 100) : 0;

    let confirmMsg = '참여를 취소하시겠습니까?';
    if (pct.payAmount > 0) {
      confirmMsg += `\n\n결제 금액: ${fmt(pct.payAmount)}원`;
      confirmMsg += `\n환불 예정: ${fmt(refundAmount)}원 (${rate}%)`;
      if (rate === 0) confirmMsg += '\n⚠️ 행사 시작 3일 이내로 환불이 불가합니다.';
    }

    if (!window.confirm(confirmMsg)) return;

    setCancellingId(pct.pctId);
    try {
      await apiJson().delete(`/api/eventParticipation/cancelParticipation?pctId=${pct.pctId}`);
      alert('취소가 완료되었습니다.' + (refundAmount > 0 ? `\n${fmt(refundAmount)}원이 환불됩니다.` : ''));
      loadParticipations();
    } catch (e) {
      alert(e?.response?.data?.message || '취소 중 오류가 발생했습니다.');
    } finally {
      setCancellingId(null);
    }
  };

  // ✅ 문제 2: 부스 취소 (취소된 것은 버튼 숨김)
  const handleCancelBooth = async (booth) => {
    if (!['신청', '결제대기', '결제완료'].includes(booth.status)) {
      alert('현재 상태에서는 취소할 수 없습니다.');
      return;
    }

    const rate = calcRefundRate(booth.eventStartDate);
    const refundAmount = booth.payAmount ? Math.floor(booth.payAmount * rate / 100) : 0;

    let confirmMsg = '부스 신청을 취소하시겠습니까?';
    if (booth.payAmount > 0) {
      confirmMsg += `\n환불 예정: ${fmt(refundAmount)}원 (${rate}%)`;
    }
    if (!window.confirm(confirmMsg)) return;

    setCancellingId(booth.pctBoothId);
    try {
      await apiJson().delete(`/api/eventParticipation/cancelBoothParticipation?pctBoothId=${booth.pctBoothId}`);
      alert('부스 취소가 완료되었습니다.' + (refundAmount > 0 ? `\n${fmt(refundAmount)}원이 환불됩니다.` : ''));
      loadBooths();
    } catch (e) {
      alert(e?.response?.data?.message || '취소 중 오류가 발생했습니다.');
    } finally {
      setCancellingId(null);
    }
  };

  // ─── 취소 가능 여부 판단 ───
  const isCancelableParticipation = (status) =>
    ['신청', '결제대기', '결제완료', '참여확정'].includes(status);

  // ✅ 문제 2: 부스 취소 가능 여부 (승인/반려/취소 상태는 취소 불가)
  const isCancelableBooth = (status) =>
    ['신청', '결제대기', '결제완료'].includes(status);

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: 20 }}>
      <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 900 }}>나의 행사 참여</h2>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid #E5E7EB' }}>
        {[
          { key: 'participation', label: '행사 참여 내역' },
          { key: 'booth',         label: '부스 신청 내역' },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{
              padding: '10px 24px', background: 'none', border: 'none',
              borderBottom: activeTab === t.key ? '3px solid #111' : '3px solid transparent',
              fontWeight: activeTab === t.key ? 900 : 600,
              color: activeTab === t.key ? '#111' : '#9CA3AF',
              fontSize: 14, cursor: 'pointer', marginBottom: -2,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>불러오는 중...</div>
      ) : activeTab === 'participation' ? (
        /* ─── 행사 참여 목록 ─── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {participations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>참여한 행사가 없습니다.</div>
          ) : participations.map(pct => (
            <div key={pct.pctId} style={{
              background: '#fff', border: '1px solid #E5E7EB',
              borderRadius: 14, padding: '18px 20px',
            }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {/* 썸네일 */}
                <img
                  src={pct.thumbnail ? `${THUMBNAIL_BASE}${pct.thumbnail}` : ''}
                  alt=""
                  onClick={() => pct.eventId && navigate(`/events/${pct.eventId}`)}
                  style={{
                    width: 72, height: 54, objectFit: 'cover', borderRadius: 8,
                    background: '#F3F4F6', flexShrink: 0,
                    cursor: pct.eventId ? 'pointer' : 'default',
                  }}
                  onError={e => { e.target.style.display = 'none'; }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span
                      onClick={() => pct.eventId && navigate(`/events/${pct.eventId}`)}
                      style={{ fontWeight: 800, fontSize: 15, color: '#111', cursor: pct.eventId ? 'pointer' : 'default' }}>
                      {pct.eventTitle || `행사 #${pct.eventId}`}
                    </span>
                    {/* ✅ 문제 4: 결제대기 상태 구분 표시 */}
                    <StatusBadge status={pct.pctStatus} />
                  </div>

                  <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 6 }}>
                    행사 기간: {fmtDate(pct.eventStartDate)} ~ {fmtDate(pct.eventEndDate)}
                  </div>

                  {/* ✅ 문제 4: 결제대기 안내 */}
                  {pct.pctStatus === '결제대기' && (
                    <div style={{
                      padding: '6px 10px', background: '#FFFBEB', borderRadius: 8,
                      fontSize: 12, color: '#92400E', marginBottom: 6,
                    }}>
                      ⏳ 결제가 완료되지 않았습니다. 결제를 완료하거나 취소해주세요.
                    </div>
                  )}

                  {/* ✅ 문제 7: 결제 금액 및 환불 예정액 표시 */}
                  {pct.payAmount > 0 && (
                    <div style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>
                      결제 금액: <strong>{fmt(pct.payAmount)}원</strong>
                    </div>
                  )}

                  {/* ✅ 문제 7: 취소 가능한 상태면 환불 예정 금액 미리 보여주기 */}
                  {isCancelableParticipation(pct.pctStatus) && pct.payAmount > 0 && (
                    <RefundInfo payAmount={pct.payAmount} startDate={pct.eventStartDate} />
                  )}
                </div>

                {/* 취소 버튼 */}
                <div style={{ flexShrink: 0 }}>
                  {isCancelableParticipation(pct.pctStatus) ? (
                    <button
                      onClick={() => handleCancelParticipation(pct)}
                      disabled={cancellingId === pct.pctId}
                      style={{
                        padding: '8px 14px', borderRadius: 10,
                        border: '1px solid #FCA5A5', background: '#FEF2F2',
                        color: '#B91C1C', fontSize: 13, fontWeight: 700,
                        cursor: cancellingId === pct.pctId ? 'not-allowed' : 'pointer',
                      }}>
                      {cancellingId === pct.pctId ? '취소 중...' : '참여 취소'}
                    </button>
                  ) : pct.pctStatus === '취소' ? (
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>취소됨</span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ─── 부스 신청 목록 ─── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {booths.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>신청한 부스가 없습니다.</div>
          ) : booths.map(booth => (
            <div key={booth.pctBoothId} style={{
              background: '#fff', border: '1px solid #E5E7EB',
              borderRadius: 14, padding: '18px 20px',
            }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <img
                  src={booth.thumbnail ? `${THUMBNAIL_BASE}${booth.thumbnail}` : ''}
                  alt=""
                  onClick={() => booth.eventId && navigate(`/events/${booth.eventId}`)}
                  style={{
                    width: 72, height: 54, objectFit: 'cover', borderRadius: 8,
                    background: '#F3F4F6', flexShrink: 0,
                    cursor: booth.eventId ? 'pointer' : 'default',
                  }}
                  onError={e => { e.target.style.display = 'none'; }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span
                      onClick={() => booth.eventId && navigate(`/events/${booth.eventId}`)}
                      style={{ fontWeight: 800, fontSize: 15, color: '#111', cursor: booth.eventId ? 'pointer' : 'default' }}>
                      {booth.eventTitle || `행사 #${booth.eventId}`}
                    </span>
                    {/* ✅ 문제 2: 취소/반려 상태 명확히 배지로 표시 */}
                    <BoothStatusBadge status={booth.status} />
                  </div>

                  <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>
                    부스명: {booth.boothName || '-'}
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 6 }}>
                    행사 기간: {fmtDate(booth.eventStartDate)} ~ {fmtDate(booth.eventEndDate)}
                  </div>

                  {/* ✅ 문제 2: 반려된 경우 안내 메시지 */}
                  {booth.status === '반려' && (
                    <div style={{
                      padding: '6px 10px', background: '#FEF2F2', borderRadius: 8,
                      fontSize: 12, color: '#991B1B', marginBottom: 6,
                    }}>
                      반려된 신청입니다. 결제 금액이 전액 환불됩니다.
                    </div>
                  )}

                  {/* 결제금액 + 환불 예정 */}
                  {booth.payAmount > 0 && (
                    <div style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>
                      결제 금액: <strong>{fmt(booth.payAmount)}원</strong>
                    </div>
                  )}
                  {isCancelableBooth(booth.status) && booth.payAmount > 0 && (
                    <RefundInfo payAmount={booth.payAmount} startDate={booth.eventStartDate} />
                  )}
                </div>

                {/* ✅ 문제 2: 취소/반려/승인 상태면 버튼 숨김 */}
                <div style={{ flexShrink: 0 }}>
                  {isCancelableBooth(booth.status) ? (
                    <button
                      onClick={() => handleCancelBooth(booth)}
                      disabled={cancellingId === booth.pctBoothId}
                      style={{
                        padding: '8px 14px', borderRadius: 10,
                        border: '1px solid #FCA5A5', background: '#FEF2F2',
                        color: '#B91C1C', fontSize: 13, fontWeight: 700,
                        cursor: cancellingId === booth.pctBoothId ? 'not-allowed' : 'pointer',
                      }}>
                      {cancellingId === booth.pctBoothId ? '취소 중...' : '신청 취소'}
                    </button>
                  ) : null}
                  {/* ✅ 문제 2: 취소 상태면 버튼 없이 상태 텍스트만 */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
