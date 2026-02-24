// src/features/user/components/Step3CorporateForm.jsx
import React from 'react';
import { useSignupForm } from '../hooks/useSignupForm';

const Step3CorporateForm = ({ onBack }) => {
  const { formData, handleChange, handleSubmit, isLoading } = useSignupForm({
    email: '', userPwd: '', name: '', phone: '', businessNum: '', signupType: 'BASIC'
  });

  return (
    <div className="form-container">
      <form onSubmit={(e) => handleSubmit(e, 'COMPANY')}>
        <div className="input-group">
          <label>이메일(ID)</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>비밀번호</label>
          <input type="password" name="userPwd" value={formData.userPwd} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>회사명</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="input-group with-btn">
          <label>전화번호</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
          <button type="button" className="action-btn">본인 인증</button>
        </div>
        <div className="input-group with-btn">
          <label>사업자 등록번호</label>
          <input type="text" name="businessNum" value={formData.businessNum} onChange={handleChange} required />
          <button type="button" className="action-btn">조회</button>
        </div>

        <div className="agreement-wrapper">
          <label className="checkbox-label">
            <input type="checkbox" name="agreement" checked={formData.agreement} onChange={handleChange} />
            [필수] 개인 정보 수집 및 이용 동의 <a href="#!">보기</a>
          </label>
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? '처리 중...' : '회원 가입'}
        </button>
      </form>
      <button className="back-btn" onClick={onBack}>뒤로가기</button>
    </div>
  );
};

export default Step3CorporateForm;