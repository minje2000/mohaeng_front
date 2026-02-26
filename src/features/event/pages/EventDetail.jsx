import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { fetchEventDetail } from '../api/EventDetailAPI';
import EventReviewTab from '../review/components/EventReviewTab';
import InquiryEventDetail from '../inquiry/pages/InquiryEventDetail';

const HASHTAG_MAP = {
  1: 'IT',
  2: '비즈니스/창업',
  3: '마케팅/브랜딩',
  4: '디자인/아트',
  5: '재테크/투자',
  6: '취업/이직',
  7: '자기계발',
  8: '인문/사회/과학',
  9: '환경/ESG',
  10: '건강/스포츠',
  11: '요리/베이킹',
  12: '음료/주류',
  13: '여행/아웃도어',
  14: '인테리어/리빙',
  15: '패션/뷰티',
  16: '반려동물',
  17: '음악/공연',
  18: '영화/만화/게임',
  19: '사진/영상제작',
  20: '핸드메이드/공예',
  21: '육아/교육',
  22: '심리/명상',
  23: '연애/결혼',
  24: '종교',
  25: '기타',
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

const UPLOAD_BASE = 'http://localhost:8080/upload_files/event';
const PLACEHOLDER =
  'https://dummyimage.com/400x300/f3f4f6/666666.png&text=Mohaeng';
const imgUrl = (path) => (path ? `${UPLOAD_BASE}/${path}` : PLACEHOLDER);

// ── 날짜 기반 상태 계산 ──
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
  const startDate = d(ev.startDate),
    endDate = d(ev.endDate);
  const startR = d(ev.startRecruit),
    endR = d(ev.endRecruit);
  const boothStart = d(ev.boothStartRecruit),
    boothEnd = d(ev.boothEndRecruit);

  if (endDate && today > endDate)
    return {
      key: '종료',
      label: '행사 종료',
      color: '#6B7280',
      bg: '#F3F4F6',
      btnLabel: '행사 종료',
      btnActive: false,
      btnColor: '#E5E7EB',
      btnTextColor: '#9CA3AF',
      btnTo: null,
    };

  if (startDate && endDate && today >= startDate && today <= endDate)
    return {
      key: '진행중',
      label: '행사 진행 중',
      color: '#F97316',
      bg: '#FFF7ED',
      btnLabel: '현재 행사 중',
      btnActive: false,
      btnColor: '#FFEDD5',
      btnTextColor: '#F97316',
      btnTo: null,
    };

  if (endR && today > endR) {
    const diff = diffDays(ev.startDate);
    return {
      key: '모집마감',
      label: '행사 참여 모집 마감',
      color: '#6B7280',
      bg: '#F3F4F6',
      btnLabel: diff > 0 ? `행사 시작 D-${diff}` : '행사 시작 임박',
      btnActive: false,
      btnColor: '#E5E7EB',
      btnTextColor: '#9CA3AF',
      btnTo: null,
    };
  }

  if (startR && endR && today >= startR && today <= endR)
    return {
      key: '참여모집중',
      label: '행사 참여자 모집 중',
      color: '#F97316',
      bg: '#FFF7ED',
      btnLabel: '행사 참여 신청하기',
      btnActive: true,
      btnColor: '#F97316',
      btnTextColor: '#fff',
      btnTo: `/event-apply/${ev.eventId}`,
    };

  if (boothEnd && today > boothEnd) {
    const diff = diffDays(ev.startRecruit);
    return {
      key: '부스마감',
      label: '부스 모집 마감',
      color: '#6B7280',
      bg: '#F3F4F6',
      btnLabel: diff > 0 ? `참여 신청 D-${diff}` : '참여 신청 예정',
      btnActive: false,
      btnColor: '#E5E7EB',
      btnTextColor: '#9CA3AF',
      btnTo: null,
    };
  }

  if (boothStart && boothEnd && today >= boothStart && today <= boothEnd)
    return {
      key: '부스모집중',
      label: '부스 모집 중',
      color: '#8B5CF6',
      bg: '#F5F3FF',
      btnLabel: '부스 사용 신청하기',
      btnActive: true,
      btnColor: '#8B5CF6',
      btnTextColor: '#fff',
      btnTo: `/booth-apply/${ev.eventId}`,
    };

  const diff = diffDays(
    ev.boothStartRecruit || ev.startRecruit || ev.startDate
  );
  return {
    key: '예정',
    label: '행사 예정',
    color: '#3B82F6',
    bg: '#EFF6FF',
    btnLabel: diff > 0 ? `행사 예정 D-${diff}` : '행사 예정',
    btnActive: false,
    btnColor: '#DBEAFE',
    btnTextColor: '#3B82F6',
    btnTo: null,
  };
};

// 부스/시설을 표시할 상태
const shouldShowBooth = (key) => key === '예정' || key === '부스모집중';

const TABS = ['상세정보', '지도', '리뷰', '문의'];

// ── SVG 아이콘 ──
const HeartIcon = ({ filled }) => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill={filled ? '#EF4444' : 'none'}
    stroke={filled ? '#EF4444' : 'currentColor'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const ShareIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const SirenIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M19.07 4.93l-1.41 1.41" />
    <path d="M6 13v-2a6 6 0 0 1 12 0v2" />
    <rect x="4" y="13" width="16" height="4" rx="1" />
    <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
  </svg>
);

// ── 메인 컴포넌트 ──
export default function EventDetail() {
  const { eventId } = useParams();
  const location = useLocation();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('상세정보');
  const [liked, setLiked] = useState(false);

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

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen msg={error} />;
  if (!detail) return null;

  const {
    eventInfo: ev,
    hostId,
    hostName,
    hostEmail,
    hostPhone,
    booths,
    facilities,
  } = detail;
  const statusUI = getStatusUI(ev);
  const statusKey = statusUI?.key;
  const showBooth =
    ev.hasBooth && booths?.length > 0 && shouldShowBooth(statusKey);
  const showFaci =
    ev.hasFacility && facilities?.length > 0 && shouldShowBooth(statusKey);

  const hashtags = ev.hashtagIds
    ? ev.hashtagIds
        .split(',')
        .map((id) => HASHTAG_MAP[Number(id.trim())])
        .filter(Boolean)
    : [];

  // 상태 뱃지 옆에 표시할 날짜 (상태에 맞는 기간만)
  const statusPeriod = (() => {
    if (!statusUI) return null;
    switch (statusUI.key) {
      case '부스모집중':
      case '부스마감':
        return ev.boothStartRecruit
          ? `${fmt(ev.boothStartRecruit)} ~ ${fmt(ev.boothEndRecruit)}`
          : null;
      case '참여모집중':
      case '모집마감':
        return ev.startRecruit
          ? `${fmt(ev.startRecruit)} ~ ${fmt(ev.endRecruit)}`
          : null;
      default:
        return null;
    }
  })();

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert('링크가 복사되었어요!'));
    }
  };

  return (
    <>
      <style>{`
        .ed-page { min-height:100vh; background:#F9FAFB; font-family:'Pretendard',-apple-system,sans-serif; }

        .ed-topbar { background:#fff; border-bottom:1px solid #E5E7EB; padding:14px 24px; display:flex; align-items:center; gap:8px; font-size:13px; color:#9CA3AF; }
        .ed-topbar a { color:#9CA3AF; text-decoration:none; transition:color 0.15s; }
        .ed-topbar a:hover { color:#374151; }

        /* 레이아웃 — 사이드바 없이 단일 컬럼 (max-width 좁혀서 집중감) */
        .ed-wrap { max-width:780px; margin:0 auto; padding:32px 20px 80px; }
        .ed-card { background:#fff; border-radius:18px; box-shadow:0 2px 16px rgba(0,0,0,0.07); overflow:hidden; }

        /* 히어로 */
        .ed-hero { display:flex; gap:22px; padding:26px 26px 0; }
        .ed-thumb { width:150px; height:150px; border-radius:14px; object-fit:cover; flex-shrink:0; background:#F3F4F6; }
        .ed-hero-right { flex:1; min-width:0; }

        /* 뱃지 */
        .ed-badge-row { display:flex; align-items:center; gap:8px; margin-bottom:10px; flex-wrap:wrap; }
        .ed-badge { display:inline-flex; align-items:center; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:800; white-space:nowrap; }

        /* 타이틀 */
        .ed-title { font-size:21px; font-weight:900; color:#111; margin:0 0 14px; line-height:1.35; word-break:keep-all; }

        /* 핵심 정보 테이블 */
        .ed-tbl { width:100%; border-collapse:collapse; }
        .ed-tbl tr { border-bottom:1px solid #F3F4F6; }
        .ed-tbl tr:last-child { border-bottom:none; }
        .ed-tbl th { width:70px; padding:7px 0; font-size:12px; font-weight:700; color:#9CA3AF; text-align:left; vertical-align:top; white-space:nowrap; }
        .ed-tbl td { padding:7px 0; font-size:13px; color:#374151; font-weight:600; line-height:1.5; }

        /* 해시태그 */
        .ed-tags { display:flex; flex-wrap:wrap; gap:7px; padding:14px 26px; border-top:1px solid #F3F4F6; margin-top:22px; }
        .ed-tag { padding:4px 11px; border-radius:20px; background:#F3F4F6; color:#6B7280; font-size:12px; font-weight:700; }

        /* 주최자 + 버튼 섹션 */
        .ed-host-section { padding:18px 26px 0; border-top:1px solid #F3F4F6; }
        .ed-host-action { display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
        .ed-host { display:flex; align-items:center; gap:12px; }
        .ed-avatar { width:44px; height:44px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
        .ed-host-name { font-size:14px; font-weight:900; color:#111; margin-bottom:2px; }
        .ed-host-sub  { font-size:12px; color:#9CA3AF; line-height:1.6; }
        .ed-main-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; border-radius:13px; font-size:14px; font-weight:900; border:none; cursor:pointer; transition:all 0.15s; white-space:nowrap; text-decoration:none; }
        .ed-main-btn.active:hover { filter:brightness(0.92); transform:translateY(-1px); }
        .ed-main-btn.inactive { cursor:default; }

        /* 추가 정보 인포 칩 */
        .ed-meta-chips { display:flex; flex-wrap:wrap; gap:8px; margin-top:16px; padding-top:14px; border-top:1px dashed #E5E7EB; }
        .ed-chip { display:flex; align-items:center; gap:5px; padding:5px 12px; background:#F9FAFB; border:1px solid #E5E7EB; border-radius:10px; font-size:12px; }
        .ed-chip-key { color:#9CA3AF; font-weight:700; }
        .ed-chip-val { color:#374151; font-weight:800; }

        /* 부스/시설 인라인 */
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

        /* 아이콘 버튼 */
        .ed-icon-row { display:flex; align-items:center; gap:8px; padding:16px 26px 20px; justify-content:flex-end; }
        .ed-icon-btn { display:flex; align-items:center; gap:6px; padding:7px 13px; border-radius:10px; border:1.5px solid #E5E7EB; background:#fff; cursor:pointer; font-size:12px; font-weight:700; color:#6B7280; transition:all 0.15s; }
        .ed-icon-btn:hover { border-color:#D1D5DB; background:#F9FAFB; color:#374151; }
        .ed-icon-btn.liked { border-color:#FECACA; background:#FFF5F5; color:#EF4444; }
        .ed-icon-btn.liked:hover { border-color:#FCA5A5; }

        /* 탭 */
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
          <span
            style={{
              color: '#374151',
              fontWeight: 700,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 320,
            }}
          >
            {ev.title}
          </span>
        </div>

        <div className="ed-wrap">
          <div className="ed-card">
            {/* ── 히어로 ── */}
            <div className="ed-hero">
              {/* 썸네일 + 카테고리 오버레이 */}
              <div
                style={{
                  position: 'relative',
                  flexShrink: 0,
                  width: 150,
                  height: 150,
                }}
              >
                <img
                  src={imgUrl(ev.thumbnail)}
                  alt={ev.title}
                  className="ed-thumb"
                  style={{ width: '100%', height: '100%' }}
                  onError={(e) => {
                    e.target.src = PLACEHOLDER;
                  }}
                />
                {ev.category?.categoryName && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(0,0,0,0.45)',
                      backdropFilter: 'blur(4px)',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 20,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ev.category.categoryName}
                  </span>
                )}
              </div>

              <div className="ed-hero-right">
                {/* 뱃지 + 날짜 + 조회수(우상단) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    {statusUI && (
                      <span
                        className="ed-badge"
                        style={{
                          background: statusUI.bg,
                          color: statusUI.color,
                        }}
                      >
                        {statusUI.label}
                      </span>
                    )}
                    {statusPeriod && (
                      <span
                        style={{
                          fontSize: 12,
                          color: '#9CA3AF',
                          fontWeight: 600,
                        }}
                      >
                        {statusPeriod}
                      </span>
                    )}
                  </div>
                  {ev.views != null && (
                    <span
                      style={{
                        fontSize: 12,
                        color: '#9CA3AF',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      👁 {ev.views.toLocaleString()}
                    </span>
                  )}
                </div>
                <h1 className="ed-title">{ev.title}</h1>

                {/* 핵심 정보 — 행사기간/장소/참가비/모집인원 */}
                <table className="ed-tbl">
                  <tbody>
                    {ev.simpleExplain && (
                      <tr>
                        <th>설명</th>
                        <td>{ev.simpleExplain}</td>
                      </tr>
                    )}
                    <tr>
                      <th>행사 기간</th>
                      <td>
                        {fmt(ev.startDate)} ~ {fmt(ev.endDate)}
                      </td>
                    </tr>
                    <tr>
                      <th>행사 장소</th>
                      <td>
                        {[ev.detailAdr, ev.lotNumberAdr]
                          .filter(Boolean)
                          .join(' ') || '-'}
                      </td>
                    </tr>
                    {ev.price != null && (
                      <tr>
                        <th>참가비</th>
                        <td>
                          {ev.price === 0
                            ? '무료'
                            : `${ev.price.toLocaleString()}원`}
                        </td>
                      </tr>
                    )}
                    {ev.capacity != null && (
                      <tr>
                        <th>모집 인원</th>
                        <td>{ev.capacity.toLocaleString()}명</td>
                      </tr>
                    )}
                    {ev.startTime && (
                      <tr>
                        <th>행사 시간</th>
                        <td>
                          {ev.startTime}
                          {ev.endTime ? ` ~ ${ev.endTime}` : ''}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── 해시태그 ── */}
            {hashtags.length > 0 && (
              <div className="ed-tags">
                {hashtags.map((tag, i) => (
                  <span key={i} className="ed-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* ── 주최자 + 버튼 + 추가 정보 + 부스/시설 ── */}
            <div className="ed-host-section">
              {/* 주최자 & 신청 버튼 */}
              <div className="ed-host-action">
                <div className="ed-host">
                  <div className="ed-avatar">🏢</div>
                  <div>
                    <div className="ed-host-name">
                      {hostName || '주최자 정보 없음'}
                    </div>
                    <div className="ed-host-sub">
                      {hostEmail && <div>{hostEmail}</div>}
                      {hostPhone && <div>{hostPhone}</div>}
                    </div>
                  </div>
                </div>

                {statusUI &&
                  (statusUI.btnActive && statusUI.btnTo ? (
                    <Link
                      to={statusUI.btnTo}
                      className="ed-main-btn active"
                      style={{
                        background: statusUI.btnColor,
                        color: statusUI.btnTextColor,
                      }}
                    >
                      {statusUI.btnLabel}
                    </Link>
                  ) : (
                    <button
                      className="ed-main-btn inactive"
                      disabled
                      style={{
                        background: statusUI.btnColor,
                        color: statusUI.btnTextColor,
                      }}
                    >
                      {statusUI.btnLabel}
                    </button>
                  ))}
              </div>

              {/* 부스 정보 — 예정/부스모집중 + 부스 있을 때만 */}
              {showBooth && (
                <div className="ed-section">
                  <div className="ed-section-title">부스 정보</div>
                  <div className="ed-booth-grid">
                    {booths.map((b) => {
                      const remain = b.remainCount ?? 0;
                      const total = b.totalCount ?? 0;
                      const ratio = total > 0 ? remain / total : 0;
                      const cls =
                        remain === 0 ? 'out' : ratio <= 0.3 ? 'low' : 'ok';
                      return (
                        <div key={b.boothId} className="ed-booth-row">
                          <div className="ed-booth-name">{b.boothName}</div>
                          <div className="ed-booth-meta">
                            {b.boothSize && <span>{b.boothSize}</span>}
                            <span className="ed-booth-price">
                              {b.boothPrice === 0
                                ? '무료'
                                : `${(b.boothPrice ?? 0).toLocaleString()}원`}
                            </span>
                            <span className={`ed-rbadge ${cls}`}>
                              {remain}/{total}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {booths.some((b) => b.boothNote) && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: '8px 12px',
                        background: '#FFF7ED',
                        borderRadius: 10,
                      }}
                    >
                      {booths
                        .filter((b) => b.boothNote)
                        .map((b) => (
                          <div
                            key={b.boothId}
                            style={{
                              fontSize: 12,
                              color: '#92400E',
                              lineHeight: 1.6,
                            }}
                          >
                            <strong>{b.boothName}</strong> : {b.boothNote}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* 부대시설 — 동일 조건 */}
              {showFaci && (
                <div className="ed-section">
                  <div className="ed-section-title">부대시설</div>
                  <div className="ed-faci-grid">
                    {facilities.map((f) => (
                      <div key={f.hostBoothfaciId} className="ed-faci-row">
                        <div>
                          <div className="ed-faci-name">{f.faciName}</div>
                          {f.hasCount && f.totalCount != null && (
                            <div
                              style={{
                                fontSize: 11,
                                color: '#9CA3AF',
                                marginTop: 2,
                              }}
                            >
                              잔여 {f.remainCount ?? '-'} / {f.totalCount}{' '}
                              {f.faciUnit || '개'}
                            </div>
                          )}
                        </div>
                        <div className="ed-faci-price">
                          {f.faciPrice === 0
                            ? '무료'
                            : `${(f.faciPrice ?? 0).toLocaleString()}원`}
                          {f.faciUnit ? ` / ${f.faciUnit}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* end host-section */}

            {/* ── 관심 / 공유 / 신고 ── */}
            <div className="ed-icon-row">
              <button
                className={`ed-icon-btn${liked ? ' liked' : ''}`}
                onClick={() => setLiked((p) => !p)}
                title={liked ? '관심 취소' : '관심 행사 등록'}
              >
                <HeartIcon filled={liked} />
                {liked ? '관심 등록됨' : '관심 행사'}
              </button>
              <button
                className="ed-icon-btn"
                onClick={handleShare}
                title="링크 공유"
              >
                <ShareIcon />
                공유
              </button>
              <button className="ed-icon-btn" title="신고하기">
                <SirenIcon />
                신고
              </button>
            </div>

            {/* ── 탭 ── */}
            <div className="ed-tabs">
              {TABS.map((t) => (
                <button
                  key={t}
                  className={`ed-tab-btn${tab === t ? ' active' : ''}`}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* ── 탭 콘텐츠 ── */}
            {tab === '상세정보' && (
              <div className="ed-tab-content">
                {ev.description && (
                  <p
                    style={{
                      fontSize: 14,
                      color: '#374151',
                      lineHeight: 1.85,
                      marginBottom: 20,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {ev.description}
                  </p>
                )}
                {ev.detailImagePaths?.length > 0
                  ? ev.detailImagePaths.map((path, i) => (
                      <img
                        key={i}
                        src={imgUrl(path)}
                        alt={`상세이미지 ${i + 1}`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ))
                  : !ev.description && (
                      <p className="ed-empty">상세 정보가 없습니다.</p>
                    )}
              </div>
            )}

            {tab === '지도' && (
              <div className="ed-tab-content">
                <div className="ed-empty">
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📍</div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: '#374151',
                      fontSize: 14,
                      marginBottom: 4,
                    }}
                  >
                    {ev.detailAdr || ev.lotNumberAdr || '주소 정보가 없습니다.'}
                  </div>
                  {ev.zipCode && (
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                      우편번호 {ev.zipCode}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === '리뷰' && <EventReviewTab eventId={Number(eventId)} />}

            {tab === '문의' && (
              <div className="ed-tab-content">
                <InquiryEventDetail
                  hostId={hostId}
                  hostName={hostName || '주최자'}
                />
              </div>
            )}
          </div>
          {/* end card */}
        </div>
        {/* end wrap */}
      </div>
    </>
  );
}

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 12,
        color: '#9CA3AF',
      }}
    >
      <div style={{ fontSize: 36 }}>⏳</div>
      <div style={{ fontSize: 15 }}>행사 정보를 불러오는 중...</div>
    </div>
  );
}
function ErrorScreen({ msg }) {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 12,
        color: '#EF4444',
      }}
    >
      <div style={{ fontSize: 36 }}>😢</div>
      <div style={{ fontSize: 15 }}>{msg}</div>
    </div>
  );
}
