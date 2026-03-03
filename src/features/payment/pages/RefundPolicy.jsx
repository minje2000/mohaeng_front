// src/features/user/pages/RefundPolicy.jsx
import React from 'react';

const REFUND_RULES = [
  { days: 30, rate: 100 },
  { days: 15, rate: 80  },
  { days: 7,  rate: 50  },
  { days: 3,  rate: 30  },
  { days: 2,  rate: 0   },
];

/**
 * 행사 시작일 기준으로 환불 비율(%)을 계산합니다.
 * @example calcRefundRate('2025-08-10') // → 80
 */
export const calcRefundRate = (eventStartDate) => {
  if (!eventStartDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(eventStartDate);
  start.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
  if (diffDays >= 30) return 100;
  if (diffDays >= 15) return 80;
  if (diffDays >= 7)  return 50;
  if (diffDays >= 3)  return 30;
  return 0;
};

/**
 * 환불 규정 안내 모달 컴포넌트
 *
 * Props
 *   onClose          - 닫기(취소) 콜백
 *   onConfirm        - 환불/취소 진행 콜백
 *   eventStartDate   - 행사 시작일 (string | Date) ← BoothMypageResponse.startDate / event.startDate
 *   paidAmount       - 결제 금액 (number)          ← BoothMypageResponse.totalPrice / event.price
 *   isRejection      - true이면 주최자 반려 → 100% 고정
 */
const RefundPolicy = ({ onClose, onConfirm, eventStartDate, paidAmount, isRejection = false }) => {
  const currentRate  = isRejection ? 100 : (eventStartDate != null ? calcRefundRate(eventStartDate) : null);
  const refundAmount = currentRate != null && paidAmount != null
    ? Math.floor(paidAmount * currentRate / 100) : null;

  const activeIndex = (() => {
    if (isRejection || currentRate === null) return -1;
    if (currentRate === 100) return 0;
    if (currentRate === 80)  return 1;
    if (currentRate === 50)  return 2;
    if (currentRate === 30)  return 3;
    return 4;
  })();

  const rateColor = (rate) => {
    if (rate === 100) return '#16A34A';
    if (rate >= 50)   return '#D97706';
    if (rate > 0)     return '#EA580C';
    return '#DC2626';
  };

  const confirmBtnColor = (isRejection || (currentRate !== null && currentRate > 0)) ? '#DC2626' : '#6B7280';
  const confirmBtnText  = isRejection          ? '전액 환불 신청하기'
    : currentRate === null ? '환불 신청하기'
    : currentRate === 0    ? '환불 없이 취소하기'
    : `${currentRate}% 환불 신청하기`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxHeight: '80vh', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', fontFamily: 'sans-serif' }}>

      {/* ── 헤더 ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #eeeeee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/images/moheng.png" alt="모행" style={{ height: '25px' }} />
          <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>환불 규정 안내</span>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>&times;</button>
        )}
      </div>

      {/* ── 본문 ── */}
      <div style={{ padding: '20px', overflowY: 'auto', backgroundColor: '#f9f9f9', fontSize: '14px', lineHeight: '1.6', color: '#444', textAlign: 'left', flex: 1 }}>

        {/* 반려 전액환불 배너 */}
        {isRejection && (
          <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: refundAmount != null ? '10px' : 0 }}>
              <span style={{ fontSize: '20px' }}>✅</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#166534' }}>반려 처리로 인한 전액 환불</div>
                <div style={{ fontSize: '12px', color: '#4B7563', marginTop: '2px' }}>주최자가 신청을 반려했습니다. 결제 금액이 100% 환불됩니다.</div>
              </div>
            </div>
            {refundAmount != null && (
              <div style={{ borderTop: '1px solid #A7F3D0', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>환불 금액</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: '#16A34A' }}>{refundAmount.toLocaleString()}원</span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '6px' }}>/ 결제 {paidAmount.toLocaleString()}원</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 일반 취소 — 현재 환불율 배너 */}
        {!isRejection && currentRate !== null && (
          <div style={{ background: currentRate > 0 ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${currentRate > 0 ? '#6EE7B7' : '#FECACA'}`, borderRadius: '10px', padding: '14px 18px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: refundAmount != null ? '10px' : 0 }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>현재 취소 시 적용 환불율</span>
              <span style={{ fontSize: '22px', fontWeight: '900', color: rateColor(currentRate) }}>{currentRate}%</span>
            </div>
            {refundAmount != null && (
              <div style={{ borderTop: `1px solid ${currentRate > 0 ? '#A7F3D0' : '#FECACA'}`, paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>예상 환불 금액</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: rateColor(currentRate) }}>{refundAmount.toLocaleString()}원</span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '6px' }}>/ 결제 {paidAmount.toLocaleString()}원</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 환불율 테이블 */}
        <b style={{ color: '#000', display: 'block', marginBottom: '10px' }}>[취소 시점별 환불 기준]</b>
        <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #E5E7EB', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#F3F4F6', padding: '10px 16px', fontSize: '12px', fontWeight: '800', color: '#6B7280' }}>
            <span>행사 시작일 기준</span>
            <span style={{ textAlign: 'right' }}>환불율</span>
          </div>
          {REFUND_RULES.map((rule, i) => {
            const isActive = i === activeIndex;
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '12px 16px', background: isActive ? `${rateColor(rule.rate)}10` : '#fff', borderTop: '1px solid #E5E7EB', borderLeft: isActive ? `3px solid ${rateColor(rule.rate)}` : '3px solid transparent' }}>
                <span style={{ fontSize: '14px', fontWeight: isActive ? '800' : '500', color: isActive ? rateColor(rule.rate) : '#374151' }}>
                  {i < REFUND_RULES.length - 1 ? `${rule.days}일 이전 취소` : `행사 시작 ${rule.days}일 이내 취소`}
                  {isActive && <span style={{ marginLeft: '6px', fontSize: '10px', background: rateColor(rule.rate), color: '#fff', borderRadius: '4px', padding: '1px 5px', fontWeight: '700' }}>현재</span>}
                </span>
                <span style={{ textAlign: 'right', fontSize: '15px', fontWeight: '800', color: rateColor(rule.rate) }}>{rule.rate}%</span>
              </div>
            );
          })}
        </div>

        {/* 유의사항 */}
        <b style={{ color: '#000', display: 'block', marginBottom: '8px' }}>[유의사항]</b>
        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#555', lineHeight: '2' }}>
          <li>환불 기준일은 <strong>취소 신청일</strong>이 아닌 <strong>행사 시작일 기준</strong>으로 산정됩니다.</li>
          <li>환불 금액은 결제 수수료를 제외한 실 결제 금액 기준으로 계산됩니다.</li>
          <li>환불은 신청 후 영업일 기준 <strong>3~5일 이내</strong> 처리됩니다.</li>
          <li>주최자 귀책 사유로 행사가 취소·변경된 경우 <strong>100% 전액 환불</strong>됩니다.</li>
          <li>부스 참가의 경우 <strong>반려 처리 시</strong> 결제 금액이 전액 환불됩니다.</li>
          <li>할인쿠폰·포인트 등 혜택을 적용하여 결제한 경우, 환불 시 해당 혜택은 복원되지 않을 수 있습니다.</li>
        </ul>

        <div style={{ marginTop: '20px', padding: '14px 16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', fontSize: '13px', color: '#92400E' }}>
          💬 환불 관련 문의는 <strong>고객센터(mohaeng@support.kr)</strong> 또는 마이페이지 내 <strong>1:1 문의</strong>를 이용해 주세요.
        </div>
      </div>

      {/* ── 푸터 ── */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #eeeeee', display: 'flex', gap: '10px' }}>
        <button type="button" onClick={onClose || (() => {})}
          style={{ flex: 1, padding: '13px 0', backgroundColor: '#fff', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
          취소
        </button>
        <button type="button" onClick={onConfirm || (() => {})}
          style={{ flex: 2, padding: '13px 0', backgroundColor: confirmBtnColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '900', fontSize: '14px' }}>
          {confirmBtnText}
        </button>
      </div>
    </div>
  );
};

export default RefundPolicy;
