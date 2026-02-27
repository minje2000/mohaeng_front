// src/app/router/routes.jsx
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import UserInfoMypage, { UserInfoIndex } from '../../features/user/pages/UserInfoMypage';
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
import ParticipationApply from '../../features/event/participation/pages/ParticipationApply';

import ReviewMyPage from '../../features/event/review/pages/ReviewMyPage';
import WishMyPage from '../../features/event/wishlist/pages/WishMyPage';
import EventDetailLayout from '../../features/event/review/pages/EventDetailLayout';
import InquiryListMypage from '../../features/event/inquiry/pages/InquiryListMypage';
import ParticipationMypage from '../../features/event/participation/pages/ParticipationMypage';
import EventHostMypage from '../../features/event/host/pages/EventHostMypage';
import BoothMypage from '../../features/event/participation/pages/BoothMypage';

import PaymentSuccess from '../../features/payment/pages/PaymentSuccess';
import PaymentFail from '../../features/payment/pages/PaymentFail';

import AdminMypage from '../layouts/AdminMypage';
import EventStats from '../../features/admin/eventstats/pages/EventStats';
import UserStats from '../../features/admin/userstats/pages/UserStats';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        element: <RequireAuth />,
        children: [
          // 유저 마이페이지
          {
            element: <RequireRole allowedRoles={[ROLES.USER]} />,
            children: [
              {
                path: '/mypage',
                element: <UserInfoMypage />,
                children: [
                  { index: true, element: <UserInfoIndex /> },
                  { path: 'events/created',      element: <EventHostMypage /> },
                  { path: 'events/participated',  element: <ParticipationMypage /> },
                  { path: 'booths',              element: <BoothMypage /> },
                  { path: 'inquiries',           element: <InquiryListMypage /> },
                  { path: 'reviews',             element: <ReviewMyPage /> },
                  { path: 'wishlist',            element: <WishMyPage /> },
                ],
              },
            ],
          },

          // 관리자 마이페이지
          {
            element: <RequireRole allowedRoles={[ROLES.ADMIN]} />,
            children: [
              {
                path: '/admin',
                element: <AdminMypage />,
                children: [
                  { path: 'events',   element: <div style={{ padding: 24 }}>행사 전체 관리</div> },
                  { path: 'reports',  element: <div style={{ padding: 24 }}>행사 신고 관리</div> },
                  { path: 'stats', element: <UserStats /> },
                  { path: 'analysis', element: <EventStats /> },
                ],
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

  { path: '/',               element: <Home /> },
  { path: '/events',         element: <EventList /> },
  { path: '/Calendar',       element: <Calendar /> },
  { path: '/events/new',     element: <EventHost /> },
  { path: '/events/:eventId/booth-apply', element: <ParticipationBoothApply /> },
  { path: '/events/:eventId/apply',       element: <ParticipationApply /> },

  { path: '/payment/success', element: <PaymentSuccess /> },
  { path: '/payment/fail',    element: <PaymentFail /> },

  { path: '/login',              element: <Login /> },
  { path: '/api/user/signup',    element: <Signup /> },
  { path: '/api/user/findEmail', element: <FindEmail /> },
  { path: '/api/user/findPwd',   element: <FindPwd /> },
  { path: '/oauthSuccess',       element: <OAuthSuccess /> },
]);
