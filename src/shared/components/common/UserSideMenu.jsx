import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './UserSideMenu.module.css';

const MENU = [
  { label: '개인 정보 관리', to: '/mypage/profile' },
  { label: '행사 등록 내역', to: '/mypage/events/hosted' },
  { label: '행사 참여 내역', to: '/mypage/events/participations' },
  { label: '관심 행사 목록', to: '/mypage/favorites' },
  { label: '리뷰 작성 내역', to: '/mypage/reviews' },
  { label: '문의 내역', to: '/mypage/inquiries' },
  { label: '부스 관리', to: '/mypage/booths' },
];

function MenuIcon() {
  // (이미지처럼) 문서/리스트 느낌의 심플 아이콘
  return (
    <span className={styles.icon} aria-hidden="true">
      ▦
    </span>
  );
}

export default function UserSideMenu({ className = '' }) {
  return (
    <aside className={`${styles.sidebar} ${className}`}>
      <div className={styles.profileWrap}>
        <div className={styles.avatar} />
      </div>

      <nav className={styles.nav}>
        {MENU.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `${styles.item} ${isActive ? styles.active : ''}`
            }
          >
            <MenuIcon />
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
