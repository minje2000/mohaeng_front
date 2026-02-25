import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { fetchEventDetail } from '../api/EventDetailAPI';
import EventReviewTab from '../review/components/EventReviewTab';
import InquiryEventDetail from '../inquiry/pages/InquiryEventDetail';

// ─────────────────────────────────────────────────────────────
// 해시태그 ID → 이름 매핑 (EventList.jsx TOPICS 동일)
// ─────────────────────────────────────────────────────────────
const HASHTAG_MAP = {
  1: 'IT', 2: '비즈니스/창업', 3: '마케팅/브랜딩', 4: '디자인/아트',
  5: '재테크/투자', 6: '취업/이직', 7: '자기계발', 8: '인문/사회/과학',
  9: '환경/ESG', 10: '건강/스포츠', 11: '요리/베이킹', 12: '음료/주류',
  13: '여행/아웃도어', 14: '인테리어/리빙', 15: '패션/뷰티', 16: '반려동물',
  17: '음악/공연', 18: '영화/만화/게임', 19: '사진/영상제작', 20: '핸드메이드/공예',
  21: '육아/교육', 22: '심리/명상', 23: '연애/결혼', 24: '종교', 25: '기타',
};

// ─────────────────────────────────────────────────────────────
// 날짜 유틸
// ─────────────────────────────────────────────────────────────
const fmt = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

const diffDays = (target) => {
  if (!target) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const t = new Date(target); t.setHours(0, 0, 0, 0);
  return Math.ceil((t - today) / (1000 * 60 * 60 * 24));
};

// ─────────────────────────────────────────────────────────────
// 이미지 URL
// ─────────────────────────────────────────────────────────────
const UPLOAD_BASE = 'http://localhost:8080/upload_files/event';
const PLACEHOLDER = 'https://dummyimage.com/400x300/f3f4f6/666666.png&text=Mohaeng';

const imgUrl = (path) => path ? `${UPLOAD_BASE}/${path}` : PLACEHOLDER;

// ─────────────────────────────────────────────────────────────
// 상태별 UI
// ─────────────────────────────────────────────────────────────
const getStatusUI = (ev) => {
  const status = ev?.eventStatus;
  if (!status) return null;
  switch (status) {
    case '부스모집중':
      return {
        badgeLabel: '부스 사용 모집 중', badgeColor: '#F97316', badgeBg: '#FFF7ED',
        periodRange: `${fmt(ev.boothStartRecruit)} ~ ${fmt(ev.boothEndRecruit)}`,
        btnLabel: '🏪 부스 사용 신청', btnActive: true, btnColor: '#F97316',
        btnTo: `/booth-apply/${ev.eventId}`,
      };
    case '부스모집마감':
    case '행사예정': {
      const d = diffDays(ev.startRecruit);
      return {
        badgeLabel: status === '부스모집마감' ? '부스 모집 마감' : '행사 참여 전',
        badgeColor: '#6B7280', badgeBg: '#F3F4F6',
        periodRange: `${fmt(ev.startRecruit)} ~ ${fmt(ev.endRecruit)}`,
        btnLabel: `🙌 행사 참여 신청${d > 0 ? ` D-${d}` : ''}`,
        btnActive: false, btnColor: '#9CA3AF', btnTo: null,
      };
    }
    case '행사참여모집중':
      return {
        badgeLabel: '행사 참여자 모집 중', badgeColor: '#F97316', badgeBg: '#FFF7ED',
        periodRange: `${fmt(ev.startRecruit)} ~ ${fmt(ev.endRecruit)}`,
        btnLabel: '🙌 행사 참여 신청', btnActive: true, btnColor: '#F97316',
        btnTo: `/event-apply/${ev.eventId}`,
      };
    case '행사참여마감': {
      const d = diffDays(ev.startDate);
      return {
        badgeLabel: '행사 참여 모집 마감', badgeColor: '#6B7280', badgeBg: '#F3F4F6',
        periodRange: `${fmt(ev.startDate)} ~ ${fmt(ev.endDate)}`,
        btnLabel: `🙌 행사 시작${d > 0 ? ` D-${d}` : ''}`,
        btnActive: false, btnColor: '#9CA3AF', btnTo: null,
      };
    }
    case '행사중':
      return {
        badgeLabel: '행사 진행 중', badgeColor: '#F97316', badgeBg: '#FFF7ED',
        periodRange: `${fmt(ev.startDate)} ~ ${fmt(ev.endDate)}`,
        btnLabel: '🎉 행사 중', btnActive: false, btnColor: '#F97316', btnTo: null,
      };
    case '행사종료':
      return {
        badgeLabel: '행사 종료', badgeColor: '#6B7280', badgeBg: '#F3F4F6',
        periodRange: `${fmt(ev.startDate)} ~ ${fmt(ev.endDate)}`,
        btnLabel: '행사 종료', btnActive: false, btnColor: '#9CA3AF', btnTo: null,
      };
    default: return null;
  }
};

const TABS = ['상세정보', '지도', '리뷰', '문의'];

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export default function EventDetail() {
  const { eventId } = useParams();
  const location = useLocation();

  const [detail,  setDetail]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tab,     setTab]     = useState('상세정보');

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
  if (error)   return <ErrorScreen msg={error} />;
  if (!detail) return null;

  const { eventInfo: ev, hostName, hostEmail, hostPhone, booths, facilities } = detail;
  const statusUI = getStatusUI(ev);

  // 해시태그 ID → 이름 변환
  const hashtags = ev.hashtagIds
    ? ev.hashtagIds.split(',')
        .map(id => HASHTAG_MAP[Number(id.trim())])
        .filter(Boolean)
    : [];

  return (
    <>
      <style>{`
        .ed-page { min-height: 100vh; background: #F9FAFB; font-family: 'Pretendard', -apple-system, sans-serif; }
        .ed-topbar { background: #fff; border-bottom: 1px solid #E5E7EB; padding: 14px 24px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: #9CA3AF; }
        .ed-topbar a { color: #9CA3AF; text-decoration: none; }
        .ed-topbar a:hover { color: #374151; }
        .ed-topbar .sep { margin: 0 4px; }
        .ed-wrap { max-width: 980px; margin: 0 auto; padding: 32px 20px 60px; display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start; }
        @media (max-width: 768px) { .ed-wrap { grid-template-columns: 1fr; } }
        .ed-card { background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; }
        .ed-hero { display: flex; gap: 20px; padding: 24px; border-bottom: 1px solid #F3F4F6; }
        .ed-thumb { width: 160px; height: 160px; border-radius: 12px; object-fit: cover; flex-shrink: 0; background: #F3F4F6; }
        .ed-hero-info { flex: 1; min-width: 0; }
        .ed-status-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
        .ed-status-badge { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; white-space: nowrap; }
        .ed-period-text { font-size: 12px; color: #6B7280; font-weight: 600; }
        .ed-title { font-size: 20px; font-weight: 900; color: #111; margin: 0 0 14px; line-height: 1.3; word-break: keep-all; }
        .ed-info-table { width: 100%; border-collapse: collapse; }
        .ed-info-table tr { border-bottom: 1px solid #F3F4F6; }
        .ed-info-table tr:last-child { border-bottom: none; }
        .ed-info-table th { width: 72px; padding: 8px 0; font-size: 12px; font-weight: 700; color: #9CA3AF; text-align: left; vertical-align: top; white-space: nowrap; }
        .ed-info-table td { padding: 8px 0; font-size: 13px; color: #374151; font-weight: 600; }
        .ed-tags { display: flex; flex-wrap: wrap; gap: 8px; padding: 16px 24px; border-bottom: 1px solid #F3F4F6; }
        .ed-tag { padding: 5px 12px; border-radius: 20px; background: #F3F4F6; color: #374151; font-size: 12px; font-weight: 700; }
        .ed-host-row { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; gap: 16px; flex-wrap: wrap; }
        .ed-host { display: flex; align-items: center; gap: 14px; }
        .ed-host-avatar { width: 48px; height: 48px; border-radius: 50%; background: #E5E7EB; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .ed-host-name { font-size: 15px; font-weight: 900; color: #111; margin-bottom: 3px; }
        .ed-host-sub { font-size: 12px; color: #9CA3AF; line-height: 1.6; }
        .ed-action-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 14px; font-size: 14px; font-weight: 900; border: none; cursor: pointer; transition: opacity 0.15s, transform 0.15s; white-space: nowrap; text-decoration: none; }
        .ed-action-btn.active:hover { opacity: 0.88; transform: translateY(-1px); }
        .ed-action-btn.inactive { cursor: default; }
        .ed-icon-btns { display: flex; align-items: center; gap: 14px; padding: 0 24px 20px; justify-content: flex-end; }
        .ed-icon-btn { background: none; border: none; cursor: pointer; font-size: 22px; opacity: 0.55; transition: opacity 0.15s, transform 0.15s; padding: 4px; }
        .ed-icon-btn:hover { opacity: 1; transform: scale(1.15); }
        .ed-tabs { display: flex; border-top: 2px solid #F3F4F6; }
        .ed-tab-btn { flex: 1; padding: 14px 0; background: none; border: none; cursor: pointer; font-size: 14px; font-weight: 700; color: #9CA3AF; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.15s; }
        .ed-tab-btn.active { color: #F97316; border-bottom-color: #F97316; }
        .ed-tab-content { padding: 24px; min-height: 180px; }
        .ed-tab-content img { max-width: 100%; border-radius: 8px; margin-bottom: 10px; }
        .ed-sidebar { display: flex; flex-direction: column; gap: 16px; }
        .ed-side-card { padding: 20px 22px; }
        .ed-side-title { font-size: 13px; font-weight: 900; color: #111; margin: 0 0 14px; display: flex; align-items: center; gap: 6px; }
        .ed-side-title::before { content: ''; display: inline-block; width: 4px; height: 16px; background: #F97316; border-radius: 2px; }
        .ed-booth-table { width: 100%; border-collapse: collapse; }
        .ed-booth-table th { font-size: 11px; font-weight: 800; color: #9CA3AF; padding: 6px 4px; text-align: left; border-bottom: 1px solid #F3F4F6; }
        .ed-booth-table td { font-size: 12px; color: #374151; font-weight: 600; padding: 8px 4px; border-bottom: 1px solid #F9FAFB; vertical-align: middle; }
        .ed-booth-table tr:last-child td { border-bottom: none; }
        .ed-remain-badge { display: inline-flex; align-items: center; justify-content: center; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 800; }
        .ed-remain-ok  { background: #ECFDF5; color: #059669; }
        .ed-remain-low { background: #FEF3C7; color: #D97706; }
        .ed-remain-out { background: #FEE2E2; color: #DC2626; }
        .ed-faci-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #F9FAFB; font-size: 13px; }
        .ed-faci-item:last-child { border-bottom: none; }
        .ed-faci-name  { font-weight: 700; color: #374151; }
        .ed-faci-price { font-weight: 800; color: #F97316; }
        .ed-empty { text-align: center; padding: 24px 0; color: #D1D5DB; font-size: 13px; }
      `}</style>

      <div className="ed-page">
        {/* Breadcrumb */}
        <div className="ed-topbar">
          <Link to="/">홈</Link>
          <span className="sep">·</span>
          <Link to="/events">행사 게시판</Link>
          <span className="sep">·</span>
          <span style={{ color: '#374151', fontWeight: 700 }}>{ev.title}</span>
        </div>

        <div className="ed-wrap">
          {/* ════ 왼쪽 ════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="ed-card">

              {/* 히어로 */}
              <div className="ed-hero">
                <img
                  src={imgUrl(ev.thumbnail)}
                  alt={ev.title}
                  className="ed-thumb"
                  onError={e => { e.target.src = PLACEHOLDER; }}
                />
                <div className="ed-hero-info">
                  {statusUI && (
                    <div className="ed-status-row">
                      <span className="ed-status-badge" style={{ background: statusUI.badgeBg, color: statusUI.badgeColor }}>
                        {statusUI.badgeLabel}
                      </span>
                      <span className="ed-period-text">{statusUI.periodRange}</span>
                    </div>
                  )}
                  <h1 className="ed-title">{ev.title}</h1>
                  <table className="ed-info-table">
                    <tbody>
                      <tr><th>설명</th><td>{ev.simpleExplain || '-'}</td></tr>
                      <tr><th>행사 기간</th><td>{fmt(ev.startDate)} ~ {fmt(ev.endDate)}</td></tr>
                      <tr><th>행사 장소</th><td>{[ev.detailAdr, ev.lotNumberAdr].filter(Boolean).join(' ') || '-'}</td></tr>
                      {ev.price != null && (
                        <tr><th>참가비</th><td>{ev.price === 0 ? '무료' : `${ev.price.toLocaleString()}원`}</td></tr>
                      )}
                      {ev.capacity != null && (
                        <tr><th>모집 인원</th><td>{ev.capacity.toLocaleString()}명</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 해시태그 — ID → 이름 변환 */}
              {hashtags.length > 0 && (
                <div className="ed-tags">
                  {hashtags.map((tag, i) => (
                    <span key={i} className="ed-tag">#{tag}</span>
                  ))}
                </div>
              )}

              {/* 주최자 + 버튼 */}
              <div className="ed-host-row">
                <div className="ed-host">
                  <div className="ed-host-avatar">🏢</div>
                  <div>
                    <div className="ed-host-name">{hostName || '주최자 정보 없음'}</div>
                    <div className="ed-host-sub">
                      {hostEmail && <div>E-mail : {hostEmail}</div>}
                      {hostPhone && <div>Phone : {hostPhone}</div>}
                    </div>
                  </div>
                </div>
                {statusUI && (
                  statusUI.btnActive && statusUI.btnTo ? (
                    <Link to={statusUI.btnTo} className="ed-action-btn active" style={{ background: statusUI.btnColor, color: '#fff' }}>
                      {statusUI.btnLabel}
                    </Link>
                  ) : (
                    <button
                      className={`ed-action-btn ${statusUI.btnActive ? 'active' : 'inactive'}`}
                      style={{ background: statusUI.btnActive ? statusUI.btnColor : '#E5E7EB', color: statusUI.btnActive ? '#fff' : '#9CA3AF' }}
                      disabled={!statusUI.btnActive}
                    >
                      {statusUI.btnLabel}
                    </button>
                  )
                )}
              </div>

              {/* 아이콘 */}
              <div className="ed-icon-btns">
                <button className="ed-icon-btn" title="관심 행사 추가">🤍</button>
                <button className="ed-icon-btn" title="공유">📤</button>
                <button className="ed-icon-btn" title="신고">🔔</button>
              </div>

              {/* 탭 버튼 */}
              <div className="ed-tabs">
                {TABS.map(t => (
                  <button
                    key={t}
                    className={`ed-tab-btn${tab === t ? ' active' : ''}`}
                    onClick={() => setTab(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* 탭 콘텐츠 */}
              {tab === '상세정보' && (
                <div className="ed-tab-content">
                  {ev.description && (
                    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, marginBottom: 20, whiteSpace: 'pre-wrap' }}>
                      {ev.description}
                    </p>
                  )}
                  {ev.detailImagePaths && ev.detailImagePaths.length > 0 ? (
                    ev.detailImagePaths.map((path, i) => (
                      <img key={i} src={imgUrl(path)} alt={`상세이미지 ${i + 1}`}
                        onError={e => { e.target.style.display = 'none'; }} />
                    ))
                  ) : (
                    !ev.description && <p className="ed-empty">상세 정보가 없습니다.</p>
                  )}
                </div>
              )}

              {tab === '지도' && (
                <div className="ed-tab-content">
                  <div className="ed-empty">
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📍</div>
                    <div>{ev.detailAdr || '주소 정보가 없습니다.'}</div>
                  </div>
                </div>
              )}

              {/* 리뷰 탭 — EventReviewTab 직접 렌더링 */}
              {tab === '리뷰' && (
                <EventReviewTab eventId={Number(eventId)} />
              )}

              {tab === '문의' && (
                <div className="ed-tab-content">
                  <InquiryEventDetail />
                </div>
              )}

            </div>
          </div>

          {/* ════ 사이드바 ════ */}
          <div className="ed-sidebar">

            {ev.hasBooth && booths && booths.length > 0 && (
              <div className="ed-card ed-side-card">
                <div className="ed-side-title">부스 정보</div>
                <table className="ed-booth-table">
                  <thead>
                    <tr><th>부스명</th><th>크기</th><th>금액</th><th>잔여</th></tr>
                  </thead>
                  <tbody>
                    {booths.map(b => {
                      const remain = b.remainCount ?? 0;
                      const total  = b.totalCount  ?? 0;
                      const ratio  = total > 0 ? remain / total : 0;
                      const cls = remain === 0 ? 'ed-remain-out' : ratio <= 0.3 ? 'ed-remain-low' : 'ed-remain-ok';
                      return (
                        <tr key={b.boothId}>
                          <td style={{ fontWeight: 800 }}>{b.boothName}</td>
                          <td>{b.boothSize || '-'}</td>
                          <td style={{ color: '#F97316', fontWeight: 800 }}>
                            {b.boothPrice === 0 ? '무료' : `${(b.boothPrice ?? 0).toLocaleString()}원`}
                          </td>
                          <td><span className={`ed-remain-badge ${cls}`}>{remain}/{total}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {booths.some(b => b.boothNote) && (
                  <div style={{ marginTop: 12, padding: '10px 12px', background: '#FFF7ED', borderRadius: 8 }}>
                    {booths.filter(b => b.boothNote).map(b => (
                      <div key={b.boothId} style={{ fontSize: 12, color: '#92400E', lineHeight: 1.6 }}>
                        <strong>{b.boothName}</strong> : {b.boothNote}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {ev.hasFacility && facilities && facilities.length > 0 && (
              <div className="ed-card ed-side-card">
                <div className="ed-side-title">부대시설</div>
                {facilities.map(f => (
                  <div key={f.hostBoothfaciId} className="ed-faci-item">
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
            )}

            <div className="ed-card ed-side-card">
              <div className="ed-side-title">행사 정보</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: '카테고리', value: ev.category?.categoryName },
                  { label: '행사 기간', value: `${fmt(ev.startDate)} ~ ${fmt(ev.endDate)}` },
                  { label: '모집 기간', value: ev.startRecruit ? `${fmt(ev.startRecruit)} ~ ${fmt(ev.endRecruit)}` : null },
                  { label: '부스 모집', value: ev.boothStartRecruit ? `${fmt(ev.boothStartRecruit)} ~ ${fmt(ev.boothEndRecruit)}` : null },
                  { label: '참가비', value: ev.price === 0 ? '무료' : ev.price ? `${ev.price.toLocaleString()}원` : null },
                  { label: '모집 인원', value: ev.capacity ? `${ev.capacity.toLocaleString()}명` : null },
                  { label: '조회수', value: `${(ev.views ?? 0).toLocaleString()}회` },
                ].filter(item => item.value).map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</span>
                    <span style={{ fontSize: 13, color: '#374151', fontWeight: 700, textAlign: 'right', wordBreak: 'keep-all' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#9CA3AF' }}>
      <div style={{ fontSize: 36 }}>⏳</div>
      <div style={{ fontSize: 15 }}>행사 정보를 불러오는 중...</div>
    </div>
  );
}

function ErrorScreen({ msg }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#EF4444' }}>
      <div style={{ fontSize: 36 }}>😢</div>
      <div style={{ fontSize: 15 }}>{msg}</div>
    </div>
  );
}
