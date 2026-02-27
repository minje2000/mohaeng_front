// src/features/admin/pages/AdminMypage.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSideMenu from '../../shared/components/common/AdminSideMenu';

export default function AdminMypage() {
  return (
    <div style={{
      display: 'flex',
      gap: 24,
      maxWidth: 1300,
      margin: '40px auto',
      padding: '0 20px',
      alignItems: 'flex-start',
    }}>
      <AdminSideMenu />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </div>
    </div>
  );
}
