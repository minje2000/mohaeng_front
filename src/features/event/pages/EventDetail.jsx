import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchEventDetail } from '../api/EventDetailAPI';
import { apiJson } from '../../../app/http/request';
import EventReviewTab from '../review/components/EventReviewTab';
import InquiryEventDetail from '../inquiry/pages/InquiryEventDetail';
import useWishlistSyncOnEventDetail from '../wishlist/hooks/useWishlistSyncOnEventDetail';
import ReportButton from "../report/components/ReportButton";
import ReportModal from "../report/components/ReportModal";
import KakaoMap from '../../../shared/components/common/KakaoMap';
import ShareModal from '../../../shared/components/Modal/ShareModal';
import { eventImageUrl, photoImageUrl } from '../../../shared/utils/uploadFileUrl';

const TOPIC_MAP = {
  1:'IT', 2:'비즈니스/창업', 3:'마케팅/브랜딩', 4:'디자인/아트',
  5:'재테크/투자', 6:'취업/이직', 7:'자기계발', 8:'인문/사회/과학',
  9:'환경/ESG', 10:'건강/스포츠', 11:'요리/베이킹', 12:'음료/주류',
  13:'여행/아웃도어', 14:'인테리어/리빙', 15:'패션/뷰티', 16:'반려동물',
  17:'음악/공연', 18:'영화/만화/게임', 19:'사진/영상제작', 20:'핸드메이드/공예',
  21:'육아/교육', 22:'심리/명상', 23:'연애/결혼', 24:'종교', 25:'기타',
};

const HASHTAG_MAP = {
  1:'즐거운', 2:'평온한', 3:'열정적인', 4:'디지털디톡스',
  5:'창의적인', 6:'영감을주는', 7:'활기찬', 8:'편안한',
  9:'트렌디한', 10:'전문적인', 11:'교육적인', 12:'감성적인',
  13:'도전적인', 14:'따뜻한', 15:'유익한', 16:'색다른',
  17:'미니멀한', 18:'역동적인', 19:'신선한', 20:'친근한',
  21:'화려한', 22:'조용한', 23:'성장하는', 24:'함께하는',
  25:'지속가능한', 26:'흥미진진한', 27:'진지한', 28:'자유로운',
  29:'집중하는', 30:'친환경적인',
};

const fmt = (d) => {
  if (!d) return '-';
  const dt = new Date(d);
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, '0')}.${String(dt.getDate()).padStart(2, '0')}`;
};

const diffDays = (target) => {
  if (!target) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = new Date(target);
  t.setHours(0, 0, 0, 0);
  return Math.ceil((t - today) / (1000 * 60 * 60 * 24));
};

const getDatesInRange = (startDate, endDate) => {
  if (!startDate || !endDate) return [];
  const dates = [];
  let curr = new Date(startDate);
  const end = new Date(endDate);
  while (curr <= end) {
    dates.push(curr.toISOString().split('T')[0]);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

const PLACEHOLDER = 'https://dummyimage.com/400x300/f3f4f6/666666.png&text=Mohaeng';
const imgUrl = (path) => eventImageUrl(path, PLACEHOLDER);

const getStatusUI = (ev) => {
  if (!ev) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = (s) => {
    if (!s) return null;
    const dt = new Date(s);
    dt.setHours(0, 0, 0, 0);
    return dt;
  };
  const startDate = d(ev.startDate), endDate = d(ev.endDate);
  const startR = d(ev.startRecruit), endR = d(ev.endRecruit);
  const boothStart = d(ev.boothStartRecruit), boothEnd = d(ev.boothEndRecruit);

  if (endDate && today > endDate)
    return { key: '종료', label: '행사 종료', color: '#6B7280', bg: '#F3F4F6',
      btnLabel: '행사 종료', btnActive: false, btnColor: '#E5E7EB', btnTextColor: '#9CA3AF', btnTo: null };

  if (startDate && endDate && today >= startDate && today <= endDate)
    return { key: '진행중', label: '행사 진행 중', color: '#F97316', bg: '#FFF7ED',
      btnLabel: '현재 행사 중', btnActive: false, btnColor: '#FFEDD5', btnTextColor: '#F97316', btnTo: null };

  if (endR && today > endR) {
    const diff = diffDays(ev.startDate);
    return { key: '모집마감', label: '행사 참여 모집 마감', color: '#6B7280', bg: '#F3F4F6',
      btnLabel: diff > 0 ? `행사 시작 D-${diff}` : '행사 시작 임박',
      btnActive: false, btnColor: '#E5E7EB', btnTextColor: '#9CA3AF', btnTo: null };
  }

  if (startR && endR && today >= startR && today <= endR)
    return { key: '참여모집중', label: '행사 참여자 모집 중', color: '#F97316', bg: '#FFF7ED',
      btnLabel: '행사 참여 신청하기', btnActive: true, btnColor: '#F97316', btnTextColor: '#fff',
      btnTo: `/events/${ev.eventId}/apply` };

  if (boothEnd && today > boothEnd) {
    const diff = diffDays(ev.startRecruit);
    return { key: '부스마감', label: '부스 모집 마감', color: '#6B7280', bg: '#F3F4F6',
      btnLabel: diff > 0 ? `참여 신청 D-${diff}` : '참여 신청 예정',
      btnActive: false, btnColor: '#E5E7EB', btnTextColor: '#9CA3AF', btnTo: null };
  }

  if (boothStart && boothEnd && today >= boothStart && today <= boothEnd)
    return { key: '부스모집중', label: '부스 모집 중', color: '#8B5CF6', bg: '#F5F3FF',
      btnLabel: '부스 사용 신청하기', btnActive: true, btnColor: '#8B5CF6', btnTextColor: '#fff',
      btnTo: `/events/${ev.eventId}/booth-apply` };

  const diff = diffDays(ev.boothStartRecruit || ev.startRecruit || ev.startDate);
  return { key: '예정', label: '행사 예정', color: '#3B82F6', bg: '#EFF6FF',
    btnLabel: diff > 0 ? `행사 예정 D-${diff}` : '행사 예정',
    btnActive: false, btnColor: '#DBEAFE', btnTextColor: '#3B82F6', btnTo: null };
};

const shouldShowBooth = (key) => key === '예정' || key === '부스모집중';
const TABS = ['상세정보', '지도', '리뷰', '문의'];

const HeartIcon = ({ filled }) => (
  <svg width="17" height="17" viewBox="0 0 24 24"
    fill={filled ? '#EF4444' : 'none'} stroke={filled ? '#EF4444' : 'currentColor'}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const ShareIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const SirenIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v2" /><path d="M4.93 4.93l1.41 1.41" /><path d="M19.07 4.93l-1.41 1.41" />
    <path d="M6 13v-2a6 6 0 0 1 12 0v2" /><rect x="4" y="13" width="16" height="4" rx="1" />
    <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
  </svg>
);

// ══════════════════════════════════════════════════════════════
// 🗺️ AI 여행 코스 추천 컴포넌트
// ══════════════════════════════════════════════════════════════
// 숙소·조식 제외 카테고리만
const CATEGORY_STYLE = {
  축제: { bg: '#FFFBEB', color: '#B45309', dot: 'linear-gradient(135deg,#FDE68A,#F59E0B)', icon: '🎪' },
  맛집: { bg: '#FEE2E2', color: '#DC2626', dot: 'linear-gradient(135deg,#FCA5A5,#EF4444)', icon: '🍽️' },
  카페: { bg: '#ECFDF5', color: '#059669', dot: 'linear-gradient(135deg,#6EE7B7,#059669)', icon: '☕' },
  관광: { bg: '#FEF9C3', color: '#A16207', dot: 'linear-gradient(135deg,#FEF08A,#EAB308)', icon: '🗺️' },
};
// 숙소·조식은 렌더링에서 제외
const EXCLUDED_CATEGORIES = ['숙소', '조식'];

function AiCourseSection({ ev }) {
  const [open,      setOpen]      = useState(false);
  const [companion, setCompanion] = useState('연인'); // 연인 | 가족 | 혼자
  const [transport, setTransport] = useState('자가용');
  const [loading,   setLoading]   = useState(false);
  const [course,    setCourse]    = useState(null);
  const [error,     setError]     = useState('');

  // 행사 시간 파싱
  const festivalTime = ev?.startTime
    ? `${ev.startTime}${ev.endTime ? ` ~ ${ev.endTime}` : ''}`
    : null;

  const handleGenerate = useCallback(async () => {
    if (!ev?.lotNumberAdr && !ev?.detailAdr) {
      setError('행사 주소 정보가 없어 코스를 생성할 수 없어요.');
      return;
    }
    setLoading(true);
    setError('');
    setCourse(null);

    try {
      const coords = await new Promise((resolve, reject) => {
        if (!window.kakao?.maps) return reject(new Error('카카오맵 SDK를 찾을 수 없어요.'));
        window.kakao.maps.load(() => {
          const geocoder = new window.kakao.maps.services.Geocoder();
          geocoder.addressSearch(ev.lotNumberAdr || ev.detailAdr, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              resolve({ lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) });
            } else {
              reject(new Error('주소를 좌표로 변환하지 못했어요.'));
            }
          });
        });
      });

      const res = await fetch('http://localhost:8080/api/ai/nearby/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          festival_name: ev.title,
          latitude:      coords.lat,
          longitude:     coords.lng,
          trip_type:     '당일치기',
          companion,
          transport,
          festival_start_time: ev.startTime || null,
          festival_end_time:   ev.endTime   || null,
          festival_date:       ev.startDate || null,  // ex) "2025-04-15"
        }),
      });
      if (!res.ok) throw new Error('코스 생성에 실패했어요. 잠시 후 다시 시도해주세요.');
      const data = await res.json();
      setCourse(data);
    } catch (e) {
      setError(e.message || '코스 생성 중 오류가 발생했어요.');
    } finally {
      setLoading(false);
    }
  }, [ev, companion, transport]);

  const handleReset = () => { setCourse(null); setError(''); };

  // 카카오맵 검색 URL 생성
  const getKakaoUrl = (item) => {
    if (item.kakao_url) return item.kakao_url;
    if (item.place_name) return `https://map.kakao.com/link/search/${encodeURIComponent(item.place_name)}`;
    return null;
  };

  // 숙소·조식 제외 필터
  const filteredCourse = course?.course?.filter(
    item => !EXCLUDED_CATEGORIES.includes(item.category)
  ) ?? [];

  // 노란 개나리 테마 색상
  const YELLOW = '#EAB308';
  const YELLOW_DARK = '#A16207';
  const YELLOW_BG = '#FFFBEB';
  const YELLOW_BORDER = '#FDE68A';

  return (
    <div style={{ borderTop: '1px solid #F3F4F6', padding: '20px 26px' }}>

      {/* ── 배너 버튼 ── */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderRadius: 16, cursor: 'pointer', gap: 12,
          background: 'linear-gradient(135deg, #F59E0B 0%, #EAB308 60%, #CA8A04 100%)',
          boxShadow: '0 4px 20px rgba(234,179,8,0.4)',
          transition: 'transform 0.18s, box-shadow 0.18s',
        }}
        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(234,179,8,0.55)'; }}
        onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(234,179,8,0.4)'; }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            AI Travel Planner
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.15)', letterSpacing: '-0.01em' }}>
            AI 맞춤 여행 코스 추천
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 500, lineHeight: 1.5 }}>
            주변 맛집 · 카페를 조합한 당일치기 일정을 자동 생성해요
          </div>
        </div>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color: '#fff', fontWeight: 900, flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s',
        }}>▼</div>
      </div>

      {/* ── 패널 ── */}
      {open && (
        <div style={{
          marginTop: 14, borderRadius: 16,
          border: `1.5px solid ${YELLOW_BORDER}`,
          background: YELLOW_BG, overflow: 'hidden',
        }}>

          {/* 옵션 + 생성 버튼 */}
          {!course && !loading && (
            <>
              {/* 행사 시간 안내 */}
              {festivalTime && (
                <div style={{
                  margin: '14px 18px 0', padding: '9px 12px',
                  background: '#FEF3C7', borderRadius: 10, border: `1px solid ${YELLOW_BORDER}`,
                  fontSize: 12, color: YELLOW_DARK, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  🕐 행사 시간 <strong>{festivalTime}</strong> 을 반영해서 코스를 짜드려요
                </div>
              )}

              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 10, padding: '14px 18px 0',
              }}>
                {[
                  { label: '👥 동행', val: companion, set: setCompanion,
                    opts: [['연인','💑 연인'],['가족','👨‍👩‍👧 가족'],['혼자','🧍 혼자']] },
                  { label: '🚗 이동 수단', val: transport, set: setTransport,
                    opts: [['자가용','🚗 자가용'],['도보','🚶 도보']] },
                ].map(({ label, val, set, opts }) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: YELLOW_DARK, marginBottom: 6 }}>{label}</div>
                    <select value={val} onChange={e => set(e.target.value)}
                      style={{
                        width: '100%', padding: '8px 10px', borderRadius: 10,
                        border: `1.5px solid ${YELLOW_BORDER}`, fontSize: 12, fontWeight: 700,
                        outline: 'none', cursor: 'pointer', background: '#fff', color: '#374151',
                      }}>
                      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              {error && (
                <div style={{ margin: '10px 18px 0', padding: '9px 12px', background: '#FEE2E2', borderRadius: 10, fontSize: 12, color: '#DC2626', fontWeight: 700 }}>
                  ⚠️ {error}
                </div>
              )}

              <div style={{ padding: '14px 18px 18px' }}>
                <button onClick={handleGenerate}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                    cursor: 'pointer', fontSize: 14, fontWeight: 900,
                    background: `linear-gradient(135deg, #F59E0B, ${YELLOW})`,
                    color: '#fff', boxShadow: '0 4px 14px rgba(234,179,8,0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'filter 0.15s, transform 0.15s', textShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }}
                  onMouseOver={e => { e.currentTarget.style.filter = 'brightness(1.07)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseOut={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none'; }}
                >
                  <span style={{ fontSize: 18 }}>🗺️</span>
                  오늘 코스 짜기
                </button>
              </div>
            </>
          )}

          {/* 로딩 */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '48px 20px' }}>
              <div style={{ width: 40, height: 40, border: `3px solid ${YELLOW_BORDER}`, borderTopColor: YELLOW, borderRadius: '50%', animation: 'ai-spin 0.9s linear infinite' }} />
              <div style={{ fontSize: 14, fontWeight: 800, color: YELLOW_DARK }}>코스를 구성하는 중...</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', lineHeight: 1.6 }}>
                주변 맛집 · 카페를 분석하고<br />최적의 동선을 짜고 있어요 {transport === '도보' ? '🚶' : '🚗'}
              </div>
              <style>{`@keyframes ai-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* 코스 결과 */}
          {course && !loading && (
            <>
              {/* 요약 헤더 */}
              <div style={{
                padding: '14px 20px',
                background: `linear-gradient(135deg, #F59E0B, ${YELLOW})`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 700, marginBottom: 4 }}>
                    당일치기 · {course.companion} · {transport}
                    {festivalTime && <span style={{ marginLeft: 8 }}>· 행사 {festivalTime}</span>}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', lineHeight: 1.5, textShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
                    {course.summary}
                  </div>
                </div>
                <button onClick={handleReset}
                  style={{
                    padding: '6px 12px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.5)',
                    background: 'rgba(255,255,255,0.2)', color: '#fff',
                    fontSize: 11, fontWeight: 800, cursor: 'pointer', flexShrink: 0,
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.32)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                >🔄 다시 생성</button>
              </div>

              {/* 타임라인 */}
              <div style={{ padding: '20px 20px 8px' }}>
                {filteredCourse.map((item, idx) => {
                  const cat    = CATEGORY_STYLE[item.category] || CATEGORY_STYLE['관광'];
                  const isLast = idx === filteredCourse.length - 1;
                  const kakaoUrl = getKakaoUrl(item);
                  return (
                    <div key={idx} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                      {/* 세로 연결선 */}
                      {!isLast && (
                        <div style={{
                          position: 'absolute', left: 19, top: 44, width: 2,
                          bottom: -4, background: `linear-gradient(180deg,${YELLOW_BORDER},#FEF9C3)`, zIndex: 0,
                        }} />
                      )}

                      {/* 시간 + 아이콘 */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, zIndex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: YELLOW_DARK, whiteSpace: 'nowrap' }}>
                          {item.time}
                        </div>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', background: cat.dot,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 18, boxShadow: '0 2px 8px rgba(234,179,8,0.3)',
                        }}>
                          {cat.icon}
                        </div>
                      </div>

                      {/* 카드 — 클릭 시 카카오맵 이동 */}
                      <div
                        onClick={() => kakaoUrl && window.open(kakaoUrl, '_blank')}
                        style={{
                          flex: 1, background: '#fff', borderRadius: 14,
                          border: `1.5px solid ${YELLOW_BORDER}`, padding: '12px 14px',
                          marginBottom: isLast ? 16 : 20,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          cursor: kakaoUrl ? 'pointer' : 'default',
                          transition: 'box-shadow 0.15s, transform 0.12s',
                        }}
                        onMouseOver={e => { if (kakaoUrl) { e.currentTarget.style.boxShadow = '0 4px 16px rgba(234,179,8,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                        onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
                      >
                        {/* 장소명 + 뱃지 + 지도 링크 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <div style={{ fontSize: 14, fontWeight: 900, color: '#111' }}>{item.place_name}</div>
                          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, background: cat.bg, color: cat.color, fontSize: 10, fontWeight: 800 }}>
                            {item.category}
                          </span>
                          {kakaoUrl && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', background: '#FAE100', color: '#3C1E1E', borderRadius: 8, fontSize: 10, fontWeight: 800 }}>
                              지도 보기 →
                            </span>
                          )}
                        </div>

                        {/* 설명 */}
                        <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.75 }}>{item.description}</div>

                        {/* 꿀팁 */}
                        {item.tip && (
                          <div style={{ marginTop: 8, padding: '7px 10px', background: '#FFFBEB', borderRadius: 8, borderLeft: `3px solid ${YELLOW}`, fontSize: 11, color: YELLOW_DARK, fontWeight: 700, lineHeight: 1.55 }}>
                            💡 {item.tip}
                          </div>
                        )}

                        {/* 주소 */}
                        {item.address && (
                          <div style={{ marginTop: 6, fontSize: 11, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                            📍 {item.address}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 하단 다시생성 */}
              <div style={{ padding: '0 18px 18px' }}>
                <button onClick={handleReset}
                  style={{
                    width: '100%', padding: '11px', borderRadius: 12,
                    border: `1.5px solid ${YELLOW_BORDER}`, background: '#FEF3C7',
                    color: YELLOW_DARK, fontSize: 13, fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#FDE68A'}
                  onMouseOut={e => e.currentTarget.style.background = '#FEF3C7'}
                >
                  🔄 다른 옵션으로 다시 생성하기
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// EventDetail 메인 컴포넌트
// ══════════════════════════════════════════════════════════════
export default function EventDetail() {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [tab, setTab]         = useState('상세정보');
  const [liked, setLiked]     = useState(false);
  const [alreadyApplied, setAlreadyApplied]           = useState(false);
  const [alreadyBoothApplied, setAlreadyBoothApplied] = useState(false);
  useWishlistSyncOnEventDetail({ eventId: Number(eventId), liked, setLiked });
  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const qt = q.get('tab');
    if (qt === 'inquiry') setTab('문의');
    else if (qt === 'review') setTab('리뷰');
    else if (qt === 'map') setTab('지도');
    else if (qt === 'detail') setTab('상세정보');
  }, [location.search]);

  useEffect(() => {
    setLoading(true);
    fetchEventDetail(eventId)
      .then(setDetail)
      .catch(() => setError('행사 정보를 불러오지 못했어요.'))
      .finally(() => setLoading(false));
  }, [eventId]);

  useEffect(() => {
    apiJson().get(`/api/eventParticipation/check/${eventId}`)
      .then(res => {
        setAlreadyApplied(!!res.data.alreadyApplied);
        setAlreadyBoothApplied(!!res.data.alreadyBoothApplied);
      })
      .catch(() => {});
  }, [eventId]);

  if (loading) return <LoadingScreen />;
  if (error)   return <ErrorScreen msg={error} />;
  if (!detail) return null;

  const { eventInfo: ev, hostId, hostName, hostEmail, hostPhone, hostPhoto, booths, facilities } = detail;

  const statusUI  = getStatusUI(ev);
  const statusKey = statusUI?.key;
  const showBooth = ev.hasBooth && booths?.length > 0 && shouldShowBooth(statusKey);
  const showFaci  = ev.hasFacility && facilities?.length > 0 && shouldShowBooth(statusKey);

  const allBoothsFull = statusKey === '부스모집중' && booths?.length > 0 && booths.every((b) => b.remainCount != null && b.remainCount <= 0);

  const participationFull = (() => {
    if (statusKey !== '참여모집중') return false;
    if (ev.capacity == null) return false;
    const dates = getDatesInRange(ev.startDate, ev.endDate);
    if (dates.length === 0) return false;
    const counts = ev.dailyParticipantCounts ?? {};
    return dates.every(date => (counts[date] ?? 0) >= ev.capacity);
  })();

  const topics = ev.topicIds
    ? ev.topicIds.split(',').map(id => TOPIC_MAP[Number(id.trim())]).filter(Boolean) : [];
  const hashtags = ev.hashtagIds
    ? ev.hashtagIds.split(',').map(id => HASHTAG_MAP[Number(id.trim())]).filter(Boolean) : [];

  const statusPeriod = (() => {
    if (!statusUI) return null;
    switch (statusUI.key) {
      case '부스모집중': case '부스마감':
        return ev.boothStartRecruit ? `${fmt(ev.boothStartRecruit)} ~ ${fmt(ev.boothEndRecruit)}` : null;
      case '참여모집중': case '모집마감':
        return ev.startRecruit ? `${fmt(ev.startRecruit)} ~ ${fmt(ev.endRecruit)}` : null;
      default: return null;
    }
  })();

  const availableDates  = getDatesInRange(ev.startDate, ev.endDate);
  const dailyCounts     = ev.dailyParticipantCounts ?? {};
  const capacity        = ev.capacity ?? null;

  const getRemain = (date) => {
    if (capacity == null) return null;
    const used = dailyCounts[date] ?? 0;
    return capacity - used;
  };

  const selectedRemain = selectedDate ? getRemain(selectedDate) : null;

  return (
    <>
      <style>{`
        .ed-page { min-height:100vh; background:#F9FAFB; font-family:'Pretendard',-apple-system,sans-serif; }
        .ed-topbar { background:#fff; border-bottom:1px solid #E5E7EB; padding:14px 24px; display:flex; align-items:center; gap:8px; font-size:13px; color:#9CA3AF; }
        .ed-topbar a { color:#9CA3AF; text-decoration:none; transition:color 0.15s; }
        .ed-topbar a:hover { color:#374151; }
        .ed-wrap { max-width:780px; margin:0 auto; padding:32px 20px 80px; }
        .ed-card { background:#fff; border-radius:18px; box-shadow:0 2px 16px rgba(0,0,0,0.07); overflow:hidden; }
        .ed-hero { display:flex; gap:22px; padding:26px 26px 0; }
        .ed-thumb { width:150px; height:150px; border-radius:14px; object-fit:cover; flex-shrink:0; background:#F3F4F6; }
        .ed-hero-right { flex:1; min-width:0; }
        .ed-badge { display:inline-flex; align-items:center; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:800; white-space:nowrap; }
        .ed-title { font-size:21px; font-weight:900; color:#111; margin:0 0 14px; line-height:1.35; word-break:keep-all; }
        .ed-tbl { width:100%; border-collapse:collapse; }
        .ed-tbl tr { border-bottom:1px solid #F3F4F6; }
        .ed-tbl tr:last-child { border-bottom:none; }
        .ed-tbl th { width:70px; padding:7px 0; font-size:12px; font-weight:700; color:#9CA3AF; text-align:left; vertical-align:top; white-space:nowrap; }
        .ed-tbl td { padding:7px 0; font-size:13px; color:#374151; font-weight:600; line-height:1.5; }
        .ed-host-section { padding:18px 26px 0; border-top:1px solid #F3F4F6; }
        .ed-host-action { display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
        .ed-host { display:flex; align-items:center; gap:12px; }
        .ed-avatar { width:44px; height:44px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; overflow:hidden; }
        .ed-host-name { font-size:14px; font-weight:900; color:#111; margin-bottom:2px; }
        .ed-host-sub  { font-size:12px; color:#9CA3AF; line-height:1.6; }
        .ed-main-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; border-radius:13px; font-size:14px; font-weight:900; border:none; cursor:pointer; transition:all 0.15s; white-space:nowrap; text-decoration:none; }
        .ed-main-btn.active:hover { filter:brightness(0.92); transform:translateY(-1px); }
        .ed-main-btn.inactive { cursor:default; }
        .ed-section { margin-top:16px; padding-top:16px; border-top:1px dashed #E5E7EB; }
        .ed-section-title { font-size:11px; font-weight:800; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:10px; }
        .ed-booth-grid { display:grid; gap:7px; }
        .ed-booth-row { display:flex; align-items:center; justify-content:space-between; padding:9px 13px; background:#F9FAFB; border-radius:10px; gap:8px; flex-wrap:wrap; }
        .ed-booth-name { font-size:13px; font-weight:800; color:#111; }
        .ed-booth-meta { display:flex; align-items:center; gap:10px; font-size:12px; color:#6B7280; font-weight:600; }
        .ed-booth-price { color:#F97316; font-weight:800; }
        .ed-rbadge { display:inline-flex; align-items:center; padding:2px 8px; border-radius:8px; font-size:11px; font-weight:800; }
        .ed-rbadge.ok  { background:#ECFDF5; color:#059669; }
        .ed-rbadge.low { background:#FEF3C7; color:#D97706; }
        .ed-rbadge.out { background:#FEE2E2; color:#DC2626; }
        .ed-faci-grid { display:grid; gap:6px; }
        .ed-faci-row { display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:#F9FAFB; border-radius:10px; }
        .ed-faci-name  { font-size:13px; font-weight:700; color:#374151; }
        .ed-faci-price { font-size:13px; font-weight:800; color:#F97316; }
        .ed-icon-row { display:flex; align-items:center; gap:8px; padding:16px 26px 20px; justify-content:flex-end; }
        .ed-icon-btn { display:flex; align-items:center; gap:6px; padding:7px 13px; border-radius:10px; border:1.5px solid #E5E7EB; background:#fff; cursor:pointer; font-size:12px; font-weight:700; color:#6B7280; transition:all 0.15s; }
        .ed-icon-btn:hover { border-color:#D1D5DB; background:#F9FAFB; color:#374151; }
        .ed-icon-btn.liked { border-color:#FECACA; background:#FFF5F5; color:#EF4444; }
        .ed-icon-btn.liked:hover { border-color:#FCA5A5; }
        .ed-tabs { display:flex; border-top:1px solid #F3F4F6; }
        .ed-tab-btn { flex:1; padding:14px 0; background:none; border:none; cursor:pointer; font-size:14px; font-weight:700; color:#9CA3AF; border-bottom:2.5px solid transparent; transition:all 0.15s; }
        .ed-tab-btn.active { color:#F97316; border-bottom-color:#F97316; }
        .ed-tab-content { padding:24px; min-height:200px; }
        .ed-tab-content img { max-width:100%; border-radius:10px; margin-bottom:12px; display:block; }
        .ed-empty { text-align:center; padding:32px 0; color:#D1D5DB; font-size:13px; }
      `}</style>

      <div className="ed-page">
        <div className="ed-topbar">
          <Link to="/">홈</Link>
          <span style={{ margin: '0 4px' }}>·</span>
          <Link to="/events">행사 게시판</Link>
          <span style={{ margin: '0 4px' }}>·</span>
          <span style={{ color: '#374151', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>
            {ev.title}
          </span>
        </div>

        <div className="ed-wrap">
          <div className="ed-card">

            {/* ── 히어로 ── */}
            <div className="ed-hero">
              <div style={{ position: 'relative', flexShrink: 0, width: 150, height: 150 }}>
                <img src={imgUrl(ev.thumbnail)} alt={ev.title} className="ed-thumb"
                  style={{ width: '100%', height: '100%' }}
                  onError={(e) => { e.target.src = PLACEHOLDER; }} />
                {ev.category?.categoryName && (
                  <span style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', color: '#fff',
                    fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                    {ev.category.categoryName}
                  </span>
                )}
              </div>

              <div className="ed-hero-right">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {statusUI && (
                      <span className="ed-badge" style={{ background: statusUI.bg, color: statusUI.color }}>
                        {statusUI.label}
                      </span>
                    )}
                    {statusPeriod && (
                      <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>{statusPeriod}</span>
                    )}
                  </div>
                  {ev.views != null && (
                    <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      👁 {ev.views.toLocaleString()}
                    </span>
                  )}
                </div>
                <h1 className="ed-title">{ev.title}</h1>

                <table className="ed-tbl">
                  <tbody>
                    {ev.simpleExplain && <tr><th>설명</th><td>{ev.simpleExplain}</td></tr>}
                    <tr><th>행사 기간</th><td>{fmt(ev.startDate)} ~ {fmt(ev.endDate)}</td></tr>
                    <tr>
                      <th>행사 장소</th>
                      <td>
                        {ev.lotNumberAdr || '-'}
                        {ev.detailAdr && (
                          <span style={{ color: '#9CA3AF', marginLeft: 6, fontWeight: 500 }}>{ev.detailAdr}</span>
                        )}
                      </td>
                    </tr>
                    {ev.price != null && (
                      <tr><th>참가비</th><td>{ev.price === 0 ? '무료' : `${ev.price.toLocaleString()}원`}</td></tr>
                    )}
                    {ev.capacity != null && (
                      <tr>
                        <th>모집 인원</th>
                        <td>
                          {ev.capacity.toLocaleString()}명 / 1일 기준
                          {ev.currentParticipantCount != null && (
                            <span style={{ marginLeft: 8, fontSize: 12, color: participationFull ? '#EF4444' : '#9CA3AF' }}>
                              (누적 신청자 : {ev.currentParticipantCount}){participationFull ? ' — 전체 마감' : ''}
                            </span>
                          )}
                        </td>
                      </tr>
                    )}
                    {ev.startTime && (
                      <tr><th>행사 시간</th><td>{ev.startTime}{ev.endTime ? ` ~ ${ev.endTime}` : ''}</td></tr>
                    )}
                  </tbody>
                </table>

                {statusKey === '참여모집중' && capacity != null && availableDates.length > 0 && (
                  <div style={{ marginTop: 14, padding: '12px 14px', background: '#FFF7ED', borderRadius: 12, border: '1px solid #FDE68A' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#92400E', marginBottom: 8 }}>
                      📅 날짜별 잔여 인원 확인
                    </div>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1.5px solid #FDE68A', fontSize: 13, fontWeight: 700, outline: 'none', cursor: 'pointer', background: '#fff' }}
                    >
                      <option value="">날짜를 선택하세요</option>
                      {availableDates.map((date) => {
                        const remain = getRemain(date);
                        const isFull = remain !== null && remain <= 0;
                        return (
                          <option key={date} value={date}>
                            {date}{remain === null ? '' : isFull ? ' — 마감' : ` — ${remain}명 남음`}
                          </option>
                        );
                      })}
                    </select>
                    {selectedDate && (() => {
                      const remain = getRemain(selectedDate);
                      if (remain === null) return null;
                      const isFull = remain <= 0;
                      const isLow  = remain > 0 && remain <= Math.ceil(capacity * 0.3);
                      return (
                        <div style={{
                          marginTop: 8, padding: '8px 12px', borderRadius: 10, fontSize: 13, fontWeight: 900,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: isFull ? '#FEE2E2' : isLow ? '#FEF3C7' : '#ECFDF5',
                          color:      isFull ? '#DC2626' : isLow ? '#D97706' : '#059669',
                        }}>
                          <span>{selectedDate}</span>
                          <span>
                            {isFull  ? '❌ 마감'
                             : isLow ? `⚠️ ${remain} / ${capacity}명 — 마감 임박!`
                             :         `✅ ${remain} / ${capacity}명 남음`}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* 주제 / 해시태그 */}
            {(topics.length > 0 || hashtags.length > 0) && (
              <div style={{ padding: '14px 26px', borderTop: '1px solid #F3F4F6', marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {topics.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#9CA3AF', marginRight: 2 }}>주제</span>
                    {topics.map((tag, i) => (
                      <span key={i} style={{ padding: '4px 11px', borderRadius: 20, background: '#FFF7ED', color: '#F97316', fontSize: 12, fontWeight: 800 }}>{tag}</span>
                    ))}
                  </div>
                )}
                {hashtags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#9CA3AF', marginRight: 2 }}>태그</span>
                    {hashtags.map((tag, i) => (
                      <span key={i} style={{ padding: '4px 11px', borderRadius: 20, background: '#F3F4F6', color: '#6B7280', fontSize: 12, fontWeight: 700 }}>#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── 주최자 + 버튼 ── */}
            <div className="ed-host-section">
              <div className="ed-host-action">
                <div className="ed-host">
                  <div className="ed-avatar">
                    {hostPhoto ? (
                      <img src={photoImageUrl(hostPhoto)} alt="주최자"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.textContent = '🏢'; }} />
                    ) : '🏢'}
                  </div>
                  <div>
                    <div className="ed-host-name">{hostName || '주최자 정보 없음'}</div>
                    <div className="ed-host-sub">
                      {hostEmail && <div>{hostEmail}</div>}
                      {hostPhone && <div>{hostPhone}</div>}
                    </div>
                  </div>
                </div>

                {statusUI && (() => {
                  const isParticipation = statusUI.key === '참여모집중';
                  const isBooth         = statusUI.key === '부스모집중';
                  const alreadyDone     = isParticipation ? alreadyApplied : isBooth ? alreadyBoothApplied : false;
                  const isFull          = allBoothsFull || participationFull;
                  const canClick        = statusUI.btnActive && statusUI.btnTo && !isFull;

                  if (canClick) {
                    return (
                      <button className="ed-main-btn active"
                        style={{ background: alreadyDone ? '#E5E7EB' : statusUI.btnColor, color: alreadyDone ? '#9CA3AF' : statusUI.btnTextColor, cursor: 'pointer' }}
                        onClick={() => {
                          if (alreadyDone) { alert(isParticipation ? '이미 참여 신청한 행사입니다.' : '이미 신청한 부스입니다.'); return; }
                          navigate(statusUI.btnTo, { state: { hostId } });
                        }}>
                        {alreadyDone ? (isParticipation ? '✓ 이미 참여 신청됨' : '✓ 이미 부스 신청됨') : statusUI.btnLabel}
                      </button>
                    );
                  }
                  return (
                    <button className="ed-main-btn inactive" disabled
                      style={{ background: isFull ? '#E5E7EB' : statusUI.btnColor, color: isFull ? '#9CA3AF' : statusUI.btnTextColor }}>
                      {allBoothsFull ? '부스 전체 매진' : participationFull ? `정원 마감 (${ev.capacity}명 완료)` : statusUI.btnLabel}
                    </button>
                  );
                })()}
              </div>

              {/* 부스 정보 */}
              {showBooth && (
                <div className="ed-section">
                  <div className="ed-section-title">부스 정보</div>
                  <div className="ed-booth-grid">
                    {booths.map((b) => {
                      const remain = b.remainCount ?? 0;
                      const total  = b.totalCount ?? 0;
                      const ratio  = total > 0 ? remain / total : 0;
                      const cls    = remain === 0 ? 'out' : ratio <= 0.3 ? 'low' : 'ok';
                      return (
                        <div key={b.boothId} className="ed-booth-row">
                          <div className="ed-booth-name">{b.boothName}</div>
                          <div className="ed-booth-meta">
                            {b.boothSize && <span>{b.boothSize}</span>}
                            <span className="ed-booth-price">{b.boothPrice === 0 ? '무료' : `${(b.boothPrice ?? 0).toLocaleString()}원`}</span>
                            <span className={`ed-rbadge ${cls}`}>{remain}/{total}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {booths.some((b) => b.boothNote) && (
                    <div style={{ marginTop: 10, padding: '8px 12px', background: '#FFF7ED', borderRadius: 10 }}>
                      {booths.filter((b) => b.boothNote).map((b) => (
                        <div key={b.boothId} style={{ fontSize: 12, color: '#92400E', lineHeight: 1.6 }}>
                          <strong>{b.boothName}</strong> : {b.boothNote}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 부대시설 */}
              {showFaci && (
                <div className="ed-section">
                  <div className="ed-section-title">부대시설</div>
                  <div className="ed-faci-grid">
                    {facilities.map((f) => (
                      <div key={f.hostBoothfaciId} className="ed-faci-row">
                        <div>
                          <div className="ed-faci-name">{f.faciName}</div>
                          {f.hasCount && f.totalCount != null && (
                            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                              잔여 {f.remainCount ?? '-'} / {f.totalCount} {f.faciUnit || '개'}
                            </div>
                          )}
                        </div>
                        <div className="ed-faci-price">
                          {f.faciPrice === 0 ? '무료' : `${(f.faciPrice ?? 0).toLocaleString()}원`}
                          {f.faciUnit ? ` / ${f.faciUnit}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── 관심 / 공유 / 신고 ── */}
            <div className="ed-icon-row">
              <button className={`ed-icon-btn${liked ? ' liked' : ''}`}
                onClick={() => setLiked((p) => !p)} title={liked ? '관심 취소' : '관심 행사 등록'}>
                <HeartIcon filled={liked} />{liked ? '관심 등록됨' : '관심 행사'}
              </button>
              <button className="ed-icon-btn" onClick={() => setShareOpen(true)} title="공유하기">
                <ShareIcon />공유
              </button>
              <button className="ed-icon-btn" title="신고하기" onClick={(e) => { e.stopPropagation(); setReportOpen(true); }}>
                <SirenIcon />신고
              </button>
            </div>
            <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} eventId={Number(eventId)} />
            <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} ev={ev} />

            {/* ══ ✨ AI 여행 코스 추천 ══ */}
            <AiCourseSection ev={ev} />

            {/* ── 탭 ── */}
            <div className="ed-tabs">
              {TABS.map((t) => (
                <button key={t} className={`ed-tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
              ))}
            </div>

            {tab === '상세정보' && (
              <div className="ed-tab-content">
                {ev.description && (
                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.85, marginBottom: 20, whiteSpace: 'pre-wrap' }}>
                    {ev.description}
                  </p>
                )}
                {ev.detailImagePaths?.length > 0
                  ? ev.detailImagePaths.map((path, i) => (
                      <img key={i} src={imgUrl(path)} alt={`상세이미지 ${i + 1}`}
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    ))
                  : !ev.description && <p className="ed-empty">상세 정보가 없습니다.</p>}
              </div>
            )}

            {tab === '지도' && (
              <div className="ed-tab-content">
                <KakaoMap address={ev.lotNumberAdr} fallbackAddress={ev.detailAdr} detailAddress={ev.detailAdr} zipCode={ev.zipCode} title={ev.title} />
              </div>
            )}

            {tab === '리뷰' && <EventReviewTab eventId={Number(eventId)} />}

            {tab === '문의' && (
              <div className="ed-tab-content">
                <InquiryEventDetail hostId={hostId} hostName={hostName || '주최자'} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#9CA3AF' }}>
      <div style={{ fontSize: 36 }}>⏳</div>
      <div style={{ fontSize: 15 }}>행사 정보를 불러오는 중...</div>
    </div>
  );
}
function ErrorScreen({ msg }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#EF4444' }}>
      <div style={{ fontSize: 36 }}>😢</div>
      <div style={{ fontSize: 15 }}>{msg}</div>
    </div>
  );
}
