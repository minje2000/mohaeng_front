// src/app/layouts/UserMyPageLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

import Header from '../../shared/components/common/Header';
import Footer from '../../shared/components/common/Footer';
import UserSideMenu from '../../shared/components/common/UserSideMenu';
import styles from '../../shared/components/common/UserSideMenu.module.css';

export default function UserMyPageLayout() {
  return (
    // <div className={styles.wrapper}>
    <div>
      {/* 상단 헤더 */}
      {/* <Header /> */}

      {/* 본문 영역 <main className={styles.main}> */}
      <div className={styles.container}>
      {/* 공용 사이드바 */}
      <UserSideMenu />

      {/* 본문 */}
      <Outlet />
      </div>

      {/* 하단 푸터 */}
      {/* <Footer /> */}
    </div>
  );
}
