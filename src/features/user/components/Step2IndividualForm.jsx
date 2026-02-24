// src/features/user/components/Step2IndividualForm.jsx
import React from 'react';
import { useSignupForm } from '../hooks/useSignupForm';

const Step2IndividualForm = ({ onBack }) => {
  // 구글 로그인 핸들러
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const { formData, handleChange, handleSubmit } = useSignupForm({
    email: '', password: '', name: '', phone: '', agreement: false
  });

  return (
    <div className="form-container">
      {/* 구글 버튼 */}
      <button className="gsi-material-button" type="button" onClick={handleGoogleLogin}>
        <div className="gsi-material-button-content-wrapper">
          <div className="gsi-material-button-icon">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{display: 'block'}}>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            </svg>
          </div>
          <span className="gsi-material-button-contents">구글 계정으로 간편 가입</span>
        </div>
      </button>

      <div className="divider-line"><span>또는</span></div>

      <form onSubmit={(e) => handleSubmit(e, 'INDIVIDUAL')}>
        <div className="input-row">
          <label>이메일(ID)</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="input-row">
          <label>비밀번호</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="input-row">
          <label>이름</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="input-row">
          <label>전화번호</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
          <button type="button" className="action-btn">본인 인증</button>
        </div>

        <div style={{textAlign: 'center', marginTop: '20px'}}>
          <input type="checkbox" id="agree" name="agreement" checked={formData.agreement} onChange={handleChange} />
          <label htmlFor="agree" style={{fontSize: '13px', marginLeft: '5px'}}>
            [필수] 개인 정보 수집 및 이용 동의 <a href="../pages/SignUpTerms">보기</a>
          </label>
        </div>

        <button type="submit" className="submit-btn">회원 가입</button>
      </form>
      <div style={{textAlign: 'center'}}><button className="back-btn" onClick={onBack}>뒤로가기</button></div>
    </div>
  );
};

export default Step2IndividualForm;