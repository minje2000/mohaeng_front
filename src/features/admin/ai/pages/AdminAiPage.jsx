import React from 'react';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';

const TABS = [
  { label: 'AI FAQ 관리', to: '/admin/ai/faq' },
  { label: 'AI 문의 관리', to: '/admin/ai/contacts' },
  { label: 'AI 로그 분석', to: '/admin/ai/logs' },
];

export default function AdminAiPage() {
  const location = useLocation();

  if (location.pathname === '/admin/ai' || location.pathname === '/admin/ai/') {
    return <Navigate to="/admin/ai/faq" replace />;
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#111827' }}
        >
          AI 챗봇
        </h2>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 10,
          borderBottom: '1px solid #E5E7EB',
          marginBottom: 22,
          overflowX: 'auto',
          paddingBottom: 2,
        }}
      >
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end
            style={({ isActive }) => ({
              textDecoration: 'none',
              padding: '12px 14px',
              borderRadius: '12px 12px 0 0',
              fontSize: 14,
              fontWeight: isActive ? 800 : 700,
              color: isActive ? '#111827' : '#6B7280',
              background: isActive ? '#FFF8D6' : 'transparent',
              borderBottom: isActive
                ? '2px solid #FACC15'
                : '2px solid transparent',
              whiteSpace: 'nowrap',
            })}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
