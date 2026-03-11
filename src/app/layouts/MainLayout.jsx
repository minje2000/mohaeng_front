// src/app/layouts/MainLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Header from '../../shared/components/common/Header';
import Footer from '../../shared/components/common/Footer';
import AiChatWidget from '../../shared/components/ai/AiChatWidget';

export default function MainLayout() {
  const { pathname } = useLocation();
  const showUserMypageChat = pathname.startsWith('/mypage');

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
      {showUserMypageChat ? <AiChatWidget pageType="mypage" /> : null}
    </div>
  );
}