import React, { useEffect, useState, useRef } from 'react';
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

// ✅ 날짜 범위 생성 헬퍼
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

const UPLOAD_BASE = 'http://localhost:8080/upload_files/event';
const PHOTO_BASE  = 'http://localhost:8080/upload_files/photo';
const PLACEHOLDER = 'https://dummyimage.com/400x300/f3f4f6/666666.png&text=Mohaeng';
const imgUrl = (path) => (path ? `${UPLOAD_BASE}/${path}` : PLACEHOLDER);

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

  // ✅ 날짜 선택 상태 (잔여 인원 표시용)
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

  // ✅ 날짜별 정원제 — 모든 날짜가 다 마감됐을 때만 전체 마감
  // (capacity가 없거나 dailyParticipantCounts가 없으면 마감 아님)
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

  // ✅ 날짜별 잔여 인원 계산
  const availableDates  = getDatesInRange(ev.startDate, ev.endDate);
  const dailyCounts     = ev.dailyParticipantCounts ?? {};
  const capacity        = ev.capacity ?? null;

  const getRemain = (date) => {
    if (capacity == null) return null;
    const used = dailyCounts[date] ?? 0;
    return capacity - used;
  };

  // 선택된 날짜의 잔여
  const selectedRemain = selectedDate ? getRemain(selectedDate) : null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => alert('링크가 복사되었어요!'));
    }
  };

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
        .ed-badge-row { display:flex; align-items:center; gap:8px; margin-bottom:10px; flex-wrap:wrap; }
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
        .ed-date-select { width:100%; padding:8px 12px; borderRadius:10px; border:1.5px solid #E5E7EB; fontSize:13px; fontWeight:700; outline:none; cursor:pointer; background:#fff; }
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

                {/* ✅ 날짜별 잔여 인원 선택 섹션 — 참여모집중 + 정원 있을 때만 노출 */}
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

                    {/* 선택된 날짜 잔여 인원 강조 표시 */}
                    {selectedDate && (() => {
                      const remain  = getRemain(selectedDate);
                      if (remain === null) return null;
                      const isFull  = remain <= 0;
                      const isLow   = remain > 0 && remain <= Math.ceil(capacity * 0.3);
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
                      <img
                        src={`${PHOTO_BASE}/${hostPhoto}`}
                        alt="주최자"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.textContent = '🏢'; }}
                      />
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
                      <button
                        className="ed-main-btn active"
                        style={{ background: alreadyDone ? '#E5E7EB' : statusUI.btnColor, color: alreadyDone ? '#9CA3AF' : statusUI.btnTextColor, cursor: 'pointer' }}
                        onClick={() => {
                          if (alreadyDone) {
                            alert(isParticipation ? '이미 참여 신청한 행사입니다.' : '이미 신청한 부스입니다.');
                            return;
                          }
                          navigate(statusUI.btnTo, { state: { hostId } });
                        }}
                      >
                        {alreadyDone
                          ? (isParticipation ? '✓ 이미 참여 신청됨' : '✓ 이미 부스 신청됨')
                          : statusUI.btnLabel}
                      </button>
                    );
                  }

                  return (
                    <button className="ed-main-btn inactive" disabled
                      style={{ background: isFull ? '#E5E7EB' : statusUI.btnColor, color: isFull ? '#9CA3AF' : statusUI.btnTextColor }}>
                      {allBoothsFull ? '부스 전체 매진'
                        : participationFull ? `정원 마감 (${ev.capacity}명 완료)`
                        : statusUI.btnLabel}
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
                <KakaoMap address={ev.lotNumberAdr} fallbackAddress={null} detailAddress={ev.detailAdr} zipCode={ev.zipCode} title={ev.title} />
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
