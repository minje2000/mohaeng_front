// src/features/participation/pages/ParticipationBoothApply.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ParticipationBoothApi } from '../api/ParticipationBoothAPI';
import { preparePayment } from '../../../payment/api/PaymentAPI';
import Header from '../../../../shared/components/common/Header';

const UPLOAD_BASE_EVENT  = 'http://localhost:8080/upload_files/event';
// ✅ 주최자가 부스 등록 시 첨부한 파일 경로 (fileType = "HBOOTH")
const UPLOAD_BASE_HBOOTH = 'http://localhost:8080/upload_files/hbooth';
const PHOTO_BASE         = 'http://localhost:8080/upload_files/photo';
const PLACEHOLDER        = 'https://dummyimage.com/400x400/f3f4f6/666666.png&text=Mohaeng';

const imgUrl = (path) => (path ? `${UPLOAD_BASE_EVENT}/${path}` : PLACEHOLDER);

const fmtDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const isImageFile = (filename) =>
  /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filename || '');

const THEME = {
  primary: '#FFD700', secondary: '#D97706', bg: '#F9FAFB',
  border: '#E5E7EB', text: '#111827', subText: '#9CA3AF',
};

const SectionBox = ({ children, title, disabled = false }) => (
  <div style={{ background: '#fff', borderRadius: '20px', border: `1px solid ${THEME.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '30px', overflow: 'hidden', opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto', transition: 'all 0.3s' }}>
    <div style={{ padding: '16px 24px', background: `linear-gradient(to right, ${THEME.primary}15, transparent)`, borderBottom: `1px solid ${THEME.border}`, fontSize: '15px', fontWeight: '800', color: THEME.text, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {title}
      {disabled && <span style={{ fontSize: '11px', color: THEME.secondary, fontWeight: '600' }}>⚠️ 부스를 먼저 선택해주세요</span>}
    </div>
    <div style={{ padding: '24px' }}>{children}</div>
  </div>
);

const Label = ({ children, required }) => (
  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
    {children}{required && <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>}
  </label>
);

const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${THEME.border}`, fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' };
const Input    = (props) => <input    {...props} style={{ ...inputStyle, ...props.style }} onFocus={(e) => (e.target.style.borderColor = THEME.primary)} onBlur={(e) => (e.target.style.borderColor = THEME.border)} />;
const Textarea = (props) => <textarea {...props} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical', ...props.style }} onFocus={(e) => (e.target.style.borderColor = THEME.primary)} onBlur={(e) => (e.target.style.borderColor = THEME.border)} />;

const StockBadge = ({ remain, total, color = THEME.secondary }) => {
  const isOut = remain != null && remain <= 0;
  return (
    <div style={{ marginBottom: '4px' }}>
      <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', background: isOut ? '#FEE2E2' : `${color}15`, color: isOut ? '#EF4444' : color, border: `1px solid ${isOut ? '#FECACA' : 'transparent'}` }}>
        {isOut ? '매진' : `잔여 ${remain} / ${total}`}
      </span>
    </div>
  );
};

const TermsModal = ({ onClose }) => {
  const termsContent = `[제공받는 자]
• 행사 주최자 (이벤트 개설자)

[제공 목적]
• 부스 참가자 확인 및 관리
• 행사 관련 안내 및 연락
• 부스 신청 처리 및 운영

[제공하는 개인정보 항목]
• 이름, 전화번호, 이메일
• 홈페이지 / SNS URL
• 부스 명칭, 부스 주제, 주요 전시 품목 등 신청서 작성 항목

[보유 및 이용 기간]
• 행사 종료 후 1년까지
• 단, 관련 법령에 따라 필요 시 일정 기간 보관
  - 계약 또는 청약철회 기록: 5년
  - 소비자 불만 또는 분쟁 처리 기록: 3년

[동의 거부 권리 및 불이익 안내]
• 이용자는 개인정보 제3자 제공에 대한 동의를 거부할 권리가 있습니다.
• 동의를 거부할 경우 부스 참가 신청이 제한될 수 있습니다.`;

  const formatContent = (text) =>
    text.split(/(\[.*?\])/g).map((part, i) =>
      part.startsWith('[') && part.endsWith(']')
        ? <b key={i} style={{ color: '#000', display: 'block', marginTop: i > 0 ? '15px' : '0', marginBottom: '5px' }}>{part}</b>
        : part
    );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '520px', maxHeight: '80vh', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/images/moheng.png" alt="모행" style={{ height: '25px' }} />
            <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>개인정보 제3자 제공 동의</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>&times;</button>
        </div>
        <div style={{ padding: '20px', overflowY: 'auto', backgroundColor: '#f9f9f9', fontSize: '14px', lineHeight: '1.6', color: '#444', whiteSpace: 'pre-line', flex: 1 }}>
          {formatContent(termsContent)}
        </div>
        <div style={{ padding: '16px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center' }}>
          <button type="button" onClick={onClose} style={{ padding: '12px 40px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>확인</button>
        </div>
      </div>
    </div>
  );
};

export default function ParticipationBoothApply() {
  const { eventId }  = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();
  const fileInputRef = useRef();

  const [loading, setLoading]               = useState(true);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [eventData, setEventData]           = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [selectedBoothId, setSelectedBoothId]       = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState([]);

  const [profile, setProfile] = useState({ userId: null, name: null, phone: null, email: null, url: '', profileImg: null });
  const [plan, setPlan]       = useState({ title: '', topic: '', items: '', description: '' });
  const [files, setFiles]     = useState([]);
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userRes = await ParticipationBoothApi.getMyProfile().catch(() => null);
        if (!userRes) { alert('로그인이 필요한 서비스입니다.'); navigate('/login'); return; }

        const eventRes       = await ParticipationBoothApi.getBoothApplicationInfo(eventId);
        const eventHostId    = location.state?.hostId;
        const loggedInUserId = userRes?.userId || userRes?.userNo || userRes?.id;

        if (eventHostId && loggedInUserId && String(eventHostId) === String(loggedInUserId)) {
          alert('본인이 주최한 행사는 부스에 참여할 수 없습니다.');
          navigate(`/events/${eventId}`); return;
        }

        setEventData(eventRes);
        setProfile({ userId: loggedInUserId, name: userRes.name || null, phone: userRes.phone || null, email: userRes.email || null, url: '', profileImg: userRes.profileImg || null });
      } catch (e) {
        console.error(e);
        if (e.response?.status === 401 || e.response?.status === 403) {
          alert('로그인이 필요한 서비스입니다.'); navigate('/login');
        } else {
          alert('정보를 불러올 수 없습니다.'); navigate(-1);
        }
      } finally { setLoading(false); }
    };
    fetchData();
  }, [eventId, navigate, location.state]);

  const { boothPrice, facilityPrice, totalPrice } = useMemo(() => {
    if (!eventData) return { boothPrice: 0, facilityPrice: 0, totalPrice: 0 };
    const booth  = eventData.booths.find((x) => x.boothId === Number(selectedBoothId));
    const bPrice = booth ? booth.boothPrice : 0;
    const fPrice = selectedFacilities.reduce((sum, sel) => {
      const fac = eventData.facilities.find((f) => f.hostBoothfaciId === sel.hostBoothFaciId);
      return sum + (fac ? fac.faciPrice * sel.count : 0);
    }, 0);
    return { boothPrice: bPrice, facilityPrice: fPrice, totalPrice: bPrice + fPrice };
  }, [selectedBoothId, selectedFacilities, eventData]);

  if (loading || !eventData) return <div style={{ textAlign: 'center', padding: '100px' }}>⏳ 신청서를 구성 중입니다...</div>;

  const { eventInfo, booths, facilities } = eventData;

  // ✅ 주최자가 행사 등록 시 첨부한 부스 파일 (EventDto.boothFilePaths)
  const boothFilePaths = eventInfo?.boothFilePaths || [];

  const handleSubmit = async () => {
    if (location.state?.hostId && profile.userId && String(location.state.hostId) === String(profile.userId))
      return alert('본인이 주최한 행사는 부스에 참여할 수 없습니다.');
    if (!selectedBoothId) return alert('참여하실 부스를 선택해주세요.');
    if (!plan.title.trim() || !plan.topic.trim() || !plan.items.trim()) return alert('운영 계획의 필수 항목을 작성해주세요.');
    if (!isAgreed) return alert('개인정보 제3자 제공 동의에 체크해주세요.');

    setIsSubmitting(true);
    try {
      const dto = {
        hostBoothId:   Number(selectedBoothId),
        homepageUrl:   profile.url,
        boothTitle:    plan.title,
        boothTopic:    plan.topic,
        mainItems:     plan.items,
        description:   plan.description,
        boothCount:    1,
        boothPrice,
        facilityPrice,
        totalPrice,
        facilities: selectedFacilities.map((f) => ({
          hostBoothFaciId: f.hostBoothFaciId,
          faciCount:       f.count,
          faciPrice:       (facilities.find((o) => o.hostBoothfaciId === f.hostBoothFaciId)?.faciPrice || 0) * f.count,
        })),
      };

      if (totalPrice === 0) {
        // ✅ 무료: 바로 DB 저장
        await ParticipationBoothApi.submitBoothApplication(eventId, dto, files);
        alert('부스 참가 신청이 완료되었습니다.');
        navigate(`/events/${eventId}`);
        return;
      }

      // ✅ 유료: DB 저장 없이 sessionStorage에만 저장 → 결제 성공 후 PaymentSuccess에서 생성
      sessionStorage.setItem('pendingApply', JSON.stringify({
        type: 'booth',
        eventId: Number(eventId),
        dto,
      }));
      sessionStorage.setItem('paymentEventId', `/events/${eventId}`);

      const paymentInfo = await preparePayment({
        eventId:   Number(eventId),
        amount:    totalPrice,
        orderName: `${eventInfo.title} 부스 참가비`,
      });

      await openTossPayment({
        clientKey:     paymentInfo.clientKey,
        orderId:       paymentInfo.orderId,
        orderName:     paymentInfo.orderName,
        amount:        paymentInfo.amount,
        customerName:  profile.name  || '고객',
        customerEmail: profile.email || '',
      });

    } catch (e) {
      console.error(e);
      alert('신청 또는 결제 준비 중 오류가 발생했습니다.');
    } finally { setIsSubmitting(false); }
  };


  return (
    <div style={{ minHeight: '100vh', background: THEME.bg, fontFamily: "'Pretendard', sans-serif", color: THEME.text }}>
      <Header />
      {showTermsModal && <TermsModal onClose={() => setShowTermsModal(false)} />}

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '50px 20px 100px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '30px' }}>부스 참가 신청서</h2>

        {/* 행사 정보 */}
        <SectionBox title="행사 정보">
          <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
            <img src={imgUrl(eventInfo.thumbnail)} alt="Thumbnail" style={{ width: '150px', height: '150px', borderRadius: '15px', objectFit: 'cover', border: `1px solid ${THEME.border}` }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '10px' }}>{eventInfo.title}</h3>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '15px' }}>{eventInfo.simpleExplain}</p>
              <div style={{ fontSize: '13px', color: '#4B5563', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span>📅 <strong>일시:</strong> {fmtDate(eventInfo.startDate)} ~ {fmtDate(eventInfo.endDate)}</span>
                <span>📍 <strong>장소:</strong> {eventInfo.detailAdr || eventInfo.lotNumberAdr}</span>
              </div>
            </div>
          </div>
        </SectionBox>

        {/* ✅ 주최자 부스 첨부파일 섹션 (boothFilePaths가 있을 때만 표시) */}
        {boothFilePaths.length > 0 && (
          <SectionBox title="📎 부스 안내 자료 (주최자 첨부)">
            <p style={{ fontSize: '13px', color: THEME.subText, marginBottom: '16px', marginTop: '-8px' }}>
              주최자가 등록한 부스 관련 참고 자료입니다. 신청 전 확인해주세요.
            </p>

            {/* 이미지 파일: 미리보기 */}
            {boothFilePaths.filter(isImageFile).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                {boothFilePaths.filter(isImageFile).map((filename, i) => (
                  <a
                    key={i}
                    href={`${UPLOAD_BASE_HBOOTH}/${filename}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={`${UPLOAD_BASE_HBOOTH}/${filename}`}
                      alt={`부스자료 ${i + 1}`}
                      style={{
                        width: '120px', height: '90px',
                        objectFit: 'cover', borderRadius: '10px',
                        border: `1px solid ${THEME.border}`,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                      }}
                      onMouseOver={(e) => (e.target.style.transform = 'scale(1.04)')}
                      onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </a>
                ))}
              </div>
            )}

            {/* 비이미지 파일: 다운로드 링크 */}
            {boothFilePaths.filter((f) => !isImageFile(f)).length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {boothFilePaths.filter((f) => !isImageFile(f)).map((filename, i) => (
                  <a
                    key={i}
                    href={`${UPLOAD_BASE_HBOOTH}/${filename}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '10px 14px', borderRadius: '10px',
                      border: `1px solid ${THEME.border}`, background: '#FAFAFA',
                      color: THEME.text, fontWeight: '700', fontSize: '13px',
                      textDecoration: 'none',
                    }}
                  >
                    <span>📄</span>
                    <span>{filename}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: THEME.subText }}>다운로드</span>
                  </a>
                ))}
              </div>
            )}
          </SectionBox>
        )}

        {/* 부스 선택 + 시설 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
          <SectionBox title="부스 규격 및 비용">
            {booths.map((b) => (
              <label key={b.boothId} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid', borderColor: selectedBoothId === String(b.boothId) ? THEME.primary : THEME.border, background: selectedBoothId === String(b.boothId) ? `${THEME.primary}05` : '#fff', marginBottom: '10px', cursor: b.remainCount != null && b.remainCount <= 0 ? 'not-allowed' : 'pointer', opacity: b.remainCount != null && b.remainCount <= 0 ? 0.6 : 1 }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <input type="radio" name="booth" value={b.boothId} disabled={b.remainCount != null && b.remainCount <= 0} checked={selectedBoothId === String(b.boothId)} onChange={(e) => setSelectedBoothId(e.target.value)} style={{ accentColor: THEME.secondary, marginTop: '18px' }} />
                  <div>
                    <StockBadge remain={b.remainCount} total={b.totalCount} />
                    <div style={{ fontSize: '14px', fontWeight: '700' }}>{b.boothName} <small style={{ color: '#6B7280', fontWeight: '400' }}>({b.boothSize})</small></div>
                  </div>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '800', color: THEME.secondary, alignSelf: 'center' }}>{b.boothPrice.toLocaleString()}원</span>
              </label>
            ))}
          </SectionBox>

          <SectionBox title="부대시설 비용" disabled={!selectedBoothId}>
            {facilities.map((f) => {
              const sel   = selectedFacilities.find((x) => x.hostBoothFaciId === f.hostBoothfaciId);
              const isOut = f.hasCount && f.remainCount != null && f.remainCount <= 0;
              return (
                <div key={f.hostBoothfaciId} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${THEME.border}`, opacity: isOut ? 0.5 : 1 }}>
                  <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: isOut ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600' }}>
                    <input type="checkbox" disabled={isOut} checked={!!sel}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedFacilities([...selectedFacilities, { hostBoothFaciId: f.hostBoothfaciId, count: 1 }]);
                        else setSelectedFacilities(selectedFacilities.filter((x) => x.hostBoothFaciId !== f.hostBoothfaciId));
                      }}
                      style={{ accentColor: THEME.secondary, marginTop: '14px' }} />
                    <div>
                      {f.hasCount && <StockBadge remain={f.remainCount} total={f.totalCount} color="#3B82F6" />}
                      <div style={{ fontWeight: '700' }}>{f.faciName}</div>
                      <div style={{ fontSize: '11px', color: THEME.subText, fontWeight: '400', marginTop: '2px' }}>{f.faciUnit}</div>
                    </div>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: THEME.secondary }}>{f.faciPrice.toLocaleString()}원</span>
                    {sel && f.hasCount && (
                      <input type="number" min="1" max={f.remainCount} value={sel.count}
                        onChange={(e) => setSelectedFacilities(selectedFacilities.map((x) => x.hostBoothFaciId === f.hostBoothfaciId ? { ...x, count: Math.min(f.remainCount, Math.max(1, parseInt(e.target.value) || 1)) } : x))}
                        style={{ width: '45px', textAlign: 'center', border: `1px solid ${THEME.border}`, borderRadius: '4px', fontSize: '12px' }} />
                    )}
                  </div>
                </div>
              );
            })}
          </SectionBox>
        </div>

        {/* 결제 금액 배너 */}
        <div style={{ padding: '24px 30px', background: THEME.primary, borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', boxShadow: `0 10px 20px ${THEME.primary}44` }}>
          <div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#000', opacity: 0.7 }}>총 결제 예정 금액</span>
            <div style={{ fontSize: '12px', color: '#000', opacity: 0.5, marginTop: '2px' }}>
              부스 {boothPrice.toLocaleString()}원 + 시설 {facilityPrice.toLocaleString()}원
            </div>
          </div>
          <span style={{ fontSize: '28px', fontWeight: '900', color: '#000' }}>{totalPrice.toLocaleString()} <small style={{ fontSize: '16px' }}>원</small></span>
        </div>

        {/* 신청자(기업) 프로필 */}
        <SectionBox title="신청자(기업) 프로필">
          <p style={{ fontSize: '12px', color: THEME.subText, marginBottom: '20px', marginTop: '-4px' }}>로그인한 계정 정보로 자동 설정됩니다. 수정이 필요하면 마이페이지에서 변경해주세요.</p>
          {profile.profileImg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: '#F9FAFB', borderRadius: 12, marginBottom: 20, border: `1px solid ${THEME.border}` }}>
              <img src={`${PHOTO_BASE}/${profile.profileImg}`} alt="프로필" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E5E7EB', flexShrink: 0 }} onError={(e) => { e.target.style.display = 'none'; }} />
              <span style={{ fontSize: 12, color: THEME.subText, fontWeight: 600 }}>프로필 사진은 마이페이지에서만 변경할 수 있어요.</span>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' }}>
            <div><Label>이름</Label><Input value={profile.name || '정보 없음'} readOnly disabled style={{ background: '#F3F4F6', color: profile.name ? THEME.text : THEME.subText }} /></div>
            <div><Label>연락처</Label><Input value={profile.phone || '정보 없음'} readOnly disabled style={{ background: '#F3F4F6', color: profile.phone ? THEME.text : THEME.subText }} /></div>
            <div style={{ gridColumn: '1/-1' }}><Label>이메일</Label><Input value={profile.email || '정보 없음'} readOnly disabled style={{ background: '#F3F4F6', color: profile.email ? THEME.text : THEME.subText }} /></div>
            <div style={{ gridColumn: '1/-1' }}><Label>홈페이지 / SNS</Label><Input value={profile.url} onChange={(e) => setProfile({ ...profile, url: e.target.value })} placeholder="https://" /></div>
          </div>
        </SectionBox>

        {/* 운영 계획 */}
        <SectionBox title="운영 계획">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px', marginBottom: '20px' }}>
            <div><Label required>부스 명칭</Label><Input value={plan.title} onChange={(e) => setPlan({ ...plan, title: e.target.value })} placeholder="전시 부스명" /></div>
            <div><Label required>부스 주제</Label><Input value={plan.topic} onChange={(e) => setPlan({ ...plan, topic: e.target.value })} placeholder="핵심 테마" /></div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <Label required>주요 전시 품목 / 컨텐츠</Label>
            <Input value={plan.items} onChange={(e) => setPlan({ ...plan, items: e.target.value })} placeholder="판매 물품 등" />
          </div>
          <div style={{ marginBottom: '25px' }}>
            <Label>상세 설명</Label>
            <Textarea value={plan.description} onChange={(e) => setPlan({ ...plan, description: e.target.value })} placeholder="상세 운영 내용을 작성하세요." />
          </div>
          <div style={{ borderTop: `1px dashed ${THEME.border}`, paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Label>참고자료 첨부 (포트폴리오, 시안 등)</Label>
            <button onClick={() => fileInputRef.current.click()} style={{ background: 'none', border: 'none', color: THEME.secondary, fontWeight: '800', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}>파일첨부</button>
            <input type="file" multiple ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => { setFiles([...files, ...Array.from(e.target.files)]); e.target.value = ''; }} />
          </div>
          {files.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
              {files.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: `${THEME.primary}10`, borderRadius: '6px', fontSize: '12px' }}>
                  {f.name}
                  <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#EF4444' }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </SectionBox>

        {/* 동의 */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <label style={{ fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} style={{ accentColor: THEME.primary, width: '16px', height: '16px' }} />
            (필수) 개인정보 제3자 제공 동의
          </label>
          <button type="button" onClick={() => setShowTermsModal(true)} style={{ marginLeft: '8px', background: 'none', border: 'none', fontSize: '13px', color: THEME.secondary, fontWeight: '700', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>보기</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <button onClick={() => navigate(-1)} style={{ padding: '14px 40px', borderRadius: '12px', border: `1px solid ${THEME.border}`, background: '#fff', fontWeight: '800', cursor: 'pointer' }}>취소</button>
          <button onClick={handleSubmit} disabled={isSubmitting}
            style={{ padding: '14px 60px', borderRadius: '12px', border: 'none', background: isSubmitting ? THEME.border : THEME.primary, color: '#000', fontWeight: '900', fontSize: '16px', cursor: 'pointer' }}>
            {isSubmitting ? '처리 중...' : totalPrice > 0 ? `${totalPrice.toLocaleString()}원 결제하기` : '신청서 제출'}
          </button>
        </div>
      </div>
    </div>
  );
}

async function openTossPayment({ clientKey, orderId, orderName, amount, customerName, customerEmail }) {
  const { loadTossPayments } = await import('@tosspayments/payment-sdk');
  const tossPayments = await loadTossPayments(clientKey);
  await tossPayments.requestPayment('카드', {
    amount, orderId, orderName, customerName, customerEmail,
    successUrl: `${window.location.origin}/payment/success`,
    failUrl:    `${window.location.origin}/payment/fail`,
  });
}
