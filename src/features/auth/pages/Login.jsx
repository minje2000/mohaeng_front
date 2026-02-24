// src/features/auth/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { login } from '../api/authApi';
import { ROLES } from '../../../shared/constants/roles';
import { useAuth } from '../../../app/providers/AuthProvider';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { setTokens } = useAuth();

  const [userId, setUserId] = useState(searchParams.get("email") ?? "");
  const [userPwd, setUserPwd] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false); // 버튼 클릭 여부 추적
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const isValid = userId.trim().length > 0 && userPwd.trim().length > 0;
  const joined = searchParams.get("joined") === "1";
  const from = location.state?.from?.pathname || '/';

  // 입력 시 메시지를 초기화하는 핸들러
  const handleUserIdChange = (e) => {
    setUserId(e.target.value);
    if (isSubmitted) setIsSubmitted(false);
    if (err) setErr("");
  };

  const handleUserPwdChange = (e) => {
    setUserPwd(e.target.value);
    if (isSubmitted) setIsSubmitted(false);
    if (err) setErr("");
  };

  // 구글 로그인 핸들러
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  async function onSubmit(e) {
    e.preventDefault();
    setIsSubmitted(true); // 버튼 클릭 시점에 true로 설정

    if (!isValid) return; // 유효하지 않으면 여기서 중단 (에러 메시지 표시됨)

    setLoading(true);
    setErr("");

    try {
      const token = await login({ userId, userPwd }); 
      setTokens(token); 

      const role = token?.role;
      const isAdmin = [ROLES.ADMIN, 'ROLE_ADMIN', 'admin', 'ADMIN'].includes(role);

      if (isAdmin) {
        navigate('/admin/members', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (e2) {
      const msg = e2?.response?.data?.message || e2?.message || '로그인 실패';
      setErr(msg.includes('제한') ? '로그인 제한 회원입니다.' : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.logoSection}>
          <Link to="/" className={styles.logoLink}>
            <img src="/images/moheng.png" alt="Moheng Logo" className={styles.logoImg} />
          </Link>
        </div>

        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>이메일(ID)</label>
            <input
              className={styles.input}
              value={userId}
              onChange={handleUserIdChange}
              autoComplete="username"
              placeholder="아이디"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>비밀번호</label>
            <input
              className={styles.input}
              type="password"
              value={userPwd}
              onChange={handleUserPwdChange}
              autoComplete="current-password"
              placeholder="비밀번호"
            />
          </div>

          {/* 메시지 노출 */}
          <div className={styles.messageContainer}>
            {isSubmitted && !isValid ? (
              <div className={`${styles.message} ${styles.error}`}>아이디와 비밀번호를 입력해주세요.</div>
            ) : err ? (
              <div className={`${styles.message} ${styles.error}`}>{err}</div>
            ) : null}
          </div>

          <div className={styles.links}>
            <Link to="/api/user/FindEmail" className={styles.linkItem}>이메일 찾기</Link>
            <span style={{ margin: '0 10px' }}>|</span>
            <Link to="/api/user/FindPwd" className={styles.linkItem}>비밀번호 찾기</Link>
          </div>

          <button type="submit" disabled={loading} className={styles.loginBtn}>
            {loading ? "로그인 중..." : "로그인"}
          </button>

          {/* 구글 버튼 */}
          <button className={styles.googleBtn} type="button" onClick={handleGoogleLogin}>
            <svg className={styles.googleIcon} viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            </svg>
            <span className={styles.googleText}>구글 계정으로 간편 로그인</span>
          </button>
        </form>
      </div>
    </main>
  );
}