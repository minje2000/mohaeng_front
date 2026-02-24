import React from 'react';
import { useSignupForm } from '../hooks/useSignupForm';
import styles from '../styles/SignUp.module.css';

const Step3CorporateForm = ({ onBack }) => {
  const { formData, handleChange, handleSubmit, isLoading } = useSignupForm({
    email: '', userPwd: '', name: '', phone: '', businessNum: '', signupType: 'BASIC'
  });

  return (
    <div className={styles.formContainer}>
      <form onSubmit={(e) => handleSubmit(e, 'COMPANY')} className={styles.formContainer} style={{gap: '12px'}}>
        <div className={styles.inputRow}>
          <label className={styles.label}>이메일(ID)</label>
          <input className={styles.input} type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className={styles.inputRow}>
          <label className={styles.label}>비밀번호</label>
          <input className={styles.input} type="password" name="userPwd" value={formData.userPwd} onChange={handleChange} required />
        </div>
        <div className={styles.inputRow}>
          <label className={styles.label}>회사명</label>
          <input className={styles.input} type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className={styles.inputRow}>
          <label className={styles.label}>전화번호</label>
          <div className={styles.inputWithBtn}>
            <input className={styles.input} type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            <button type="button" className={styles.actionBtn}>본인 인증</button>
          </div>
        </div>
        <div className={styles.inputRow}>
          <label className={styles.label}>사업자 번호</label>
          <div className={styles.inputWithBtn}>
            <input className={styles.input} type="text" name="businessNum" value={formData.businessNum} onChange={handleChange} required />
            <button type="button" className={styles.actionBtn}>조회</button>
          </div>
        </div>

        <div className={styles.agreementWrapper}>
          <label>
            <input type="checkbox" name="agreement" checked={formData.agreement} onChange={handleChange} />
            <span style={{marginLeft: '5px'}}>[필수] 개인 정보 수집 및 이용 동의</span>
          </label>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {isLoading ? '처리 중...' : '회원 가입'}
        </button>
      </form>
      <button className={styles.backBtn} onClick={onBack}>뒤로가기</button>
    </div>
  );
};

export default Step3CorporateForm;