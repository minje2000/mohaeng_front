import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "../styles/UserCommon.module.css";

export default function FindPwd() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInput = (setter) => (e) => {
    setter(e.target.value);
    setIsSubmitted(false);
  };

  const submit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (!email || !phone) return;
    alert("본인 확인이 완료되었습니다.\n(다음 단계: 비밀번호 재설정)");
    navigate(-1);
  };

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.headerSection}>
          <Link to="/" className={styles.logoLink}>
            <img src="/images/moheng.png" alt="Moheng Logo" className={styles.logoImg} />
          </Link>
        </div>
        <h1 className={styles.title}>비밀번호 찾기</h1>
        <form onSubmit={submit} className={styles.form}>
          <div className={styles.rowGroup}>
            <label className={styles.label}>이메일(ID)</label>
            <input className={styles.input} value={email} onChange={handleInput(setEmail)} placeholder="이메일 입력" />
          </div>
          <div className={styles.rowGroup}>
            <label className={styles.label}>전화번호</label>
            <div className={styles.inputWithBtn}>
              <input className={styles.input} value={phone} onChange={handleInput(setPhone)} placeholder="번호 입력" />
              <button type="button" className={styles.actionBtn}>본인 인증</button>
            </div>
          </div>
          <div className={styles.messageContainer}>
            {isSubmitted && (!email || !phone) && "이메일과 전화번호를 입력해주세요."}
          </div>
          <button type="submit" className={styles.primaryBtn}>비밀번호 찾기</button>
        </form>
      </div>
    </main>
  );
}