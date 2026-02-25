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

// import NoticeList from '../../features/notice/pages/NoticeList';
// import NoticeDetail from '../../features/notice/pages/NoticeDetail';
// import NoticeWrite from '../../features/notice/pages/NoticeWrite';
// import NoticeUpdate from '../../features/notice/pages/NoticeUpdate';

// import BoardList from '../../features/board/pages/BoardList';
// import BoardWrite from '../../features/board/pages/BoardWrite';
// import BoardDetail from '../../features/board/pages/BoardDetail';
// import BoardUpdate from '../../features/board/pages/BoardUpdate';

// import MemberList from '../../features/member/pages/MemberList';
// import MemberInfo from '../../features/member/pages/MemberInfo';

import ReviewMyPage from '../../features/event/review/pages/ReviewMyPage';
import ReviewEventDetail from '../../features/event/review/pages/ReviewEventDetail';
import EventDetailLayout from '../../features/event/review/pages/EventDetailLayout';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      
      

      // { path: '/notices', element: <NoticeList /> },
      // { path: '/notices/:noticeNo', element: <NoticeDetail /> },

      // { path: '/boards', element: <BoardList /> },
      // { path: '/boards/:boardNum', element: <BoardDetail /> },

      // // 로그인 필요
      // {
      //   element: <RequireAuth />,
      //   children: [
      //     { path: '/boards/new', element: <BoardWrite /> },
      //     { path: '/boards/:boardNum/edit', element: <BoardUpdate /> },
      //     { path: '/mypage', element: <MemberInfo /> },
      //   ],
      // },

      // // 관리자만
      // {
      //   element: <RequireRole allowedRoles={[ROLES.ADMIN]} />,
      //   children: [
      //     { path: '/admin/members', element: <MemberList /> },
      //     { path: '/notices/new', element: <NoticeWrite /> },
      //     { path: '/notices/:noticeNo/edit', element: <NoticeUpdate /> },
      //   ],
      // },

       //  (추가) 마이페이지 - 내 리뷰 목록
      { path: '/mypage/reviews', element: <ReviewMyPage /> },

      //  (추가) 행사 상세 - 리뷰 탭(중첩 라우팅)
      {
  path: '/events/:eventId',
  element: <EventDetailLayout />,
  children: [
    { index: true, element: <EventDetail /> },  
  ],
},
    ],
  },
  // 레이아웃 없이 페이지만 단독으로 불러옴
  // 메인 홈화면
  { path: '/', element: <Home /> },
  // 게시판 화면
  { path: '/events', element: <EventList />},
  // 달력 화면
  { path: '/Calendar', element: <Calendar />},
  // 로그인
  { path: '/login', element: <Login /> },
  // 회원가입
  { path: '/api/user/signup', element: <Signup /> },
  // 아이디 찾기
  { path: '/api/user/findEmail', element: <FindEmail /> },
  // 비밀번호 찾기
  { path: '/api/user/findPwd', element: <FindPwd /> },
  // 구글 계정 연동 로그인 후 리다이렉트 페이지
  {path: '/oauthSuccess', element: <OAuthSuccess />}
]);
