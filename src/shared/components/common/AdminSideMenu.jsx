import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './AdminSideMenu.module.css';

const MENU = [
  { label: '휴면 계정 관리', to: '/admin/events' },
  { label: '행사 신고 관리', to: '/admin/reports' },
  { label: '운영 통계', to: '/admin/stats' },
  { label: '행사 분석', to: '/admin/analysis' },
];

function MenuIcon() {
  return (
    <span className={styles.icon} aria-hidden="true">
      ▦
    </span>
  );
}

export default function AdminSideMenu({ className = '' }) {
  return (
    <aside className={`${styles.sidebar} ${className}`}>
      {/* <div className={styles.profileWrap}>
        <div className={styles.avatar} />
      </div> */}
      <div className={styles.title}>마이페이지</div>

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
