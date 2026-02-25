// src/app/router/routes.jsx
// src/app/router/routes.jsx
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import RequireAuth from './guards/RequireAuth';
import RequireRole from './guards/RequireRole';
import { ROLES } from '../../shared/constants/roles';

import Login from '../../features/auth/pages/Login';
import Signup from '../../features/user/pages/SignUp';
import OAuthSuccess from '../../features/auth/pages/OAuthSuccess';
import FindEmail from '../../features/user/pages/FindEmail';
import FindPwd from '../../features/user/pages/FindPwd';
import Home from '../../shared/pages/Home';
import EventList from '../../features/event/pages/EventList';
import Calendar from '../../features/event/pages/Calendar';
import EventDetail from '../../features/event/pages/EventDetail';

import ReviewMyPage from '../../features/event/review/pages/ReviewMyPage';
import EventDetailLayout from '../../features/event/review/pages/EventDetailLayout';
import InquiryListMypage from '../../features/event/inquiry/pages/InquiryListMypage';

// 같은 파일에서 default + named export 둘 다 가져오기
import UserInfoMypage, {
  UserInfoIndex,
} from '../../features/user/pages/UserInfoMypage';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        element: <RequireAuth />,
        children: [
          // 유저만 마이페이지 접근
          {
            element: <RequireRole allowedRoles={[ROLES.USER]} />,
            children: [
              {
                path: '/mypage',
                element: <UserInfoMypage />, // 사이드바 + Outlet
                children: [
                  { index: true, element: <UserInfoIndex /> }, // 기본은 내정보
                  { path: 'inquiries', element: <InquiryListMypage /> },
                  { path: 'reviews', element: <ReviewMyPage /> },
                ],
              },
            ],
          },

          // 관리자 마이페이지(원하면 여기 확장)
          {
            element: <RequireRole allowedRoles={[ROLES.ADMIN]} />,
            children: [
              {
                path: '/admin/mypage',
                element: <div style={{ padding: 24 }}>관리자 마이페이지</div>,
              },
            ],
          },
        ],
      },

      // 행사 상세
      {
        path: '/events/:eventId',
        element: <EventDetailLayout />,
        children: [{ index: true, element: <EventDetail /> }],
      },
    ],
  },

  // 홈화면
  { path: '/', element: <Home /> },
  // 행사 게시판
  { path: '/events', element: <EventList /> },
  // 행사 달력
  { path: '/Calendar', element: <Calendar /> },
  // 로그인
  { path: '/login', element: <Login /> },
  // 회원가입
  { path: '/api/user/signup', element: <Signup /> },
  // 아이디 찾기
  { path: '/api/user/findEmail', element: <FindEmail /> },
  // 비밀번호 찾기
  { path: '/api/user/findPwd', element: <FindPwd /> },
  // 구글 계정 연동 로그인 후 리다이렉트 페이지
  { path: '/oauthSuccess', element: <OAuthSuccess /> },
]);
