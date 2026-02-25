// src/features/user/pages/FindEmail.jsx
import React from "react";
// import { useNavigate } from 'react-router-dom'; // navigate 추가
import { Link } from "react-router-dom";
import { useFindEmail } from "../hooks/useFindEmail";
import styles from "../styles/UserCommon.module.css";

export default function FindEmail() {
  const { 
    formData, 
    isSubmitted, 
    handleChange, 
    handleVerify, 
    handleSubmit 
  } = useFindEmail();

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.headerSection}>
          <Link to="/" className={styles.logoLink}>
            <img src="/images/moheng.png" alt="Moheng Logo" className={styles.logoImg} />
          </Link>
        </div>
        
        <h1 className={styles.title}>이메일 찾기</h1>
        
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
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
          
          <div className={styles.rowGroup}>
            <label className={styles.label}>전화번호</label>
            <div className={styles.inputWithBtn}>
              <input 
                className={styles.input} 
                name="phone"
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="번호 입력" 
              />
              <button 
                type="button" 
                className={styles.actionBtn} 
                onClick={handleVerify}
              >
                본인 인증
              </button>
            </div>
          </div>

          <div className={styles.messageContainer}>
            {/* 유효성 검사 에러 메시지 */}
            {isSubmitted && (!formData.name || !formData.phone) && (
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