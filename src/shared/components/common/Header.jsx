import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./Header.module.css";

import NotificationBell from "../../../features/notification/components/NotificationBell";
import { tokenStore } from "../../../app/http/tokenStore";

export default function Header() {
  const location = useLocation();

  const [isAuthed, setIsAuthed] = useState(() => {
    return Boolean(localStorage.getItem("accessToken"));
  });

  useEffect(() => {
    setIsAuthed(Boolean(localStorage.getItem("accessToken")));
  }, [location.key]);

  const onLogout = () => {
    tokenStore.clear();
    setIsAuthed(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        {/* ✅ 왼쪽 그룹: 로고 + 네비 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" className={styles.logo} aria-label="홈">
            <img src="/images/moheng.png" alt="모행" className={styles.logoImg} />
          </Link>

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
            <div className={styles.centerDivider}></div>
            <Link to="/events" className={styles.mainLink}>
              <BoardIcon />
              <span>행사 게시판</span>
            </Link>
          </nav>
        </div>

        {/* 오른쪽: 유저 메뉴 */}
        <nav className={styles.rightNav} aria-label="유저 메뉴">
          {isAuthed ? (
            <>
              <NotificationBell
                className={styles.iconBtn}
                BellIcon={BellIcon}
              />
              <Link className={styles.textLink} to="/mypage">
                <UserIcon />
                <span>마이페이지</span>
              </Link>
              <button className={styles.textLink} type="button" onClick={onLogout}>
                <LogoutIcon />
                <span>로그아웃</span>
              </button>
            </>
          ) : (
            <>
              <Link className={styles.textLink} to="/api/user/signup">
                <UserPlusIcon />
                <span>회원가입</span>
              </Link>
              <Link
                className={styles.textLink}
                to="/login"
                onClick={() =>
                  sessionStorage.setItem("redirectUrl", location.pathname + location.search)
                }
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
function BoardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20V10.2c0-.6.3-1.2.9-1.5l6.2-3.5c.6-.3 1.2-.3 1.8 0l6.2 3.5c.6.3.9.9.9 1.5V20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
