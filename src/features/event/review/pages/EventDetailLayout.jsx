import React from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import "../styles/review-ui.css"; // 리뷰 탭바 스타일(원치 않으면 삭제 가능)

export default function EventDetailLayout() {
  const { eventId } = useParams();

  return (
    <div style={{ padding: 16 }}>
      {/* 설계도 느낌 탭바 (리뷰만 링크) */}
      <div className="mh-tabBar">
        <span className="mh-tabLink disabled">상세정보</span>
        <span className="mh-tabLink disabled">지도</span>

        <NavLink
          to={`/events/${eventId}/reviews`}
          className={({ isActive }) => `mh-tabLink ${isActive ? 'active' : ''}`}
        >
          리뷰
        </NavLink>

        <span className="mh-tabLink disabled">문의</span>
      </div>

      {/* ✅ 중첩 라우트(= reviews)가 여기 표시됨 */}
      <Outlet />
    </div>
  );
}