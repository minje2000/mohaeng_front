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
import EventHost from '../../features/event/host/pages/EventHost';
import ParticipationBoothApply from '../../features/event/participation/pages/ParticipationBoothApply';

import ReviewMyPage from '../../features/event/review/pages/ReviewMyPage';
import ReviewEventDetail from '../../features/event/review/pages/ReviewEventDetail';

import EventDetailLayout from '../../features/event/review/pages/EventDetailLayout';
import InquiryListMypage from '../../features/event/inquiry/pages/InquiryListMypage';

import PaymentSuccess from '../../features/payment/pages/PaymentSuccess';
import PaymentFail from '../../features/payment/pages/PaymentFail';

// ✅ 같은 파일에서 default + named export 둘 다 가져오기
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
          // ✅ 유저만 마이페이지 접근
          {
            element: <RequireRole allowedRoles={[ROLES.USER]} />,
            children: [
              {
                path: '/mypage',
                element: <UserInfoMypage />, // ✅ 사이드바 + Outlet
                children: [
                  { index: true, element: <UserInfoIndex /> }, // ✅ 기본은 내정보
                  { path: 'inquiries', element: <InquiryListMypage /> },
                  { path: 'reviews', element: <ReviewMyPage /> },
                ],
              },
            ],
          },

          // ✅ 관리자 마이페이지(원하면 여기 확장)
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

      // ✅ 행사 상세
      {
        path: '/events/:eventId',
        element: <EventDetailLayout />,
        children: [{ index: true, element: <EventDetail /> }],
      },
    ],
  },

  {
  path: '/events/:eventId',
  element: <EventDetailLayout />,
  children: [
    { index: true, element: <EventDetail /> },
    { path: 'reviews', element: <ReviewEventDetail /> },
  ],
},

  { path: '/', element: <Home /> },
  { path: '/events', element: <EventList /> },
  { path: '/Calendar', element: <Calendar /> },
  { path: '/events/new', element: <EventHost /> },
  { path: '/events/:eventId/booth-apply', element: <ParticipationBoothApply /> },

  { path: '/payment/success', element: <PaymentSuccess /> },
  { path: '/payment/fail', element: <PaymentFail /> },

  { path: '/login', element: <Login /> },
  { path: '/api/user/signup', element: <Signup /> },
  { path: '/api/user/findEmail', element: <FindEmail /> },
  { path: '/api/user/findPwd', element: <FindPwd /> },
  { path: '/oauthSuccess', element: <OAuthSuccess /> },

  
]);
