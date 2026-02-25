import { Link, useLocation } from "react-router-dom"; // navigate는 이제 안 쓰니 지워도 됩니다!
import { useState, useEffect } from "react";
import styles from "./Header.module.css";

export default function Header() {
  const location = useLocation();

  // 💡 1. useMemo 대신 useState로 로그인 상태 관리
  const [isAuthed, setIsAuthed] = useState(() => {
    return Boolean(localStorage.getItem("accessToken"));
  });

  // 💡 2. 혹시 다른 탭/페이지에서 상태가 변했을 때를 대비한 동기화
  useEffect(() => {
    setIsAuthed(Boolean(localStorage.getItem("accessToken")));
  }, [location.key]);

  // 💡 3. 수정한 로그아웃 함수
  const onLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    
    // 알림창과 navigate(이동) 삭제!
    // 대신 상태를 바로 false로 바꿔서 즉시 '로그인/회원가입'으로 화면을 다시 그립니다.
    setIsAuthed(false); 
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        
        {/* 1. 왼쪽: 로고 */}
        <Link to="/" className={styles.logo} aria-label="홈">
          <img src="/images/moheng.png" alt="모행" className={styles.logoImg} />
        </Link>

        {/* 2. 중앙: 메인 네비게이션 (글자를 살려서 직관적으로!) */}
        <nav className={styles.centerNav} aria-label="메인 메뉴">
          <Link to="/" className={styles.mainLink}>
            <MapIcon />
            <span>행사 지도</span>
          </Link>
          <div className={styles.centerDivider}></div>
          <Link to="/calendar" className={styles.mainLink}>
            <CalendarIcon />
            <span>행사 달력</span>
          </Link>
        </nav>

        {/* 3. 오른쪽: 유저 메뉴 */}
        <nav className={styles.rightNav} aria-label="유저 메뉴">
          {isAuthed ? (
            <>
              {/* 알림 (동그란 아이콘 버튼) */}
              <button className={styles.iconBtn} type="button" aria-label="알림" title="알림">
                <BellIcon />
              </button>

              {/* 마이페이지 (일반 텍스트 버튼) */}
              <Link className={styles.textLink} to="/mypage">
                <UserIcon />
                <span>마이페이지</span>
              </Link>

              {/* 로그아웃 (일반 텍스트 버튼) */}
              <button className={styles.textLink} type="button" onClick={onLogout}>
                <LogoutIcon />
                <span>로그아웃</span>
              </button>
            </>
          ) : (
            <>
              {/* 💡 1. 회원가입: primaryBtn을 textLink로 변경해서 텍스트로 통일! */}
              <Link className={styles.textLink} to="/signup">
                <UserPlusIcon />
                <span>회원가입</span>
              </Link>

              {/* 💡 2. 로그인: state={{ from: ... }}을 추가해서 현재 위치(게시판) 기억하게 만들기! */}
              <Link 
                className={styles.textLink} 
                to="/login"
                onClick={() => sessionStorage.setItem('redirectUrl', location.pathname + location.search)}
              >
                <LoginIcon />
                <span>로그인</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

/* ===== Icons ===== */
function MapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 5 3.5 7.2v11.1L9 16.1l6 2.3 5.5-2.2V5.1L15 7.4 9 5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 5v11.1" stroke="currentColor" strokeWidth="2" />
      <path d="M15 7.4v11" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3v3M17 3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4.5 7.2h15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 5.5h12a2 2 0 0 1 2 2v12.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 11h3M13 11h3M8 14.5h3M13 14.5h3M8 18h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.7 21a2 2 0 01-3.4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M20 21a8 8 0 10-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function LoginIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 7V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-1" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M3 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 8l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 7V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-1" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M21 12H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 8l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function UserPlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path d="M2.5 20c.8-4 4-6 6.5-6s5.7 2 6.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 8v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}