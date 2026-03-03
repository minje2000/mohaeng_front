// src/features/participation/pages/ParticipationApply.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getEventParticipationInfo, getMyProfile, submitParticipation } from '../api/ParticipationApi';
import { preparePayment } from '../../../payment/api/PaymentAPI';
import Header from '../../../../shared/components/common/Header';

const THEME = {
  primary: '#FFD700', secondary: '#D97706', bg: '#F9FAFB',
  border: '#E5E7EB', text: '#111827', subText: '#9CA3AF',
};
const PHOTO_BASE = 'http://localhost:8080/upload_files/photo';

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

const SectionBox = ({ children, title }) => (
  <div style={{ background: '#fff', borderRadius: '20px', border: `1px solid ${THEME.border}`, marginBottom: '30px', overflow: 'hidden' }}>
    <div style={{ padding: '16px 24px', background: `linear-gradient(to right, ${THEME.primary}15, transparent)`, borderBottom: `1px solid ${THEME.border}`, fontSize: '15px', fontWeight: '800', color: THEME.text }}>{title}</div>
    <div style={{ padding: '24px' }}>{children}</div>
  </div>
);

const Label = ({ children, required }) => (
  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
    {children}{required && <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>}
  </label>
);

const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${THEME.border}`, fontSize: '14px', boxSizing: 'border-box', outline: 'none' };
const Input    = (props) => <input    {...props} style={{ ...inputStyle, ...props.style }} />;
const Select   = (props) => <select   {...props} style={{ ...inputStyle, ...props.style }} />;
const Textarea = (props) => <textarea {...props} style={{ ...inputStyle, minHeight: '100px', ...props.style }} />;

// 개인정보 제3자 제공 동의 모달
const TermsModal = ({ onClose }) => {
  const termsContent = `[제공받는 자]
• 행사 주최자 (이벤트 개설자)

[제공 목적]
• 행사 참가자 확인 및 관리
• 행사 관련 안내 및 연락
• 참가 신청 처리 및 운영

[제공하는 개인정보 항목]
• 이름, 전화번호, 이메일
• 성별, 나이대
• 참여 날짜, 직업, 소속, 직급 등 신청서 작성 항목

[보유 및 이용 기간]
• 행사 종료 후 1년까지
• 단, 관련 법령에 따라 필요 시 일정 기간 보관
  - 계약 또는 청약철회 기록: 5년
  - 소비자 불만 또는 분쟁 처리 기록: 3년

[동의 거부 권리 및 불이익 안내]
• 이용자는 개인정보 제3자 제공에 대한 동의를 거부할 권리가 있습니다.
• 동의를 거부할 경우 행사 참가 신청이 제한될 수 있습니다.`;

  const formatContent = (text) =>
    text.split(/(\[.*?\])/g).map((part, i) =>
      part.startsWith('[') && part.endsWith(']')
        ? <b key={i} style={{ color: '#000', display: 'block', marginTop: i > 0 ? '15px' : '0', marginBottom: '5px' }}>{part}</b>
        : part
    );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '520px', maxHeight: '80vh', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/images/moheng.png" alt="모행" style={{ height: '25px' }} />
            <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>개인정보 제3자 제공 동의</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>&times;</button>
        </div>
        <div style={{ padding: '20px', overflowY: 'auto', backgroundColor: '#f9f9f9', fontSize: '14px', lineHeight: '1.6', color: '#444', whiteSpace: 'pre-line', textAlign: 'left', flex: 1 }}>
          {formatContent(termsContent)}
        </div>
        <div style={{ padding: '16px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center' }}>
          <button type="button" onClick={onClose} style={{ padding: '12px 40px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>확인</button>
        </div>
      </div>
    </div>
  );
};

export default function ParticipationApply() {
  const { eventId } = useParams();
  const navigate    = useNavigate();
  const location    = useLocation();

  const [loading, setLoading]               = useState(true);
  const [eventData, setEventData]           = useState(null);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [formData, setFormData] = useState({
    pctGender: '', pctAgeGroup: '', pctJob: '', pctRoot: '',
    pctGroup: '', pctRank: '', pctIntroduce: '', pctDate: '',
  });
  const [userInfo, setUserInfo] = useState({ userId: null, name: '', phone: '', email: '', profileImg: '' });
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const user = await getMyProfile().catch(() => null);
        if (!user) { alert('로그인이 필요한 서비스입니다.'); navigate('/login'); return; }

        const res          = await getEventParticipationInfo(eventId);
        const currentEvent = res?.eventInfo || res;
        const eventHostId  = location.state?.hostId;
        const loggedInUserId = user?.userId || user?.userNo || user?.id;

        if (eventHostId && loggedInUserId && String(eventHostId) === String(loggedInUserId)) {
          alert('본인이 주최한 행사는 참여할 수 없습니다.'); navigate(`/events/${eventId}`); return;
        }

        if (currentEvent) setEventData(currentEvent);
        setUserInfo({ userId: loggedInUserId, name: user.name || '', phone: user.phone || '', email: user.email || '', profileImg: user.profileImg || '' });
      } catch (e) {
        console.error(e);
        if (e.response?.status === 401 || e.response?.status === 403) {
          alert('로그인이 필요한 서비스입니다.'); navigate('/login');
        } else {
          alert('데이터를 불러오는 중 문제가 발생했습니다.');
        }
      } finally { setLoading(false); }
    };
    init();
  }, [eventId, navigate, location.state]);

  const availableDates = useMemo(() => getDatesInRange(eventData?.startDate, eventData?.endDate), [eventData]);
  const isPaid         = useMemo(() => (eventData?.price || 0) > 0, [eventData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (location.state?.hostId && userInfo.userId && String(location.state.hostId) === String(userInfo.userId))
      return alert('본인이 주최한 행사는 참여할 수 없습니다.');
    if (!formData.pctDate)     return alert('참여 날짜를 선택해주세요.');
    if (!formData.pctGender)   return alert('성별을 선택해주세요.');
    if (!formData.pctAgeGroup) return alert('나이대를 선택해주세요.');
    if (!isAgreed)             return alert('개인정보 제공 동의가 필요합니다.');

    setIsSubmitting(true);
    try {
      // EventParticipationController.submitParticipation → pctId 반환
      const pctId = await submitParticipation(eventId, formData);

      if (!isPaid) {
        alert('참가 신청이 완료되었습니다!');
        navigate(`/events/${eventId}`);
        return;
      }

      const paymentInfo = await preparePayment({
        pctId,
        eventId: Number(eventId),
        amount:    eventData.price,
        orderName: `${eventData.title} 행사 참가비`,
      });

      // ✅ 결제 실패/취소 시 PaymentFail에서 자동 취소하기 위해 저장
      // type: 'participation' → EventParticipationController.cancelParticipation(pctId)
      sessionStorage.setItem('paymentEventId', `/events/${eventId}`);
      sessionStorage.setItem('pendingCancel', JSON.stringify({ type: 'participation', id: pctId }));

      await openTossPayment({
        clientKey:     paymentInfo.clientKey,
        orderId:       paymentInfo.orderId,
        orderName:     paymentInfo.orderName,
        amount:        paymentInfo.amount,
        customerName:  userInfo.name  || '고객',
        customerEmail: userInfo.email || '',
      });

      // 토스 성공 → successUrl로 리다이렉트 → pendingCancel 제거
      sessionStorage.removeItem('pendingCancel');
    } catch (e) {
      console.error(e);
      alert('신청 처리 중 오류가 발생했습니다.');
    } finally { setIsSubmitting(false); }
  };

  if (loading || !eventData) return <div style={{ textAlign: 'center', padding: '100px' }}>⏳ 로딩 중...</div>;

  const getThumbnailUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) return path;
    return `http://localhost:8080/upload_files/event/${path}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: THEME.bg, paddingBottom: '100px' }}>
      <Header />
      {showTermsModal && <TermsModal onClose={() => setShowTermsModal(false)} />}

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '30px' }}>참가 신청 양식</h2>

        <SectionBox title="행사 정보">
          <div style={{ display: 'flex', gap: '20px' }}>
            <img src={getThumbnailUrl(eventData.thumbnail)} alt="thumb" style={{ width: '140px', height: '140px', borderRadius: '12px', objectFit: 'cover' }} />
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{eventData.title}</h3>
              <p style={{ fontSize: '14px', color: THEME.subText, margin: '8px 0' }}>{eventData.simpleExplain}</p>
              <p style={{ fontSize: '13px' }}>📅 {eventData.startDate} ~ {eventData.endDate}</p>
              <p style={{ fontSize: '13px' }}>📍 {eventData.detailAdr || eventData.roadAddress}</p>
            </div>
          </div>
        </SectionBox>

        <SectionBox title="신청자 정보">
          {userInfo.profileImg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: `1px solid ${THEME.border}`, marginBottom: 16 }}>
              <img src={`${PHOTO_BASE}/${userInfo.profileImg}`} alt="프로필" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E5E7EB' }} onError={(e) => { e.target.style.display = 'none'; }} />
              <span style={{ fontSize: 13, color: THEME.subText, fontWeight: 600 }}>마이페이지에서 사진을 변경할 수 있어요.</span>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div><Label>이름</Label><Input value={userInfo.name}  readOnly style={{ background: '#F3F4F6' }} /></div>
            <div><Label>연락처</Label><Input value={userInfo.phone} readOnly style={{ background: '#F3F4F6' }} /></div>
            <div style={{ gridColumn: '1/-1' }}><Label>이메일</Label><Input value={userInfo.email} readOnly style={{ background: '#F3F4F6' }} /></div>
            <div>
              <Label required>성별</Label>
              <Select name="pctGender" value={formData.pctGender} onChange={handleInputChange}>
                <option value="">선택</option>
                <option value="M">남성</option>
                <option value="F">여성</option>
              </Select>
            </div>
            <div>
              <Label required>나이대</Label>
              <Select name="pctAgeGroup" value={formData.pctAgeGroup} onChange={handleInputChange}>
                <option value="">선택</option>
                <option value="1">10대</option><option value="2">20대</option>
                <option value="3">30대</option><option value="4">40대</option>
                <option value="5">50대</option><option value="6">60대 이상</option>
              </Select>
            </div>
          </div>
        </SectionBox>

        <SectionBox title="추가 정보">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <Label required>참여 날짜</Label>
              <Select name="pctDate" value={formData.pctDate} onChange={handleInputChange}>
                <option value="">행사 날짜 선택</option>
                {availableDates.map((date) => <option key={date} value={date}>{date}</option>)}
              </Select>
            </div>
            <div><Label>직업</Label><Input name="pctJob"   value={formData.pctJob}   onChange={handleInputChange} placeholder="예: 백엔드 개발자" /></div>
            <div><Label>소속</Label><Input name="pctGroup" value={formData.pctGroup} onChange={handleInputChange} placeholder="회사 또는 학교" /></div>
            <div><Label>직급</Label><Input name="pctRank"  value={formData.pctRank}  onChange={handleInputChange} placeholder="예: 대리, 학생" /></div>
            <div style={{ gridColumn: '1/-1' }}>
              <Label>참여 경로</Label>
              <Select name="pctRoot" value={formData.pctRoot} onChange={handleInputChange}>
                <option value="">선택하세요</option>
                <option value="인스타그램">인스타그램</option>
                <option value="블로그/카페">블로그/카페</option>
                <option value="지인추천">지인추천</option>
                <option value="전단지/포스터">전단지/포스터</option>
                <option value="기타">기타</option>
              </Select>
            </div>
          </div>
          <Label>자유 소개</Label>
          <Textarea name="pctIntroduce" value={formData.pctIntroduce} onChange={handleInputChange} placeholder="참여 동기를 자유롭게 적어주세요." />
        </SectionBox>

        {isPaid && (
          <SectionBox title="결제 금액 확인">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700' }}>참가비</span>
              <span style={{ fontSize: '20px', fontWeight: '900', color: THEME.secondary }}>{eventData.price?.toLocaleString()} 원</span>
            </div>
            <p style={{ fontSize: '12px', color: THEME.subText, marginTop: '8px' }}>신청 후 토스페이먼츠 결제 페이지로 이동합니다.</p>
          </SectionBox>
        )}

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <label style={{ cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} />
            (필수) 개인정보 제3자 제공 동의
          </label>
          <button type="button" onClick={() => setShowTermsModal(true)} style={{ marginLeft: '8px', background: 'none', border: 'none', fontSize: '13px', color: THEME.secondary, fontWeight: '700', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>보기</button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button onClick={handleSubmit} disabled={isSubmitting}
            style={{ padding: '16px 80px', borderRadius: '12px', border: 'none', background: THEME.primary, color: '#111', fontWeight: '900', fontSize: '16px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
            {isSubmitting ? '처리 중...' : (isPaid ? `${eventData.price?.toLocaleString()}원 결제하기` : '참가 신청하기')}
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
