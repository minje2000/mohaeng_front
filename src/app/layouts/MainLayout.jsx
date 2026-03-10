// src/app/layouts/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

import Header from '../../shared/components/common/Header';
import Footer from '../../shared/components/common/Footer';

export default function MainLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 상단 헤더 */}
      <Header />

      {/* 본문 영역 */}
      <main
        style={{
          flex: 1,
        }}
      >
        <Outlet />
      </main>

      {/* 하단 푸터 */}
      <Footer />
    </div>
  );
}