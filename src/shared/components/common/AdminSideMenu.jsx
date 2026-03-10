import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './AdminSideMenu.module.css';

const MENU = [
  { label: '운영 통계', to: '/admin/stats' },
  { label: '휴면 계정 관리', to: '/admin/dormantmanage' },
  { label: '행사 신고 관리', to: '/admin/reports' },
  { label: '행사 분석', to: '/admin/analysis' },
];

export default function AdminSideMenu({ className = '' }) {
  const linkClass = ({ isActive }) =>
    isActive ? `${styles.item} ${styles.active}` : styles.item;

  return (
    <aside className={`${styles.sidebar} ${className}`}>
      <div className={styles.title}>관리자 마이페이지</div>

      <nav className={styles.menu}>
        {MENU.map((item) => (
          <NavLink key={item.label} to={item.to} className={linkClass}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}