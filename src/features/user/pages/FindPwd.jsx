// src/features/user/pages/FindPwd.jsx
import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/UserCommon.module.css";
import { useFindPwd } from "../hooks/useFindPwd";
import { usePhoneVerification } from '../hooks/usePhoneVerification';

export default function FindPwd() {
  const { formData, isLoading, isSubmitted, handleChange, handleSubmit } = useFindPwd();

  // 본인인증 전용 훅
    const {
      phone, verifiedCode, smsMessage, isSendSms, 
      verificationMessage, isVerified, 
      handlePhoneChange, handleCodeChange, sendSms, verifyCode
    } = usePhoneVerification();
    
  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.headerSection}>
          <Link to="/" className={styles.logoLink}>
            <img src="/images/moheng.png" alt="Moheng Logo" className={styles.logoImg} />
          </Link>
        </div>
        
        <h1 className={styles.title}>비밀번호 찾기</h1>
        
        <form onSubmit={(e) => handleSubmit(e, phone, isVerified)} className={styles.form}>
          <div className={styles.rowGroup}>
            <label className={styles.label}>이메일(ID)</label>
            <input 
              name="email"
              className={styles.input} 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="이메일 입력" 
            />
          </div>

          <div className={styles.inputRow}>
            <label className={styles.label}>전화번호</label>
            <div className={styles.inputGroup}>
              <div className={styles.inputWithBtn}>
                <input
                  className={styles.input}
                  type="tel"
                  name="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="-없이 숫자만 입력"
                  maxLength={11}
                  required
                />
                <button type="button" className={styles.actionBtn} onClick={sendSms}>본인 인증</button>
              </div>
              <div
                className={styles.helperText}
                style={{ color: isSendSms ? 'green' : 'crimson' }}
              >
                {isSendSms ? smsMessage : '전화번호 입력 후 본인 인증 바랍니다.'}
              </div>
            </div>
          </div>
          <div className={styles.inputRow}>
            <label className={styles.label}>인증번호</label>
            <div className={styles.inputGroup}>
              <div className={styles.inputWithBtn}>
                <input
                  className={styles.input}
                  type="text"
                  name="verifiedCode"
                  value={verifiedCode}
                  onChange={handleCodeChange}
                  required
                />
                <button type="button" className={styles.actionBtn} onClick={verifyCode}>확인</button>
              </div>
              {verificationMessage && (
                <div className={styles.helperText} style={{ color: isVerified ? 'green' : 'crimson' }}>
                  {verificationMessage}
                </div>
              )}
            </div>
          </div>

          <div className={styles.messageContainer}>
            {isSubmitted && (!formData.email || !phone) && (
              <span className={styles.errorText}>이메일과 전화번호를 입력해주세요.</span>
            )}
          </div>

          <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
            {isLoading ? '처리 중...' : '비밀번호 찾기'}
          </button>
        </form>
      </div>
    </main>
  );
}