import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './shared/pages/Home';
import EventList from './features/event/pages/EventList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. 첫 화면: 지도 */}
        <Route path="/" element={<Home />} />

        {/* 2. 게시판 화면: 주소를 /events 로 통일합니다. */}
        <Route path="/events" element={<EventList />} />
        
        {/* 상세페이지 경로는 나중에 여기에 추가하세요 */}
        {/* <Route path="/events/:eventId" element={<EventDetail />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
export default App;