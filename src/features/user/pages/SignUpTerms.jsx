// src/features/user/pages/SignUpTerms.jsx
import React from 'react';

const SignUpTerms = ({ onClose }) => {
  const termsContent = `[수집/이용 목적]
• 회원가입 및 본인 확인
• 행사 참가 신청 및 참가자 관리
• 행사 관련 안내 및 서비스 이용 안내, 사용자 상담 진행
• 고객 문의 및 민원 처리
• 서비스 이용 통계 및 개선

[수집하는 개인정보 항목]
• 개인 회원 : 이메일, 비밀번호, 이름, 전화번호
• 업체 회원 : 이메일, 비밀번호, 이름, 전화번호, 사업자 등록번호

[개인정보 보유 및 이용 기간]
• 회원 탈퇴 시까지 보유 및 이용
• 단, 행사 참가 이력 및 정산·부정행위 처리 등 필요 시 관련 법령에 따라 일정 기간 보관
  - 계약 또는 청약철회 기록: 5년
  - 소비자 불만 또는 분쟁 처리 기록: 3년

[동의 거부 권리 및 불이익 안내]
• 이용자는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다.
• 필수 항목에 대한 동의를 거부할 경우 회원가입 및 행사 참여가 제한될 수 있습니다.`;

  // [] 부분을 찾아 <b> 태그로 감싸주는 함수
  const formatContent = (text) => {
    const parts = text.split(/(\[.*?\])/g); // []를 기준으로 텍스트 분할
    return parts.map((part, index) => 
      part.startsWith('[') && part.endsWith(']') ? (
        <b key={index} style={{ color: '#000', display: 'block', marginTop: index > 0 ? '15px' : '0', marginBottom: '5px' }}>
          {part}
        </b>
      ) : (
        part
      )
    );
  };

  const containerStyle = {
    display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff',
    borderRadius: '12px', width: '100%', maxHeight: '80vh',
    overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', fontFamily: 'sans-serif'
  };

  const headerStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '1px solid #eeeeee'
  };

  const contentStyle = {
    padding: '20px', overflowY: 'auto', backgroundColor: '#f9f9f9',
    fontSize: '14px', lineHeight: '1.6', color: '#444',
    whiteSpace: 'pre-line', textAlign: 'left'
  };

  const footerStyle = {
    padding: '16px', borderTop: '1px solid #eeeeee', display: 'flex', justifyContent: 'center'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/images/moheng.png" alt="모행" style={{ height: '25px' }} />
          <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>개인정보 이용 동의</span>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}
          >
            &times;
          </button>
        )}
      </div>

      <div style={contentStyle}>
        {/* 함수를 호출하여 굵게 처리된 결과 렌더링 */}
        {formatContent(termsContent)}
      </div>

      <div style={footerStyle}>
        <button 
          type="button" 
          style={{ padding: '12px 40px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }} 
          onClick={onClose || (() => window.history.back())}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default SignUpTerms;