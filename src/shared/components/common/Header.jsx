import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import styles from "./Header.module.css";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [q, setQ] = useState("");

  // ✅ 임시 로그인 판별: 토큰 존재 여부
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isAuthed = useMemo(() => {
    return Boolean(localStorage.getItem("accessToken"));
  }, [location.key]);

  const onSubmit = (e) => {
  e.preventDefault();
  const keyword = q.trim();
  // 💡 중요: 'q=' 가 아니라 'keyword=' 로 보내야 EventList가 인식합니다.
  navigate(`/events${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ""}`);
};

  const onLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* 로고 */}
        <Link to="/" className={styles.logo} aria-label="홈">
          <img src="/images/moheng.png" alt="모행" className={styles.logoImg} />
        </Link>

        {/* 검색 */}
        <form className={styles.search} onSubmit={onSubmit} role="search">
          <input
            className={styles.searchInput}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="뽀대용"
            aria-label="검색"
          />
          <button className={styles.searchBtn} type="submit" aria-label="검색">
            <SearchIcon />
          </button>
        </form>

        {/* 우측 메뉴 */}
        <nav className={styles.nav} aria-label="헤더 메뉴">
          {isAuthed ? (
            <>
              <button className={styles.iconBtn} type="button" aria-label="알림">
                <BellIcon />
              </button>

              <Link className={styles.navLink} to="/mypage">
                <UserIcon />
                <span>마이페이지</span>
              </Link>

              <button className={styles.navLinkBtn} type="button" onClick={onLogout}>
                <LogoutIcon />
                <span>로그아웃</span>
              </button>
            </>
          ) : (
            <>
              <Link className={styles.navLink} to="/signup">
                <UserPlusIcon />
                <span>회원가입</span>
              </Link>

              <Link className={styles.navLink} to="/login">
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

/* ===== Icons (stroke/currentColor 통일) ===== */

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.7 21a2 2 0 01-3.4 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M20 21a8 8 0 10-16 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ✅ 네가 원한 로그인 아이콘 느낌 그대로 */
function LoginIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10 7V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M3 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M9 8l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 7V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M21 12H11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M17 8l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M2.5 20c.8-4 4-6 6.5-6s5.7 2 6.5 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M19 8v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 11h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}