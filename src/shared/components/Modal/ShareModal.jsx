import React, { useEffect, useRef, useState, useCallback } from 'react';
import eventThumbUrl from '../../utils/eventThumbUrl';

// index.html에 이미 kakao.min.js가 로드되어 있으므로 동적 로딩 불필요
// 앱 키는 index.html의 maps SDK appkey와 동일하게 사용
const KAKAO_APP_KEY = '47c6217d7c0b4dd78e99a1272ddee6b0';

export default function ShareModal({ open, onClose, ev }) {
  const overlayRef = useRef(null);
  const [kakaoReady, setKakaoReady] = useState(false);
  const [copied, setCopied] = useState(false);

  // 모달이 열릴 때마다 Kakao 초기화 확인
  const initKakao = useCallback(() => {
    const Kakao = window.Kakao;
    if (!Kakao) return false;
    // 이미 초기화됐으면 그냥 통과
    if (!Kakao.isInitialized()) {
      try {
        Kakao.init(KAKAO_APP_KEY);
      } catch (e) {
        // 이미 초기화된 경우 에러 무시
      }
    }
    // Share 또는 Link 중 하나라도 있으면 준비 완료
    return !!(Kakao.Share || Kakao.Link);
  }, []);

  useEffect(() => {
    if (!open) return;

    // 바로 시도
    if (initKakao()) {
      setKakaoReady(true);
      return;
    }

    // SDK가 아직 로딩 중이면 폴링으로 대기 (최대 3초)
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      if (initKakao()) {
        setKakaoReady(true);
        clearInterval(timer);
      } else if (attempts > 30) {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [open, initKakao]);

  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open || !ev) return null;

  const handleKakao = () => {
    const Kakao = window.Kakao;
    if (!Kakao || !kakaoReady) {
      alert('카카오톡 공유를 준비 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const shareApi = Kakao.Share || Kakao.Link;
    if (!shareApi) {
      alert('카카오 공유 기능을 사용할 수 없습니다.');
      return;
    }

    const content = {
      title: ev.title || '행사 정보',
      description: ev.simpleExplain || '모행에서 발견한 행사예요!',
      imageUrl: ev.thumbnail
        ? eventThumbUrl(ev.thumbnail)
        : 'https://dummyimage.com/400x300/f3f4f6/666666.png&text=Mohaeng',
      link: { mobileWebUrl: window.location.href, webUrl: window.location.href },
    };

    // Share API (최신) 또는 Link API (구버전) 분기
    if (Kakao.Share?.sendDefault) {
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content,
        buttons: [{ title: '행사 보러가기', link: { mobileWebUrl: window.location.href, webUrl: window.location.href } }],
      });
    } else if (Kakao.Link?.sendDefault) {
      Kakao.Link.sendDefault({
        objectType: 'feed',
        content,
        buttons: [{ title: '행사 보러가기', link: { mobileWebUrl: window.location.href, webUrl: window.location.href } }],
      });
    }
    onClose();
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`[모행] ${ev.title || '행사 공유'}`);
    const body = encodeURIComponent(
      `안녕하세요!\n\n재미있는 행사를 발견해서 공유드려요 😊\n\n` +
      `📌 ${ev.title}\n` +
      `${ev.simpleExplain ? `📝 ${ev.simpleExplain}\n` : ''}` +
      `🔗 ${window.location.href}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    onClose();
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => { setCopied(false); onClose(); }, 1200);
      });
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(17, 24, 39, 0.55)',
        backdropFilter: 'blur(6px)',
        zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'smFadeIn 0.18s ease',
      }}
    >
      <style>{`
        @keyframes smFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes smSlideUp {
          from { opacity:0; transform:translateY(20px) scale(0.96) }
          to   { opacity:1; transform:translateY(0) scale(1) }
        }
        .sm-btn {
          display:flex; flex-direction:column; align-items:center; gap:10px;
          padding:16px 14px; border-radius:18px; border:none; cursor:pointer;
          transition:transform 0.15s ease, box-shadow 0.15s ease;
          min-width:86px; flex:1;
        }
        .sm-btn:hover { transform:translateY(-4px); box-shadow:0 10px 28px rgba(0,0,0,0.13); }
        .sm-btn:active { transform:translateY(-1px); }
        .sm-btn-label { font-size:12px; font-weight:800; letter-spacing:-0.2px; }
        .sm-close-btn {
          width:32px; height:32px; border-radius:50%;
          border:none; background:#F3F4F6; cursor:pointer;
          font-size:14px; color:#6B7280;
          display:flex; align-items:center; justify-content:center;
          transition:background 0.15s;
        }
        .sm-close-btn:hover { background:#E5E7EB; color:#374151; }
      `}</style>

      <div style={{
        width:'100%', maxWidth:400,
        background:'#fff', borderRadius:26,
        boxShadow:'0 32px 80px rgba(0,0,0,0.22)',
        overflow:'hidden',
        animation:'smSlideUp 0.24s cubic-bezier(0.34,1.4,0.64,1)',
      }}>
        {/* 헤더 */}
        <div style={{ padding:'22px 22px 0', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:18, fontWeight:900, color:'#111', letterSpacing:-0.5 }}>공유하기</div>
            <div style={{ fontSize:12, color:'#9CA3AF', marginTop:3, fontWeight:600 }}>이 행사를 친구에게 알려보세요</div>
          </div>
          <button className="sm-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* 행사 미리보기 */}
        <div style={{
          margin:'14px 22px', padding:'12px 14px',
          background:'#F9FAFB', borderRadius:16, border:'1px solid #E5E7EB',
          display:'flex', alignItems:'center', gap:12,
        }}>
          {ev.thumbnail && (
            <img
              src={eventThumbUrl(ev.thumbnail)}
              alt=""
              style={{ width:46, height:46, borderRadius:10, objectFit:'cover', flexShrink:0 }}
              onError={(e) => { e.target.style.display='none'; }}
            />
          )}
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:800, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {ev.title}
            </div>
            {ev.simpleExplain && (
              <div style={{ fontSize:11, color:'#9CA3AF', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {ev.simpleExplain}
              </div>
            )}
          </div>
        </div>

        {/* 공유 버튼 3개 */}
        <div style={{ padding:'0 22px', display:'flex', gap:10 }}>

          {/* 카카오톡 */}
          <button className="sm-btn" onClick={handleKakao}
            style={{ background:'#FEE500', opacity: kakaoReady ? 1 : 0.5 }}
            title={kakaoReady ? '카카오톡으로 공유' : '카카오 준비 중...'}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="12" fill="#FEE500"/>
              {/* 카카오 말풍선 아이콘 */}
              <path d="M18 8.5C12.201 8.5 7.5 12.31 7.5 17.05C7.5 20.09 9.39 22.77 12.27 24.33C11.97 25.46 11.28 27.83 11.16 28.27C11.01 28.83 11.37 28.82 11.62 28.65C11.81 28.52 14.73 26.55 15.96 25.72C16.62 25.81 17.3 25.85 18 25.85C23.799 25.85 28.5 22.04 28.5 17.3C28.5 12.56 23.799 8.5 18 8.5Z" fill="#3C1E1E"/>
            </svg>
            <span className="sm-btn-label" style={{ color:'#3C1E1E' }}>
              {kakaoReady ? '카카오톡' : '준비 중...'}
            </span>
          </button>

          {/* 이메일 */}
          <button className="sm-btn" onClick={handleEmail} style={{ background:'#EFF6FF' }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="12" fill="#DBEAFE"/>
              <rect x="8" y="12" width="20" height="13" rx="3" stroke="#1D4ED8" strokeWidth="1.7" fill="none"/>
              <path d="M8 14.5L18 21L28 14.5" stroke="#1D4ED8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="sm-btn-label" style={{ color:'#1D4ED8' }}>이메일</span>
          </button>

          {/* 링크 복사 */}
          <button className="sm-btn" onClick={handleCopy}
            style={{ background: copied ? '#ECFDF5' : '#F3F4F6' }}>
            {copied ? (
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="12" fill="#D1FAE5"/>
                <path d="M10 18.5L15 23.5L26 12.5" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="12" fill="#E5E7EB"/>
                <rect x="14" y="9" width="12" height="15" rx="3" stroke="#374151" strokeWidth="1.7" fill="none"/>
                <path d="M11 15.5H10.5C9.395 15.5 8.5 16.395 8.5 17.5V25.5C8.5 26.605 9.395 27.5 10.5 27.5H19.5C20.605 27.5 21.5 26.605 21.5 25.5V25" stroke="#374151" strokeWidth="1.7" strokeLinecap="round"/>
              </svg>
            )}
            <span className="sm-btn-label" style={{ color: copied ? '#059669' : '#374151' }}>
              {copied ? '복사됨!' : '링크 복사'}
            </span>
          </button>
        </div>

        {/* URL 바 */}
        <div style={{
          margin:'14px 22px 22px', padding:'10px 14px',
          background:'#F9FAFB', borderRadius:12, border:'1px solid #E5E7EB',
          display:'flex', alignItems:'center', gap:6,
        }}>
          <span style={{ fontSize:13, color:'#9CA3AF' }}>🔗</span>
          <span style={{ fontSize:11, color:'#6B7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1, fontWeight:600 }}>
            {window.location.href}
          </span>
        </div>
      </div>
    </div>
  );
}
