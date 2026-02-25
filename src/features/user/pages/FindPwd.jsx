// src/features/user/pages/FindPwd.jsx
import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/UserCommon.module.css";
import { useFindPwd } from "../hooks/useFindPwd";

export default function FindPwd() {
  const { formData, isLoading, isSubmitted, handleChange, handleVerify, handleSubmit } = useFindPwd();

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.headerSection}>
          <Link to="/" className={styles.logoLink}>
            <img src="/images/moheng.png" alt="Moheng Logo" className={styles.logoImg} />
          </Link>
        </div>
        
        <h1 className={styles.title}>비밀번호 찾기</h1>
        
        <form onSubmit={handleSubmit} className={styles.form}>
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

          <div className={styles.rowGroup}>
            <label className={styles.label}>전화번호</label>
            <div className={styles.inputWithBtn}>
              <input 
                name="phone"
                className={styles.input} 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="번호 입력" 
              />
              <button 
                type="button" 
                onClick={handleVerify}
                className={styles.actionBtn}
              >
                본인 인증
              </button>
            </div>
          </div>

          <div className={styles.messageContainer}>
            {isSubmitted && (!formData.email || !formData.phone) && (
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