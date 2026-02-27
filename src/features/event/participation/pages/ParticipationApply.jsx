import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEventParticipationInfo, getMyProfile, submitParticipation } from '../api/ParticipationAPI';
import Header from '../../../../shared/components/common/Header';

const THEME = { primary: '#FFD700', secondary: '#D97706', bg: '#F9FAFB', border: '#E5E7EB', text: '#111827', subText: '#9CA3AF' };

// 📍 수정사항 6: 날짜 범위 생성 함수
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

// --- 공용 UI 컴포넌트 ---
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
const Input = (props) => <input {...props} style={{ ...inputStyle, ...props.style }} />;
const Select = (props) => <select {...props} style={{ ...inputStyle, ...props.style }} />;
const Textarea = (props) => <textarea {...props} style={{ ...inputStyle, minHeight: '100px', ...props.style }} />;

export default function ParticipationApply() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 📍 수정사항 4, 5, 7, 8: DB 필드명 일치
  const [formData, setFormData] = useState({
    pctGender: '', pctAgeGroup: '', pctJob: '', pctRoot: '',
    pctGroup: '', pctRank: '', pctIntroduce: '', pctDate: ''
  });

  // 📍 수정사항 3: 유저 정보 상태
  const [userInfo, setUserInfo] = useState({ name: '', phone: '', email: '' });
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [res, user] = await Promise.all([
          getEventParticipationInfo(eventId),
          getMyProfile().catch(() => null) // 인증 실패 시 튕기지 않게 처리
        ]);

        if (res) {
          // EventDetailDto 구조에 따라 eventInfo 꺼내기
          setEventData(res.eventInfo || res);
        }
        
        if (user) {
          setUserInfo({
            name: user.name || '',
            phone: user.phone || '',
            email: user.email || ''
          });
        }
      } catch (e) {
        console.error(e);
        alert('데이터를 불러오는 중 문제가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [eventId]);

  // 📍 수정사항 6: 드롭다운용 날짜 리스트
  const availableDates = useMemo(() => {
    return getDatesInRange(eventData?.startDate, eventData?.endDate);
  }, [eventData]);

  const isPaid = useMemo(() => (eventData?.price || 0) > 0, [eventData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.pctDate) return alert('참여 날짜를 선택해주세요.');
    if (!formData.pctGender) return alert('성별을 선택해주세요.');
    if (!formData.pctAgeGroup) return alert('나이대를 선택해주세요.');
    if (!isAgreed) return alert('개인정보 제공 동의가 필요합니다.');

    setIsSubmitting(true);
    try {
      await submitParticipation(eventId, formData);
      alert('참가 신청이 완료되었습니다!');
      navigate(`/events/${eventId}`);
    } catch (e) {
      alert('신청 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !eventData) return <div style={{ textAlign: 'center', padding: '100px' }}>⏳ 로딩 중...</div>;

  // 📍 이미지 경로 401 방지: 백엔드 주소를 정확히 붙여줌
  const getThumbnailUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) return path;
    return `http://localhost:8080/upload_files/event/${path}`; // 프로젝트 업로드 경로에 맞게 수정
  };

  return (
    <div style={{ minHeight: '100vh', background: THEME.bg, paddingBottom: '100px' }}>
      <Header />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '30px' }}>참가 신청 양식</h2>

        {/* 1 & 2. 사진 및 설명 (수정사항 반영) */}
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

        {/* 3 & 4. 개인정보 및 나이대 */}
        <SectionBox title="신청자 정보">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div><Label>이름</Label><Input value={userInfo.name} readOnly style={{background:'#F3F4F6'}} /></div>
            <div><Label>연락처</Label><Input value={userInfo.phone} readOnly style={{background:'#F3F4F6'}} /></div>
            <div style={{ gridColumn: '1/-1' }}><Label>이메일</Label><Input value={userInfo.email} readOnly style={{background:'#F3F4F6'}} /></div>
            
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
                <option value="1">10대</option><option value="2">20대</option><option value="3">30대</option>
                <option value="4">40대</option><option value="5">50대</option><option value="6">60대 이상</option>
              </Select>
            </div>
          </div>
        </SectionBox>

        {/* 5, 6, 7, 8. 참여날짜 드롭다운 및 추가 정보 */}
        <SectionBox title="추가 정보">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <Label required>참여 날짜</Label>
              <Select name="pctDate" value={formData.pctDate} onChange={handleInputChange}>
                <option value="">행사 날짜 선택</option>
                {availableDates.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>직업</Label>
              <Input name="pctJob" value={formData.pctJob} onChange={handleInputChange} placeholder="예: 백엔드 개발자" />
            </div>
            <div>
              <Label>소속</Label>
              <Input name="pctGroup" value={formData.pctGroup} onChange={handleInputChange} placeholder="회사 또는 학교" />
            </div>
            <div>
              <Label>직급</Label>
              <Input name="pctRank" value={formData.pctRank} onChange={handleInputChange} placeholder="예: 대리, 학생" />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <Label>참여 경로</Label>
              <Select name="pctRoot" value={formData.pctRoot} onChange={handleInputChange}>
                <option value="">선택하세요</option>
                <option value="인스타그램">인스타그램</option><option value="블로그/카페">블로그/카페</option>
                <option value="지인추천">지인추천</option><option value="전단지/포스터">전단지/포스터</option>
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
          </SectionBox>
        )}

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <label style={{ cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>
            <input type="checkbox" checked={isAgreed} onChange={e => setIsAgreed(e.target.checked)} style={{marginRight:8}} />
            (필수) 개인정보 제3자 제공 동의
          </label>
        </div>

        {/* 📍 수정사항 5: 임시저장 버튼 삭제 */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={handleSubmit} disabled={isSubmitting} style={{ 
            padding: '16px 80px', borderRadius: '12px', border: 'none', 
            background: THEME.primary, color: '#111', fontWeight: '900', fontSize: '16px', cursor: 'pointer'
          }}>
            {isSubmitting ? '제출 중...' : (isPaid ? '결제하고 신청하기' : '참가 신청하기')}
          </button>
        </div>
      </div>
    </div>
  );
}