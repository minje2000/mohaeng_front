import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './UserInfoMypage.module.css';
import UserSideMenu from '../../../shared/components/common/UserSideMenu'; // ✅ 추가

export function UserInfoIndex() {
  return (
    <main className={styles.content}>
      <h2>개인 정보 관리</h2>
      <div className={styles.profileBox}>
        <div className={styles.bigProfile}></div>

        <div className={styles.info}>
          <p>
            <strong>이메일</strong> user1@gmail.com
          </p>
          <p>
            <strong>이름</strong> 홍길동
          </p>
          <p>
            <strong>전화번호</strong> 010-1234-5678
          </p>
        </div>

        <div className={styles.buttons}>
          <button className={styles.primary}>개인 정보 수정</button>
          <button className={styles.secondary}>회원 탈퇴</button>
        </div>
      </div>
    </main>
  );
}

export default function UserInfoMypage() {
  return (
    <div className={styles.container}>
      {/* ✅ 공용 사이드바 */}
      <UserSideMenu />

      {/* ✅ 본문 */}
      <Outlet />
    </div>
  );
}
