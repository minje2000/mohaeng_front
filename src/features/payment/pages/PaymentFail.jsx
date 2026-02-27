// src/features/payment/pages/PaymentFail.jsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentFail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const errorCode = searchParams.get('code') || '';
  const errorMsg  = searchParams.get('message') || '결제가 취소되었거나 오류가 발생했습니다.';

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
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #F97316, #EF4444)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: '36px',
          boxShadow: '0 8px 24px rgba(239,68,68,0.3)'
        }}>
          !
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#111827', marginBottom: '8px' }}>
          결제가 완료되지 않았습니다
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '12px' }}>
          {errorMsg}
        </p>
        {errorCode && (
          <p style={{ fontSize: '12px', color: '#D1D5DB', marginBottom: '28px' }}>
            오류 코드: {errorCode}
          </p>
        )}

        <div style={{
          background: '#FFF7ED', borderRadius: '12px', padding: '16px',
          marginBottom: '28px', fontSize: '13px', color: '#92400E', lineHeight: 1.6
        }}>
          부스 신청 정보는 저장되어 있습니다.<br/>
          마이페이지에서 다시 결제를 시도할 수 있습니다.
        </div>

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
              border: 'none', background: '#F97316',
              fontWeight: '800', fontSize: '14px', cursor: 'pointer', color: '#fff'
            }}
          >
            행사 페이지로
          </button>
        </div>
      </div>
    </div>
  );
}
