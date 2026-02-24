import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "../styles/UserCommon.module.css";

export default function FindEmail() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInput = (setter) => (e) => {
    setter(e.target.value);
    setIsSubmitted(false);
  };

  const submit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (!name || !phone) return;
    alert("입력하신 정보로 이메일을 조회했습니다.\n(test@test.com)");
    navigate("/login");
  };

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.headerSection}>
          <Link to="/" className={styles.logoLink}>
            <img src="/images/moheng.png" alt="Moheng Logo" className={styles.logoImg} />
          </Link>
        </div>
        <h1 className={styles.title}>이메일 찾기</h1>
        <form onSubmit={submit} className={styles.form}>
          <div className={styles.rowGroup}>
            <label className={styles.label}>이름</label>
            <input className={styles.input} value={name} onChange={handleInput(setName)} placeholder="이름 입력" />
          </div>
          <div className={styles.rowGroup}>
            <label className={styles.label}>전화번호</label>
            <div className={styles.inputWithBtn}>
              <input className={styles.input} value={phone} onChange={handleInput(setPhone)} placeholder="번호 입력" />
              <button type="button" className={styles.actionBtn}>본인 인증</button>
            </div>
          </div>
          <div className={styles.messageContainer}>
            {isSubmitted && (!name || !phone) && "이름과 전화번호를 입력해주세요."}
          </div>
          <button type="submit" className={styles.primaryBtn}>이메일 찾기</button>
        </form>
      </div>
    </main>
  );
}