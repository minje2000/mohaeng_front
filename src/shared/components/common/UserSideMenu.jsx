import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './UserSideMenu.module.css';

export default function UserSideMenu() {
  const linkClass = ({ isActive }) =>
    isActive ? `${styles.item} ${styles.active}` : styles.item;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.profileIcon} />

      <nav className={styles.menu}>
        {/* ✅ /mypage는 "내정보" 기본 화면(인덱스) */}
        <NavLink to="/mypage" end className={linkClass}>
          개인 정보 관리
        </NavLink>

        <NavLink to="/mypage/events/created" className={linkClass}>
          행사 등록 내역
        </NavLink>

        <NavLink to="/mypage/events/participated" className={linkClass}>
          행사 참여 내역
        </NavLink>

        <NavLink to="/mypage/wishlist" className={linkClass}>
          관심 행사 목록
        </NavLink>

        <NavLink to="/mypage/reviews" className={linkClass}>
          리뷰 작성 내역
        </NavLink>

        <NavLink to="/mypage/inquiries" className={linkClass}>
          문의 내역
        </NavLink>

        <NavLink to="/mypage/booths" className={linkClass}>
          부스 관리
        </NavLink>
      </nav>
    </aside>
  );
}
