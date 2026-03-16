import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './AdminSideMenu.module.css';

const MENU = [
  { label: '운영 통계', to: '/admin/stats' },
  { label: '휴면 계정 관리', to: '/admin/dormantmanage' },
  { label: '행사 신고 관리', to: '/admin/reports' },
  { label: '행사 검수 관리', to: '/admin/moderation' },
  { label: '행사 분석', to: '/admin/analysis' },
  {
    label: 'AI 챗봇',
    groupKey: 'ai',
    children: [
      { label: 'AI FAQ 관리', to: '/admin/ai/faq' },
      { label: 'AI 문의 관리', to: '/admin/ai/contacts' },
      { label: 'AI 로그 분석', to: '/admin/ai/logs' },
    ],
  },
];

export default function AdminSideMenu({ className = '' }) {
  const location = useLocation();

  const isAiRoute = useMemo(
    () => ['/admin/ai', '/admin/ai/faq', '/admin/ai/contacts', '/admin/ai/logs'].some((path) => location.pathname.startsWith(path)),
    [location.pathname],
  );

  const [openGroups, setOpenGroups] = useState({ ai: isAiRoute });

  useEffect(() => {
    if (isAiRoute) {
      setOpenGroups((prev) => ({ ...prev, ai: true }));
    }
  }, [isAiRoute]);

  const linkClass = ({ isActive }) =>
    isActive ? `${styles.item} ${styles.active}` : styles.item;

  const childLinkClass = ({ isActive }) =>
    isActive ? `${styles.childItem} ${styles.activeChild}` : styles.childItem;

  const toggleGroup = (groupKey) => {
    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  return (
    <aside className={`${styles.sidebar} ${className}`}>
      <div className={styles.title}>관리자 마이페이지</div>

      <nav className={styles.menu}>
        {MENU.map((item) => {
          if (!item.children) {
            return (
              <NavLink key={item.label} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            );
          }

          const isOpen = Boolean(openGroups[item.groupKey]);
          const isGroupActive = item.children.some((child) => location.pathname.startsWith(child.to));

          return (
            <div key={item.label} className={styles.groupWrap}>
              <button
                type="button"
                onClick={() => toggleGroup(item.groupKey)}
                className={`${styles.groupButton} ${isGroupActive ? styles.activeGroup : ''}`}
              >
                <span>{item.label}</span>
                <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▾</span>
              </button>

              {isOpen ? (
                <div className={styles.children}>
                  {item.children.map((child) => (
                    <NavLink key={child.label} to={child.to} className={childLinkClass}>
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
