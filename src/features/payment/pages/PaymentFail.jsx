// src/features/payment/pages/PaymentFail.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// ✅ 실제 경로: src/features/event/participation/api/
import { ParticipationBoothApi } from '../../event/participation/api/ParticipationBoothAPI';
import { ParticipationApi } from '../../event/participation/api/ParticipationApi';

export default function PaymentFail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cancelledRef = useRef(false);

  const errorCode = searchParams.get('code')    || '';
  const errorMsg  = searchParams.get('message') || '결제가 취소되었거나 오류가 발생했습니다.';

  const getEventPath = () => sessionStorage.getItem('paymentEventId') || '/events';

  /**
   * 결제 실패/취소 → 미완료 신청 자동 취소
   *
   * ParticipationBoothApply / ParticipationApply에서
   * 결제창 진입 직전에 sessionStorage에 저장한 pendingCancel을 읽어
   * 해당 취소 API를 호출합니다.
   *
   * pendingCancel 형식: { type: 'booth' | 'participation', id: number }
   *   type 'booth'         → EventParticipationController.cancelBoothParticipation(pctBoothId)
   *   type 'participation' → EventParticipationController.cancelParticipation(pctId)
   */
  useEffect(() => {
    if (cancelledRef.current) return;
    cancelledRef.current = true;

    const raw = sessionStorage.getItem('pendingCancel');
    if (!raw) return;

    const { type, id } = JSON.parse(raw);
    if (!id) return;

    // ✅ API 호출 성공 여부와 상관없이 세션은 먼저 비웁니다 (중복 방지)
    sessionStorage.removeItem('pendingCancel');

    if (type === 'booth') {
      ParticipationBoothApi.cancelBoothParticipation(id)
        .then(() => console.log("결제 취소로 인한 부스 신청 자동 삭제 완료"))
        .catch((e) => console.warn('부스 신청 자동 취소 실패', e));
    } else if (type === 'participation') {
      ParticipationApi.cancelParticipation(id)
        .then(() => console.log("결제 취소로 인한 행사 신청 자동 삭제 완료"))
        .catch((e) => console.warn('행사 참가 신청 자동 취소 실패', e));
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pretendard', sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: '24px', padding: '48px 40px', maxWidth: '440px', width: '90%', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>

        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #F97316, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '36px', boxShadow: '0 8px 24px rgba(239,68,68,0.3)' }}>
          !
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#111827', marginBottom: '8px' }}>결제가 완료되지 않았습니다</h2>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '12px' }}>{errorMsg}</p>
        {errorCode && <p style={{ fontSize: '12px', color: '#D1D5DB', marginBottom: '28px' }}>오류 코드: {errorCode}</p>}

        <div style={{ background: '#FFF7ED', borderRadius: '12px', padding: '16px', marginBottom: '28px', fontSize: '13px', color: '#92400E', lineHeight: 1.6 }}>
          결제가 완료되지 않아 <strong>신청이 자동으로 취소</strong>되었습니다.<br />
          다시 참가하려면 신청서를 새로 작성해주세요.
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate(-2)}
            style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#fff', fontWeight: '800', fontSize: '14px', cursor: 'pointer', color: '#374151' }}>
            신청서 다시 작성
          </button>
          <button onClick={() => navigate(getEventPath())}
            style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#F97316', fontWeight: '800', fontSize: '14px', cursor: 'pointer', color: '#fff' }}>
            행사 페이지로
          </button>
        </div>
      </div>
    </div>
  );
}
