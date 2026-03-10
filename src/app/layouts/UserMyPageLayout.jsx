// src/app/layouts/UserMyPageLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

import UserSideMenu from '../../shared/components/common/UserSideMenu';

export default function UserMyPageLayout() {
  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'flex-start',
        }}
      >
        <UserSideMenu />

        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}