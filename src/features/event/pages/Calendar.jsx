import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AiChatWidget from '../../../shared/components/ai/AiChatWidget';

import { backendUrl } from '../../../app/http/axiosInstance';

// ─────────────────────────────────────────────────────────────
// 아이콘 — Home.jsx 완전 동일
// ─────────────────────────────────────────────────────────────
function NavIcon({ children }) {
  return (
    <span style={{ width: 24, height: 24, display: 'grid', placeItems: 'center' }} aria-hidden="true">
      {children}
    </span>
  );
}
function RightIcon({ children }) {
  return (
    <span style={{ width: 18, height: 18, display: 'grid', placeItems: 'center' }} aria-hidden="true">
      {children}
    </span>
  );
}
function MapIcon() {
  return (
    <NavIcon>
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <path d="M9 5 3.5 7.2v11.1L9 16.1l6 2.3 5.5-2.2V5.1L15 7.4 9 5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 5v11.1" stroke="currentColor" strokeWidth="1.6" />
        <path d="M15 7.4v11" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </NavIcon>
  );
}
function CalendarNavIcon() {
  return (
    <NavIcon>
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <path d="M7 3v3M17 3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4.5 7.2h15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6 5.5h12a2 2 0 0 1 2 2v12.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M8 11h3M13 11h3M8 14.5h3M13 14.5h3M8 18h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </NavIcon>
  );
}
function BoardIcon() {
  return (
    <NavIcon>
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <path d="M4 20V10.2c0-.6.3-1.2.9-1.5l6.2-3.5c.6-.3 1.2-.3 1.8 0l6.2 3.5c.6.3.9.9.9 1.5V20" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M4 20h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </NavIcon>
  );
}
function UserIcon() {
  return (
    <RightIcon>
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4.5 20.2a7.6 7.6 0 0 1 15 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </RightIcon>
  );
}
function LoginIcon() {
  return (
    <RightIcon>
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path d="M10 7V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-1" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M3 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M9 8l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </RightIcon>
  );
}
function BellIcon() {
  return (
    <RightIcon>
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </RightIcon>
  );
}

// ─────────────────────────────────────────────────────────────
// 지역 목록 — null id = 전체
// ─────────────────────────────────────────────────────────────
const ALL_REGION = { name: '전체', id: null };

const REGIONS = [
  { name: '서울', id: 1100000000 },
  { name: '인천', id: 2800000000 },
  { name: '경기', id: 4100000000 },
  { name: '강원', id: 5100000000 },
  { name: '세종', id: 3611000000 },
  { name: '대전', id: 3000000000 },
  { name: '충북', id: 4300000000 },
  { name: '충남', id: 4400000000 },
  { name: '광주', id: 2900000000 },
  { name: '전북', id: 5200000000 },
  { name: '전남', id: 4600000000 },
  { name: '대구', id: 2700000000 },
  { name: '부산', id: 2600000000 },
  { name: '울산', id: 3100000000 },
  { name: '경북', id: 4700000000 },
  { name: '경남', id: 4800000000 },
  { name: '제주', id: 5000000000 },
];

const REGION_CHIPS = [ALL_REGION, ...REGIONS]; // 전체 포함 칩 목록

const WEEKDAYS  = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_KOR = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const TODAY     = new Date();
const THIS_YEAR = TODAY.getFullYear();
const YEARS     = Array.from({ length: 11 }, (_, i) => THIS_YEAR - 5 + i);

// 드롭다운 화살표
const arrowUrl = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`;

const selectStyle = {
  appearance: 'none', WebkitAppearance: 'none',
  fontSize: '14px', fontWeight: 800, color: '#374151',
  padding: '7px 28px 7px 12px',
  borderRadius: '12px',
  border: '2px solid #E5E7EB',
  background: '#fff',
  backgroundImage: arrowUrl,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 8px center',
  backgroundSize: '14px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  cursor: 'pointer',
  outline: 'none',
};

// ─────────────────────────────────────────────────────────────
// API 헬퍼
// ─────────────────────────────────────────────────────────────

/**
 * 단일 지역 calendar-counts 호출
 * 응답: List<{ date: "YYYY-MM-DD", count: number }>
 */
async function fetchCountsByRegion(regionId) {
  const res  = await fetch(`${backendUrl}/api/events/calendar-counts?regionId=${regionId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // [{ date, count }, ...]
}

/**
 * countMap 생성 헬퍼
 * items: [{ date: "YYYY-MM-DD", count: N }, ...]
 * → { "YYYY-MM-DD": totalCount, ... }
 */
function buildCountMap(items) {
  const map = {};
  (items || []).forEach(item => {
    // date 는 LocalDate → Jackson 직렬화 시 "YYYY-MM-DD" 문자열로 옴
    const key = typeof item.date === 'string'
      ? item.date
      : String(item.date); // 혹시 배열 형태일 경우 대비
    map[key] = (map[key] || 0) + Number(item.count);
  });
  return map;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export default function Calendar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  /* 로그인 */
  const [loggedIn, setLoggedIn] = useState(() =>
    typeof window !== 'undefined' ? Boolean(localStorage.getItem('accessToken')) : false
  );
  const onLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setLoggedIn(false);
    navigate('/');
  };

  /* 달력 상태 */
  const [selectedRegion, setSelectedRegion] = useState(ALL_REGION); // 기본값: 전체
  const [year,  setYear]  = useState(THIS_YEAR);
  const [month, setMonth] = useState(TODAY.getMonth());
  const [countMap, setCountMap] = useState({});
  const [loading,  setLoading]  = useState(false);

  /* ── 지역 변경 시 API 호출 ── */
  const loadCounts = useCallback(async (region) => {
    setLoading(true);
    setCountMap({});
    try {
      if (region.id === null) {
        // 전체: 17개 지역 병렬 호출 후 날짜별 합산
        const results = await Promise.all(
          REGIONS.map(r => fetchCountsByRegion(r.id).catch(() => []))
        );
        const merged = {};
        results.forEach(items => {
          const m = buildCountMap(items);
          Object.entries(m).forEach(([date, cnt]) => {
            merged[date] = (merged[date] || 0) + cnt;
          });
        });
        setCountMap(merged);
      } else {
        // 단일 지역
        const items = await fetchCountsByRegion(region.id);
        setCountMap(buildCountMap(items));
      }
    } catch (e) {
      console.error('calendar-counts 로딩 실패', e);
      setCountMap({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCounts(selectedRegion); }, [selectedRegion, loadCounts]);

  /* 달력 셀 계산 */
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => { if (month === 0) { setYear(y => y-1); setMonth(11); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y+1); setMonth(0);  } else setMonth(m => m+1); };

  const getDateStr = (day) =>
    day ? `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}` : null;

  /* 날짜 클릭 → 지역 + 날짜 필터로 게시판 이동 */
  const handleDayClick = (day) => {
    if (!day) return;
    const ds = getDateStr(day);
    if (!countMap[ds]) return;
    // 전체 선택 시 regionId 파라미터 없이 날짜만 필터
    const regionParam = selectedRegion.id !== null ? `&regionId=${selectedRegion.id}` : '';
    navigate(`/events?filterStart=${ds}&filterEnd=${ds}${regionParam}`);
  };

  const isToday = (day) =>
    day && year === TODAY.getFullYear() && month === TODAY.getMonth() && day === TODAY.getDate();

  // ─────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes calFadeIn {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .cal-page {
          position: relative;
          min-height: 100vh;
          overflow: visible;
        }
        .cal-bg {
          position: absolute;
          inset: 0;
          z-index: -20;
          overflow: hidden;
          pointer-events: none;
        }
        .cal-bg-img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: 50% 35%;
          display: block;
        }
        /* Home.module.css .bgOverlay 완전 동일 */
        .cal-bg-overlay {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(900px 520px at 50% 18%,
              rgba(255,255,255,0.90) 0%,
              rgba(255,255,255,0.50) 55%,
              rgba(255,255,255,0.08) 100%
            ),
            rgba(255,255,255,0.06);
          pointer-events: none;
        }
        /* Home.module.css .nav 완전 동일 */
        .cal-nav {
          position: absolute;
          top: 0; left: 0; right: 0;
          z-index: 100;
          pointer-events: none;
        }
        /* Home.module.css .navInner 완전 동일 */
        .cal-nav-inner {
          width: 100%;
          box-sizing: border-box;
          padding: 18px 28px 10px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          pointer-events: auto;
        }
        .cal-nav-left {
          display: flex;
          align-items: flex-start;
          gap: 28px;
        }
        /* active 강조 없이 완전 동일 스타일 */
        .cal-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          color: #0f0f0f;
          opacity: 0.92;
          user-select: none;
        }
        .cal-nav-item:hover { opacity: 1; }
        .cal-nav-label {
          font-size: 12px;
          line-height: 1;
          letter-spacing: -0.2px;
        }
        .cal-nav-right {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-top: 2px;
          white-space: nowrap;
        }
        .cal-auth-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #0f0f0f;
          text-decoration: none;
          font-size: 13px;
          opacity: 0.92;
          cursor: pointer;
        }
        .cal-auth-link:hover { opacity: 1; }

        /* 달력 내부 */
        .cal-card { animation: calFadeIn 0.42s ease-out; }
        .cal-day  { transition: background 0.12s, transform 0.12s; }
        .cal-day.has-event:hover {
          background: #FFFBEB !important;
          transform: scale(1.03);
          z-index: 1;
          position: relative;
        }
        .region-chip { transition: all 0.18s ease; cursor: pointer; }
        .region-chip:hover { transform: translateY(-2px); }
        .nav-arrow { transition: background 0.13s; }
        .nav-arrow:hover { background: #F3F4F6 !important; }
        .cal-select:hover { border-color: #CBD5E1 !important; }
        .cal-select:focus { border-color: #FFD700 !important; outline: none; }
      `}</style>

      <div className="cal-page">

        {/* 배경 */}
        <div className="cal-bg">
          <img src="/images/print.png" alt="배경" className="cal-bg-img" />
          <div className="cal-bg-overlay" />
        </div>

        {/* 네비 */}
        <header className="cal-nav">
          <div className="cal-nav-inner">
            <nav className="cal-nav-left">
              {[
                { to: '/',         icon: <MapIcon />,         label: '행사 지도' },
                { to: '/calendar', icon: <CalendarNavIcon />, label: '행사 달력' },
                { to: '/events',   icon: <BoardIcon />,       label: '행사 게시판' },
              ].map(({ to, icon, label }) => (
                <Link key={to} to={to} className="cal-nav-item">
                  {icon}
                  <span className="cal-nav-label">{label}</span>
                </Link>
              ))}
            </nav>
            <div className="cal-nav-right">
              {loggedIn ? (
                <>
                  <Link to="/notifications" className="cal-auth-link"><BellIcon />알림</Link>
                  <Link to="/mypage"        className="cal-auth-link"><UserIcon />마이페이지</Link>
                  <a onClick={onLogout}     className="cal-auth-link"><LoginIcon />로그아웃</a>
                </>
              ) : (
                <>
                  <Link to="/api/user/signup" className="cal-auth-link"><UserIcon />회원가입</Link>
                  <Link to="/login"           className="cal-auth-link"><LoginIcon />로그인</Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* 메인 */}
        <main style={{ paddingTop: 88, paddingBottom: 40, position: 'relative', zIndex: 10 }}>
          <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto', padding: '0 24px', boxSizing: 'border-box' }}>

            {/* 지역 선택 */}
            <div style={{
              background: 'rgba(255,255,255,0.92)',
              borderRadius: 20,
              padding: '24px 28px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              marginBottom: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 5, height: 22, background: '#FFD700', borderRadius: 3 }} />
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: '#111' }}>지역 선택</h2>
                <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600 }}>
                  클릭한 지역의 행사를 달력에서 확인하세요
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {REGION_CHIPS.map(region => {
                  const active = selectedRegion.id === region.id;
                  return (
                    <button
                      key={region.id ?? 'all'}
                      className="region-chip"
                      onClick={() => setSelectedRegion(region)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: 25,
                        border: active ? '2px solid #FFD700' : '2px solid #E5E7EB',
                        background: active ? '#FFD700' : '#FFF',
                        color: active ? '#111' : '#6B7280',
                        fontWeight: 800,
                        fontSize: 14,
                        boxShadow: active ? '0 2px 8px rgba(255,215,0,0.3)' : 'none',
                      }}
                    >
                      {region.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 달력 카드 */}
            <div
              className="cal-card"
              key={`${String(selectedRegion.id)}-${year}-${month}`}
              style={{
                background: 'rgba(255,255,255,0.97)',
                borderRadius: 20,
                padding: 32,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}
            >
              {/* 달력 헤더 */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 28, flexWrap: 'wrap', gap: 14,
              }}>
                {/* 왼쪽: 연도 + 월 */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, lineHeight: 1 }}>
                  <span style={{ fontSize: 48, fontWeight: 900, color: '#111' }}>{year}</span>
                  <span style={{ fontSize: 26, fontWeight: 700, color: '#4B72B8', paddingBottom: 5 }}>
                    {MONTH_KOR[month]}
                  </span>
                  {loading && (
                    <span style={{ fontSize: 12, color: '#D97706', fontWeight: 700, paddingBottom: 7 }}>
                      로딩중…
                    </span>
                  )}
                </div>

                {/* 오른쪽: 드롭다운 + 화살표 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select
                    className="cal-select"
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                    style={{ ...selectStyle, minWidth: 88 }}
                  >
                    {YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
                  </select>
                  <select
                    className="cal-select"
                    value={month}
                    onChange={e => setMonth(Number(e.target.value))}
                    style={{ ...selectStyle, minWidth: 74 }}
                  >
                    {MONTH_KOR.map((mk, i) => <option key={i} value={i}>{mk}</option>)}
                  </select>

                  <div style={{ width: 1, height: 26, background: '#E5E7EB', margin: '0 2px' }} />

                  <button className="nav-arrow" onClick={prevMonth} style={{
                    width: 36, height: 36, borderRadius: 10,
                    border: '1px solid #E5E7EB', background: '#fff',
                    fontSize: 17, fontWeight: 900, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#374151',
                  }}>←</button>
                  <button className="nav-arrow" onClick={nextMonth} style={{
                    width: 36, height: 36, borderRadius: 10,
                    border: '1px solid #E5E7EB', background: '#fff',
                    fontSize: 17, fontWeight: 900, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#374151',
                  }}>→</button>
                </div>
              </div>

              {/* 요일 헤더 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
                {WEEKDAYS.map((wd, i) => (
                  <div key={wd} style={{
                    textAlign: 'center', padding: '10px 0',
                    fontSize: 13, fontWeight: 900,
                    color: i === 0 ? '#EF4444' : i === 6 ? '#4B72B8' : '#9CA3AF',
                    background: '#111',
                    borderRadius: i === 0 ? '8px 0 0 8px' : i === 6 ? '0 8px 8px 0' : undefined,
                  }}>{wd}</div>
                ))}
              </div>

              {/* 날짜 셀 */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(7,1fr)',
                border: '1px solid #F3F4F6', borderRadius: 12, overflow: 'hidden',
              }}>
                {cells.map((day, idx) => {
                  const ds        = getDateStr(day);
                  const count     = ds ? (countMap[ds] || 0) : 0;
                  const isSun     = idx % 7 === 0;
                  const isSat     = idx % 7 === 6;
                  const todayCell = isToday(day);
                  const hasEvent  = count > 0;

                  return (
                    <div
                      key={idx}
                      className={`cal-day${hasEvent ? ' has-event' : ''}`}
                      onClick={() => handleDayClick(day)}
                      style={{
                        minHeight: 90, padding: 10,
                        borderRight:  (idx+1) % 7 === 0 ? 'none' : '1px solid #F3F4F6',
                        borderBottom: idx >= cells.length - 7 ? 'none' : '1px solid #F3F4F6',
                        background:  todayCell ? '#FFFBEB' : '#FFF',
                        cursor:      hasEvent ? 'pointer' : 'default',
                        position:    'relative',
                      }}
                    >
                      {day && (
                        <>
                          {/* 날짜 숫자 */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{
                              fontSize: 15,
                              fontWeight: todayCell ? 900 : 700,
                              color: todayCell ? '#D97706'
                                   : isSun ? '#EF4444'
                                   : isSat ? '#4B72B8'
                                   : '#374151',
                            }}>{day}</span>
                            {todayCell && (
                              <span style={{
                                fontSize: 10, background: '#FFD700', color: '#111',
                                padding: '1px 5px', borderRadius: 6, fontWeight: 900,
                              }}>오늘</span>
                            )}
                          </div>

                          {/* 행사 개수 뱃지 */}
                          {hasEvent && (
                            <div style={{
                              marginTop: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: 22,
                              height: 22,
                              padding: '0 7px',
                              borderRadius: 11,
                              background: '#FFD700',
                              fontSize: 11,
                              fontWeight: 900,
                              color: '#111',
                              boxShadow: '0 1px 4px rgba(255,215,0,0.45)',
                            }}>
                              {count}건
                            </div>
                          )}

                          {/* 하단 강조 바 */}
                          {hasEvent && (
                            <div style={{
                              position: 'absolute', bottom: 6, left: 10, right: 10,
                              height: 3, borderRadius: 2,
                              background: '#FFD700', opacity: 0.55,
                            }} />
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 범례 */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 20,
                marginTop: 20, paddingTop: 16, borderTop: '1px solid #F3F4F6',
                flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 24, height: 3, background: '#FFD700', borderRadius: 2 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#6B7280' }}>
                    행사 있는 날 (날짜 클릭 시 게시판으로 이동)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: 22, height: 22, padding: '0 7px', borderRadius: 11,
                    background: '#FFD700', fontSize: 11, fontWeight: 900, color: '#111',
                  }}>N건</div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#6B7280' }}>해당 날짜 행사 수</span>
                </div>
              </div>
            </div>
          </div>
        </main>
        <AiChatWidget pageType="calendar" />
</div>
    </>
  );
}