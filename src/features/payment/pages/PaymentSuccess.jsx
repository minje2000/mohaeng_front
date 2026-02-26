// src/features/payment/pages/PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmPayment } from '../api/PaymentAPI';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [payInfo, setPayInfo] = useState(null);

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId    = searchParams.get('orderId');
    const amount     = Number(searchParams.get('amount'));

    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      setErrorMsg('결제 정보가 올바르지 않습니다.');
      return;
    }

    confirmPayment({ paymentKey, orderId, amount })
      .then((data) => {
        setPayInfo(data);
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err?.response?.data?.message || '결제 승인 중 오류가 발생했습니다.');
      });
  }, [searchParams]);

  // 이벤트 ID 복원 (orderId: BOOTH-{pctBoothId}-xxx)
  const getEventId = () => {
    const stored = sessionStorage.getItem('paymentEventId');
    return stored || '/events';
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Pretendard', sans-serif"
    }}>
      <div style={{
        background: '#fff', borderRadius: '24px', padding: '48px 40px',
        maxWidth: '440px', width: '90%', textAlign: 'center',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)', position: 'relative'
      }}>

        {/* ── 로딩 ── */}
        {status === 'loading' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '10px' }}>
              결제를 확인하고 있습니다
            </h2>
            <p style={{ fontSize: '14px', color: '#9CA3AF' }}>잠시만 기다려주세요...</p>
          </>
        )}

        {/* ── 성공 ── */}
        {status === 'success' && (
          <>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFD700, #F59E0B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', fontSize: '36px',
              boxShadow: '0 8px 24px rgba(255,215,0,0.4)'
            }}>
              ✓
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#111827', marginBottom: '8px' }}>
              결제가 완료되었습니다!
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '28px' }}>
              부스 참가 신청이 성공적으로 접수되었습니다.
            </p>

            {payInfo && (
              <div style={{
                background: '#FFFBEB', borderRadius: '16px', padding: '20px',
                marginBottom: '28px', border: '1px solid #FDE68A', textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#9CA3AF' }}>주문번호</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>{payInfo.paymentNo}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#9CA3AF' }}>결제금액</span>
                  <span style={{ fontSize: '16px', fontWeight: '900', color: '#D97706' }}>
                    {payInfo.amountTotal?.toLocaleString()}원
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: '#9CA3AF' }}>결제상태</span>
                  <span style={{
                    fontSize: '12px', fontWeight: '800', padding: '2px 10px',
                    borderRadius: '20px', background: '#D1FAE5', color: '#065F46'
                  }}>승인완료</span>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate(getEventId())}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #FFD700, #F59E0B)',
                border: 'none', color: '#000', fontWeight: '900',
                fontSize: '15px', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255,215,0,0.4)'
              }}
            >
              행사 페이지로 이동
            </button>
          </>
        )}

        {/* ── 실패 ── */}
        {status === 'error' && (
          <>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', fontSize: '36px',
              boxShadow: '0 8px 24px rgba(239,68,68,0.3)'
            }}>
              ✕
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#111827', marginBottom: '8px' }}>
              결제 승인에 실패했습니다
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '28px' }}>
              {errorMsg}
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => navigate(-2)}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  border: '1px solid #E5E7EB', background: '#fff',
                  fontWeight: '800', fontSize: '14px', cursor: 'pointer', color: '#374151'
                }}
              >
                신청서로 돌아가기
              </button>
              <button
                onClick={() => navigate(getEventId())}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  border: 'none', background: '#EF4444',
                  fontWeight: '800', fontSize: '14px', cursor: 'pointer', color: '#fff'
                }}
              >
                행사 페이지로
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
