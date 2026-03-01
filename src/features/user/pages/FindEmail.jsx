// src/features/user/pages/FindEmail.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useFindEmail } from "../hooks/useFindEmail";
import { usePhoneVerification } from '../hooks/usePhoneVerification';
import styles from "../styles/UserCommon.module.css";

export default function FindEmail() {
  const { 
    formData, 
    isSubmitted, 
    handleChange,
    handleSubmit 
  } = useFindEmail();

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
        
        <h1 className={styles.title}>이메일 찾기</h1>
        
        <form onSubmit={(e) => handleSubmit(e, phone, isVerified)} className={styles.form} noValidate>
          <div className={styles.rowGroup}>
            <label className={styles.label}>이름</label>
            <input 
              className={styles.input} 
              name="name"
              value={formData.name} 
              onChange={handleChange} 
              placeholder="이름 입력" 
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
            {/* 유효성 검사 에러 메시지 */}
            {isSubmitted && (!formData.name || !phone) && (
              <span className={styles.errorText}>이름과 전화번호를 입력해주세요.</span>
            )}
          </div>
          
          <button type="submit" className={styles.primaryBtn}>
            이메일 찾기
          </button>
        </form>
      </div>
    </main>
  );
}