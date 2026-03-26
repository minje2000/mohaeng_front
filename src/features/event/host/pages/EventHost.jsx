// src/features/event/host/pages/EventHost.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent, suggestTags, generateAiImage } from '../api/EventHostApi';
import Header from '../../../../shared/components/common/Header';
import { photoImageUrl } from '../../../../shared/utils/uploadFileUrl';
import { apiJson } from '../../../../app/http/request';

const CITY_IDS = {
  서울: 1100000000, 부산: 2600000000, 대구: 2700000000, 인천: 2800000000,
  광주: 2900000000, 대전: 3000000000, 울산: 3100000000, 세종: 3611000000,
  경기: 4100000000, 강원: 5100000000, 충북: 4300000000, 충남: 4400000000,
  전북: 5200000000, 전남: 4600000000, 경북: 4700000000, 경남: 4800000000,
  제주: 5000000000,
};

const REGION_DATA = {
  서울: [
    { id: 1111000000, name: '종로구' }, { id: 1114000000, name: '중구' }, { id: 1117000000, name: '용산구' },
    { id: 1120000000, name: '성동구' }, { id: 1121500000, name: '광진구' }, { id: 1123000000, name: '동대문구' },
    { id: 1126000000, name: '중랑구' }, { id: 1129000000, name: '성북구' }, { id: 1130500000, name: '강북구' },
    { id: 1132000000, name: '도봉구' }, { id: 1135000000, name: '노원구' }, { id: 1138000000, name: '은평구' },
    { id: 1141000000, name: '서대문구' }, { id: 1144000000, name: '마포구' }, { id: 1147000000, name: '양천구' },
    { id: 1150000000, name: '강서구' }, { id: 1153000000, name: '구로구' }, { id: 1154500000, name: '금천구' },
    { id: 1156000000, name: '영등포구' }, { id: 1159000000, name: '동작구' }, { id: 1162000000, name: '관악구' },
    { id: 1165000000, name: '서초구' }, { id: 1168000000, name: '강남구' }, { id: 1171000000, name: '송파구' },
    { id: 1174000000, name: '강동구' },
  ],
  부산: [
    { id: 2611000000, name: '중구' }, { id: 2614000000, name: '서구' }, { id: 2617000000, name: '동구' },
    { id: 2620000000, name: '영도구' }, { id: 2623000000, name: '부산진구' }, { id: 2626000000, name: '동래구' },
    { id: 2629000000, name: '남구' }, { id: 2632000000, name: '북구' }, { id: 2635000000, name: '해운대구' },
    { id: 2638000000, name: '사하구' }, { id: 2641000000, name: '금정구' }, { id: 2644000000, name: '강서구' },
    { id: 2647000000, name: '연제구' }, { id: 2650000000, name: '수영구' }, { id: 2653000000, name: '사상구' },
    { id: 2671000000, name: '기장군' },
  ],
  대구: [
    { id: 2711000000, name: '중구' }, { id: 2714000000, name: '동구' }, { id: 2717000000, name: '서구' },
    { id: 2720000000, name: '남구' }, { id: 2723000000, name: '북구' }, { id: 2726000000, name: '수성구' },
    { id: 2729000000, name: '달서구' }, { id: 2771000000, name: '달성군' }, { id: 2772000000, name: '군위군' },
  ],
  인천: [
    { id: 2811000000, name: '중구' }, { id: 2814000000, name: '동구' }, { id: 2817700000, name: '미추홀구' },
    { id: 2818500000, name: '연수구' }, { id: 2820000000, name: '남동구' }, { id: 2823700000, name: '부평구' },
    { id: 2824500000, name: '계양구' }, { id: 2826000000, name: '서구' }, { id: 2871000000, name: '강화군' },
    { id: 2872000000, name: '옹진군' },
  ],
  광주: [
    { id: 2911000000, name: '동구' }, { id: 2914000000, name: '서구' }, { id: 2915500000, name: '남구' },
    { id: 2917000000, name: '북구' }, { id: 2920000000, name: '광산구' },
  ],
  대전: [
    { id: 3011000000, name: '동구' }, { id: 3014000000, name: '중구' }, { id: 3017000000, name: '서구' },
    { id: 3020000000, name: '유성구' }, { id: 3023000000, name: '대덕구' },
  ],
  울산: [
    { id: 3111000000, name: '중구' }, { id: 3114000000, name: '남구' }, { id: 3117000000, name: '동구' },
    { id: 3120000000, name: '북구' }, { id: 3171000000, name: '울주군' },
  ],
  경기: [
    { id: 4111000000, name: '수원시' }, { id: 4113000000, name: '성남시' }, { id: 4115000000, name: '의정부시' },
    { id: 4117000000, name: '안양시' }, { id: 4119000000, name: '부천시' }, { id: 4121000000, name: '광명시' },
    { id: 4122000000, name: '평택시' }, { id: 4125000000, name: '동두천시' }, { id: 4127000000, name: '안산시' },
    { id: 4128000000, name: '고양시' }, { id: 4129000000, name: '과천시' }, { id: 4131000000, name: '구리시' },
    { id: 4136000000, name: '남양주시' }, { id: 4137000000, name: '오산시' }, { id: 4139000000, name: '시흥시' },
    { id: 4141000000, name: '군포시' }, { id: 4143000000, name: '의왕시' }, { id: 4145000000, name: '하남시' },
    { id: 4146000000, name: '용인시' }, { id: 4148000000, name: '파주시' }, { id: 4150000000, name: '이천시' },
    { id: 4155000000, name: '안성시' }, { id: 4157000000, name: '김포시' }, { id: 4159000000, name: '화성시' },
    { id: 4161000000, name: '광주시' }, { id: 4163000000, name: '양주시' }, { id: 4165000000, name: '포천시' },
    { id: 4167000000, name: '여주시' }, { id: 4180000000, name: '연천군' }, { id: 4182000000, name: '가평군' },
    { id: 4183000000, name: '양평군' },
  ],
  강원: [
    { id: 5111000000, name: '춘천시' }, { id: 5113000000, name: '원주시' }, { id: 5115000000, name: '강릉시' },
    { id: 5117000000, name: '동해시' }, { id: 5119000000, name: '태백시' }, { id: 5121000000, name: '속초시' },
    { id: 5123000000, name: '삼척시' }, { id: 5172000000, name: '홍천군' }, { id: 5173000000, name: '횡성군' },
    { id: 5175000000, name: '영월군' }, { id: 5176000000, name: '평창군' }, { id: 5177000000, name: '정선군' },
    { id: 5178000000, name: '철원군' }, { id: 5179000000, name: '화천군' }, { id: 5180000000, name: '양구군' },
    { id: 5181000000, name: '인제군' }, { id: 5182000000, name: '고성군' }, { id: 5183000000, name: '양양군' },
  ],
  충북: [
    { id: 4311000000, name: '청주시' }, { id: 4313000000, name: '충주시' }, { id: 4315000000, name: '제천시' },
    { id: 4372000000, name: '보은군' }, { id: 4373000000, name: '옥천군' }, { id: 4374000000, name: '영동군' },
    { id: 4374500000, name: '증평군' }, { id: 4375000000, name: '진천군' }, { id: 4376000000, name: '괴산군' },
    { id: 4377000000, name: '음성군' }, { id: 4380000000, name: '단양군' },
  ],
  충남: [
    { id: 4413000000, name: '천안시' }, { id: 4415000000, name: '공주시' }, { id: 4418000000, name: '보령시' },
    { id: 4420000000, name: '아산시' }, { id: 4421000000, name: '서산시' }, { id: 4423000000, name: '논산시' },
    { id: 4425000000, name: '계룡시' }, { id: 4427000000, name: '당진시' }, { id: 4471000000, name: '금산군' },
    { id: 4476000000, name: '부여군' }, { id: 4477000000, name: '서천군' }, { id: 4479000000, name: '청양군' },
    { id: 4480000000, name: '홍성군' }, { id: 4481000000, name: '예산군' }, { id: 4482500000, name: '태안군' },
  ],
  전북: [
    { id: 5211000000, name: '전주시' }, { id: 5213000000, name: '군산시' }, { id: 5214000000, name: '익산시' },
    { id: 5218000000, name: '정읍시' }, { id: 5219000000, name: '남원시' }, { id: 5221000000, name: '김제시' },
    { id: 5271000000, name: '완주군' }, { id: 5272000000, name: '진안군' }, { id: 5273000000, name: '무주군' },
    { id: 5274000000, name: '장수군' }, { id: 5275000000, name: '임실군' }, { id: 5277000000, name: '순창군' },
    { id: 5279000000, name: '고창군' }, { id: 5280000000, name: '부안군' },
  ],
  전남: [
    { id: 4611000000, name: '목포시' }, { id: 4613000000, name: '여수시' }, { id: 4615000000, name: '순천시' },
    { id: 4617000000, name: '나주시' }, { id: 4623000000, name: '광양시' }, { id: 4671000000, name: '담양군' },
    { id: 4672000000, name: '곡성군' }, { id: 4673000000, name: '구례군' }, { id: 4677000000, name: '고흥군' },
    { id: 4678000000, name: '보성군' }, { id: 4679000000, name: '화순군' }, { id: 4680000000, name: '장흥군' },
    { id: 4681000000, name: '강진군' }, { id: 4682000000, name: '해남군' }, { id: 4683000000, name: '영암군' },
    { id: 4684000000, name: '무안군' }, { id: 4686000000, name: '함평군' }, { id: 4687000000, name: '영광군' },
    { id: 4688000000, name: '장성군' }, { id: 4689000000, name: '완도군' }, { id: 4690000000, name: '진도군' },
    { id: 4691000000, name: '신안군' },
  ],
  경북: [
    { id: 4711000000, name: '포항시' }, { id: 4713000000, name: '경주시' }, { id: 4715000000, name: '김천시' },
    { id: 4717000000, name: '안동시' }, { id: 4719000000, name: '구미시' }, { id: 4721000000, name: '영주시' },
    { id: 4723000000, name: '영천시' }, { id: 4725000000, name: '상주시' }, { id: 4728000000, name: '문경시' },
    { id: 4729000000, name: '경산시' }, { id: 4773000000, name: '의성군' }, { id: 4775000000, name: '청송군' },
    { id: 4776000000, name: '영양군' }, { id: 4777000000, name: '영덕군' }, { id: 4782000000, name: '청도군' },
    { id: 4783000000, name: '고령군' }, { id: 4784000000, name: '성주군' }, { id: 4785000000, name: '칠곡군' },
    { id: 4790000000, name: '예천군' }, { id: 4792000000, name: '봉화군' }, { id: 4793000000, name: '울진군' },
    { id: 4794000000, name: '울릉군' },
  ],
  경남: [
    { id: 4812000000, name: '창원시' }, { id: 4817000000, name: '진주시' }, { id: 4822000000, name: '통영시' },
    { id: 4824000000, name: '사천시' }, { id: 4825000000, name: '김해시' }, { id: 4827000000, name: '밀양시' },
    { id: 4831000000, name: '거제시' }, { id: 4833000000, name: '양산시' }, { id: 4872000000, name: '의령군' },
    { id: 4873000000, name: '함안군' }, { id: 4874000000, name: '창녕군' }, { id: 4882000000, name: '고성군' },
    { id: 4884000000, name: '남해군' }, { id: 4885000000, name: '하동군' }, { id: 4886000000, name: '산청군' },
    { id: 4887000000, name: '함양군' }, { id: 4888000000, name: '거창군' }, { id: 4889000000, name: '합천군' },
  ],
  제주: [{ id: 5011000000, name: '제주시' }, { id: 5013000000, name: '서귀포시' }],
  세종: [{ id: 3611000000, name: '세종시' }],
};

const CATEGORIES = [
  { id: 1, name: '컨퍼런스' }, { id: 2, name: '박람회' }, { id: 3, name: '전시' },
  { id: 4, name: '강연/세미나' }, { id: 5, name: '교육/워크숍' }, { id: 6, name: '공연/콘서트' },
  { id: 7, name: '페스티벌/축제' }, { id: 8, name: '취업/채용' }, { id: 9, name: '네트워킹/파티' },
  { id: 10, name: '경진대회' }, { id: 11, name: '플리마켓/장터' }, { id: 12, name: '토크콘서트' },
  { id: 13, name: '스포츠/레저' }, { id: 14, name: '원데이 클래스' }, { id: 15, name: '팝업스토어' },
];

const TOPICS = [
  { id: 1, name: 'IT' }, { id: 2, name: '비즈니스/창업' }, { id: 3, name: '마케팅/브랜딩' },
  { id: 4, name: '디자인/아트' }, { id: 5, name: '재테크/투자' }, { id: 6, name: '취업/이직' },
  { id: 7, name: '자기계발' }, { id: 8, name: '인문/사회/과학' }, { id: 9, name: '환경/ESG' },
  { id: 10, name: '건강/스포츠' }, { id: 11, name: '요리/베이킹' }, { id: 12, name: '음료/주류' },
  { id: 13, name: '여행/아웃도어' }, { id: 14, name: '인테리어/리빙' }, { id: 15, name: '패션/뷰티' },
  { id: 16, name: '반려동물' }, { id: 17, name: '음악/공연' }, { id: 18, name: '영화/만화/게임' },
  { id: 19, name: '사진/영상제작' }, { id: 20, name: '핸드메이드/공예' }, { id: 21, name: '육아/교육' },
  { id: 22, name: '심리/명상' }, { id: 23, name: '연애/결혼' }, { id: 24, name: '종교' }, { id: 25, name: '기타' },
];

const HASHTAGS = [
  { id: 1, name: '즐거운' }, { id: 2, name: '평온한' }, { id: 3, name: '열정적인' },
  { id: 4, name: '디지털디톡스' }, { id: 5, name: '창의적인' }, { id: 6, name: '영감을주는' },
  { id: 7, name: '활기찬' }, { id: 8, name: '편안한' }, { id: 9, name: '트렌디한' },
  { id: 10, name: '전문적인' }, { id: 11, name: '교육적인' }, { id: 12, name: '감성적인' },
  { id: 13, name: '도전적인' }, { id: 14, name: '따뜻한' }, { id: 15, name: '유익한' },
  { id: 16, name: '색다른' }, { id: 17, name: '미니멀한' }, { id: 18, name: '역동적인' },
  { id: 19, name: '신선한' }, { id: 20, name: '친근한' }, { id: 21, name: '화려한' },
  { id: 22, name: '조용한' }, { id: 23, name: '성장하는' }, { id: 24, name: '함께하는' },
  { id: 25, name: '지속가능한' }, { id: 26, name: '흥미진진한' }, { id: 27, name: '진지한' },
  { id: 28, name: '자유로운' }, { id: 29, name: '집중하는' }, { id: 30, name: '친환경적인' },
];

const FONT_COLOR_PRESETS = [
  { value: '#FFFFFF', label: '흰색' },
  { value: '#111111', label: '검정' },
  { value: '#FFD700', label: '골드' },
  { value: '#FF6B6B', label: '코랄' },
  { value: '#4ECDC4', label: '민트' },
  { value: '#A78BFA', label: '라벤더' },
];

// ── [변경 1] 테두리 색상 프리셋 ──────────────────────────────
const BORDER_COLOR_PRESETS = ['#000000', '#FFFFFF', '#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA'];

const INIT_BOOTH = () => ({ boothName: '', boothSize: '', boothPrice: '', boothNote: '', totalCount: '' });
const INIT_FACI  = () => ({ faciName: '', faciPrice: '', faciUnit: '', hasCount: false, totalCount: '' });

const dayBefore = (dateStr) => {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};


// ── AI 추천 뱃지 ─────────────────────────────────────────────
const AiBadge = () => (
  <span style={{
    display: 'inline-block', marginLeft: 6, padding: '1px 6px',
    background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff',
    borderRadius: 8, fontSize: 10, fontWeight: 800, verticalAlign: 'middle',
  }}>✨ AI추천!</span>
);

// ── 공통 UI ──────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#374151', marginBottom: 5 }}>
    {children}
    {required && <span style={{ color: '#EF4444', marginLeft: 3 }}>*</span>}
  </label>
);

const inputBase = {
  width: '100%', boxSizing: 'border-box', padding: '10px 13px', borderRadius: 10,
  border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', transition: 'border 0.15s',
  fontFamily: 'inherit', background: '#fff',
};
const Input = ({ style, ...props }) => (
  <input style={{ ...inputBase, ...style }}
    onFocus={(e) => (e.target.style.borderColor = '#FFD700')}
    onBlur={(e)  => (e.target.style.borderColor = '#E5E7EB')}
    {...props} />
);
const Textarea = ({ style, ...props }) => (
  <textarea style={{ ...inputBase, resize: 'vertical', minHeight: 100, lineHeight: 1.6, ...style }}
    onFocus={(e) => (e.target.style.borderColor = '#FFD700')}
    onBlur={(e)  => (e.target.style.borderColor = '#E5E7EB')}
    {...props} />
);
const Select = ({ style, children, ...props }) => (
  <select style={{ ...inputBase, cursor: 'pointer', ...style }}
    onFocus={(e) => (e.target.style.borderColor = '#FFD700')}
    onBlur={(e)  => (e.target.style.borderColor = '#E5E7EB')}
    {...props}>
    {children}
  </select>
);

const SectionCard = ({ step, title, icon, children }) => (
  <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', overflow: 'hidden', marginBottom: 20 }}>
    <div style={{ background: 'linear-gradient(135deg,#FFD700 0%,#FFC200 100%)', padding: '13px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff', flexShrink: 0 }}>{step}</div>
      <span style={{ fontSize: 15, fontWeight: 900, color: '#111' }}>{icon} {title}</span>
    </div>
    <div style={{ padding: '22px 24px' }}>{children}</div>
  </div>
);

const G2 = ({ children, style }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, ...style }}>{children}</div>
);

const Divider = () => <div style={{ height: 1, background: '#F3F4F6', margin: '18px 0' }} />;

// ══════════════════════════════════════════════════════════════
// 썸네일 관련 상수 & 헬퍼
// ══════════════════════════════════════════════════════════════
const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&family=Noto+Serif+KR:wght@700&family=Black+Han+Sans&family=Jua&family=Gamja+Flower&family=Do+Hyeon&family=Sunflower:wght@700&family=Gaegu:wght@700&family=Hi+Melody&family=Cute+Font&family=Nanum+Pen+Script&family=Single+Day&display=swap';

const FONT_OPTIONS = [
  { value: 'Noto Sans KR',     label: '노토 산스',      desc: '깔끔한 고딕' },
  { value: 'Noto Serif KR',    label: '노토 세리프',    desc: '클래식 명조' },
  { value: 'Black Han Sans',   label: '블랙 한 산스',   desc: '임팩트 굵은체' },
  { value: 'Do Hyeon',         label: '도현체',         desc: '부드러운 둥근체' },
  { value: 'Jua',              label: '주아체',         desc: '귀엽고 둥글둥글' },
  { value: 'Cute Font',        label: '귀여운폰트',     desc: '동글동글 귀여운' },
  { value: 'Sunflower',        label: '해바라기체',     desc: '가볍고 산뜻한' },
  { value: 'Gamja Flower',     label: '감자꽃체',       desc: '손글씨 감성' },
  { value: 'Gaegu',            label: '개구체',         desc: '낙서 느낌' },
  { value: 'Hi Melody',        label: '하이멜로디',     desc: '소녀 감성' },
  { value: 'Nanum Pen Script', label: '나눔펜스크립트', desc: '펜 손글씨' },
  { value: 'Single Day',       label: '싱글데이',       desc: '캐주얼 손글씨' },
];

// ── [변경 1] outline 제거 / [변경 2] blur 추가 ────────────────
const TEXT_EFFECTS = [
  { value: 'none',   label: '없음' },
  { value: 'shadow', label: '그림자' },
  { value: 'blur',   label: '글자 주변 흐림' },
  { value: 'glow',   label: '글로우' },
  { value: 'bg',     label: '반투명 배경' },
];

function useGoogleFonts(url) {
  useEffect(() => {
    if (document.querySelector(`link[href="${url}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }, [url]);
}

// ── [변경 1] borderColor, borderWidth 파라미터 추가 ──────────
function drawTextOnCanvas(ctx, text, x, y, fontSize, font, color, effect, borderColor, borderWidth) {
  ctx.font = `${fontSize}px "${font}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // 테두리 — 효과와 완전히 독립적으로 항상 먼저 그림
  if (borderWidth > 0) {
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderColor;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y);
  }

  if (effect === 'shadow') {
    ctx.shadowColor = 'rgba(0,0,0,0.75)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  } else if (effect === 'blur') {
    // [변경 2] 글자 주변 흐림 — 넓은 그림자를 여러 겹 깔고 위에 선명하게 한 번 더
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = fontSize * 0.6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = color;
    for (let i = 0; i < 3; i++) ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
    ctx.fillText(text, x, y);
  } else if (effect === 'glow') {
    ctx.shadowColor = color;
    ctx.shadowBlur = 24;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.fillText(text, x, y);
  } else if (effect === 'bg') {
    const metrics = ctx.measureText(text);
    const pad = fontSize * 0.28;
    ctx.fillStyle = 'rgba(0,0,0,0.48)';
    ctx.beginPath();
    ctx.rect(x - metrics.width / 2 - pad, y - fontSize / 2 - pad * 0.5, metrics.width + pad * 2, fontSize + pad);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  } else {
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

// ══════════════════════════════════════════════════════════════
// ThumbnailSection 컴포넌트
// ══════════════════════════════════════════════════════════════
const ThumbnailSection = ({ thumbnail, setThumbnail, formTitle, formStartDate, formEndDate }) => {
  useGoogleFonts(GOOGLE_FONTS_URL);

  const fileRef        = useRef();
  const canvasRef      = useRef();
  const bgBtnRef       = useRef();
  const txtBtnRef      = useRef();
  const fontSelectRef  = useRef();
  const dragging       = useRef(null);
  const dragOffset     = useRef({ ox: 0, oy: 0 });

  const [mode,          setMode]          = useState('upload');
  const [bgOpen,        setBgOpen]        = useState(false);
  const [txtOpen,       setTxtOpen]       = useState(false);
  const [bgPanelStyle,  setBgPanelStyle]  = useState({});
  const [txtPanelStyle, setTxtPanelStyle] = useState({});
  const [aiGenerating,  setAiGenerating]  = useState(false);

  // 배경 설정
  const [stylePrompt, setStylePrompt] = useState('');
  const [bgOpacity,   setBgOpacity]   = useState(1.0);

  // 글자 설정
  const [fontColor,   setFontColor]   = useState('#FFFFFF');
  const [customColor, setCustomColor] = useState('#FFFFFF');
  const [fontStyle,   setFontStyle]   = useState('Noto Sans KR');
  const [fontSize,    setFontSize]    = useState(72);
  const [textEffect,  setTextEffect]  = useState('shadow');

  // ── [변경 1] 글자 테두리 state ──────────────────────────────
  const [borderColor, setBorderColor] = useState('#000000');
  const [borderWidth, setBorderWidth] = useState(0);

  // 제목 수정 (더블클릭)
  const [titleText,        setTitleText]        = useState('');
  const [editingTitle,     setEditingTitle]     = useState(false);
  const [editingTitleVal,  setEditingTitleVal]  = useState('');

  // 텍스트 위치 (0~1 비율)
  const [titlePos, setTitlePos] = useState({ x: 0.5, y: 0.13 });
  const [datePos,  setDatePos]  = useState({ x: 0.5, y: 0.88 });

  const [rawBgBase64, setRawBgBase64] = useState(null);

  const preview = thumbnail ? URL.createObjectURL(thumbnail) : null;

  // ── Canvas 렌더 ───────────────────────────────────────────
  const renderCanvas = useCallback((bg, title, dr, color, size, font, effect, opacity, tPos, dPos, bColor, bWidth) => {
    const canvas = canvasRef.current;
    if (!canvas || !bg) return;
    document.fonts.ready.then(() => {
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      img.onload = () => {
        canvas.width  = img.width;
        canvas.height = img.height;
        const W = canvas.width;
        const H = canvas.height;

        ctx.globalAlpha = opacity;
        ctx.drawImage(img, 0, 0);
        ctx.globalAlpha = 1.0;

        drawTextOnCanvas(ctx, title || '행사 제목', W * tPos.x, H * tPos.y, size,                   font, color, effect, bColor, bWidth);
        drawTextOnCanvas(ctx, dr    || '기간',      W * dPos.x, H * dPos.y, Math.round(size * 0.5), font, color, effect, bColor, bWidth);
      };
      img.src = `data:image/png;base64,${bg}`;
    });
  }, []);

  // 설정 변경 시 자동 리렌더
  useEffect(() => {
    if (!rawBgBase64 || mode !== 'ai') return;
    const dr = (formStartDate && formEndDate) ? `${formStartDate} ~ ${formEndDate}` : '';
    const displayTitle = titleText || formTitle;
    renderCanvas(rawBgBase64, displayTitle, dr, fontColor, fontSize, fontStyle, textEffect, bgOpacity, titlePos, datePos, borderColor, borderWidth);
  }, [rawBgBase64, fontColor, fontSize, fontStyle, textEffect, bgOpacity, titlePos, datePos, borderColor, borderWidth, titleText, formTitle, formStartDate, formEndDate, renderCanvas, mode]);

  // ── Canvas 자유 드래그 ────────────────────────────────────
  const getRelPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) / rect.width, y: (clientY - rect.top) / rect.height };
  };

  const handleCanvasDown = (e) => {
    if (!rawBgBase64) return;
    const pos = getRelPos(e);
    const hitTitle = Math.abs(pos.y - titlePos.y) < 0.07 && Math.abs(pos.x - titlePos.x) < 0.45;
    const hitDate  = Math.abs(pos.y - datePos.y)  < 0.07 && Math.abs(pos.x - datePos.x) < 0.45;
    if (hitTitle) { dragging.current = 'title'; dragOffset.current = { ox: pos.x - titlePos.x, oy: pos.y - titlePos.y }; }
    else if (hitDate) { dragging.current = 'date'; dragOffset.current = { ox: pos.x - datePos.x, oy: pos.y - datePos.y }; }
  };

  const handleCanvasMove = (e) => {
    if (!dragging.current) return;
    e.preventDefault();
    const pos = getRelPos(e);
    const nx = Math.max(0.05, Math.min(0.95, pos.x - dragOffset.current.ox));
    const ny = Math.max(0.04, Math.min(0.96, pos.y - dragOffset.current.oy));
    if (dragging.current === 'title') setTitlePos({ x: nx, y: ny });
    else                              setDatePos ({ x: nx, y: ny });
  };

  const handleCanvasUp = () => { dragging.current = null; };

  // 더블클릭 → 제목 텍스트 편집 (기간은 편집 불가)
  const handleCanvasDoubleClick = (e) => {
    if (!rawBgBase64) return;
    const pos = getRelPos(e);
    const hitTitle = Math.abs(pos.y - titlePos.y) < 0.08 && Math.abs(pos.x - titlePos.x) < 0.45;
    if (hitTitle) {
      setEditingTitleVal(titleText || formTitle || '');
      setEditingTitle(true);
    }
  };

  // 가운데 정렬
  const handleCenterAlign = () => {
    setTitlePos((p) => ({ ...p, x: 0.5 }));
    setDatePos ((p) => ({ ...p, x: 0.5 }));
  };

  // ── 패널 열기 (오른쪽 fixed 배치) ───────────────────────────
  const openPanel = (type) => {
    const ref = type === 'bg' ? bgBtnRef : txtBtnRef;
    if (ref.current) {
      const rect  = ref.current.getBoundingClientRect();
      const w     = type === 'txt' ? 420 : 300;
      const style = { position: 'fixed', top: rect.top, left: rect.right + 8, zIndex: 9999, width: w };
      if (type === 'bg') { setBgPanelStyle(style);  setBgOpen(true);  setTxtOpen(false); }
      else               { setTxtPanelStyle(style); setTxtOpen(true); setBgOpen(false); }
    }
  };

  // ── AI 생성 ───────────────────────────────────────────────
  const handleAiGenerate = async () => {
    if (!formTitle)                     { alert('먼저 행사 제목을 입력해주세요!'); return; }
    if (!formStartDate || !formEndDate) { alert('먼저 행사 시작일과 종료일을 입력해주세요!'); return; }

    const dateRange    = `${formStartDate} ~ ${formEndDate}`;
    const textAreaHint = [
      `title area: centered around x=${Math.round(titlePos.x * 100)}%, y=${Math.round(titlePos.y * 100)}%`,
      `date area:  centered around x=${Math.round(datePos.x  * 100)}%, y=${Math.round(datePos.y  * 100)}%`,
    ].join(' / ');

    setAiGenerating(true);
    try {
      const displayTitle = titleText || formTitle;
      const base64 = await generateAiImage({ title: formTitle, dateRange, fontColor, fontSize, fontStyle, stylePrompt: stylePrompt || null, textAreaHint });
      setRawBgBase64(base64);
      renderCanvas(base64, displayTitle, dateRange, fontColor, fontSize, fontStyle, textEffect, bgOpacity, titlePos, datePos, borderColor, borderWidth);
    } catch (e) {
      alert(e.message || 'AI 이미지 생성에 실패했어요.');
    } finally {
      setAiGenerating(false);
    }
  };

  // rawBgBase64 변경 시 thumbnail 자동 저장
  useEffect(() => {
    if (!rawBgBase64 || mode !== 'ai') return;
    setTimeout(() => {
      canvasRef.current?.toBlob((blob) => {
        if (blob) setThumbnail(new File([blob], `thumb_${Date.now()}.png`, { type: 'image/png' }));
      }, 'image/png');
    }, 300);
  }, [rawBgBase64]); // eslint-disable-line

  // 글자 설정 변경 시 thumbnail 갱신
  useEffect(() => {
    if (!rawBgBase64 || mode !== 'ai') return;
    setTimeout(() => {
      canvasRef.current?.toBlob((blob) => {
        if (blob) setThumbnail(new File([blob], `thumb_${Date.now()}.png`, { type: 'image/png' }));
      }, 'image/png');
    }, 150);
  }, [fontColor, fontSize, fontStyle, textEffect, bgOpacity, titlePos, datePos, borderColor, borderWidth, titleText]); // eslint-disable-line

  // ── 공통 스타일 ───────────────────────────────────────────
  const selectSt = {
    width: '100%', boxSizing: 'border-box', padding: '7px 10px', borderRadius: 8,
    border: '1.5px solid #E9D5FF', fontSize: 12, outline: 'none',
    background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
  };

  const panelBase = {
    background: '#FAF5FF', border: '1.5px solid #E9D5FF', borderRadius: 14,
    padding: 16, boxShadow: '0 8px 32px rgba(99,60,180,0.18)',
    display: 'flex', flexDirection: 'column', gap: 14,
    maxHeight: '80vh', overflowY: 'auto',
  };

  return (
    <div style={{ width: 240, flexShrink: 0, position: 'relative' }}>
      <Label required>행사 썸네일</Label>

      {/* 모드 탭 */}
      <div style={{ display: 'flex', borderRadius: 10, border: '1.5px solid #E5E7EB', overflow: 'hidden', marginBottom: 10 }}>
        {[{ key: 'upload', label: '📁 직접 업로드' }, { key: 'ai', label: '✨ AI 생성' }].map(({ key, label }) => (
          <button key={key} onClick={() => setMode(key)}
            style={{ flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 12,
              background: mode === key ? '#FFD700' : '#fff', color: mode === key ? '#111' : '#9CA3AF' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── 직접 업로드 ── */}
      {mode === 'upload' && (
        <>
          <div onClick={() => fileRef.current.click()}
            style={{ width: '100%', height: 220, borderRadius: 12,
              border: `2px dashed ${preview ? '#FFD700' : '#E5E7EB'}`,
              background: preview ? 'transparent' : '#FFFBEB', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', position: 'relative' }}>
            {preview
              ? <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ textAlign: 'center', color: '#D97706' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>클릭하여 이미지 선택</div>
                </div>}
            {preview && (
              <button onClick={(e) => { e.stopPropagation(); setThumbnail(null); }}
                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.55)', color: '#fff',
                  border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: 11, fontWeight: 900 }}>✕</button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={(e) => setThumbnail(e.target.files[0] || null)} />
          <div style={{ marginTop: 8, fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>직접 준비한 썸네일을 업로드해요</div>
        </>
      )}

      {/* ── AI 생성 ── */}
      {mode === 'ai' && (
        <div>
          {/* Canvas 미리보기 */}
          <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden',
            border: '2px dashed #D8B4FE',
            background: rawBgBase64 ? 'transparent' : 'linear-gradient(135deg,#FAF5FF,#EDE9FE)',
            minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative' }}>
            {rawBgBase64
              ? <canvas ref={canvasRef}
                  style={{ width: '100%', height: 'auto', display: 'block', cursor: 'grab' }}
                  onMouseDown={handleCanvasDown} onMouseMove={handleCanvasMove}
                  onMouseUp={handleCanvasUp} onMouseLeave={handleCanvasUp}
                  onTouchStart={handleCanvasDown} onTouchMove={handleCanvasMove} onTouchEnd={handleCanvasUp}
                  onDoubleClick={handleCanvasDoubleClick}
                />
              : <div style={{ textAlign: 'center', color: '#8B5CF6', padding: 20 }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🤖</div>
                  <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.5 }}>AI가 제목과 날짜를<br />분석해 자동 생성해요</div>
                </div>}
            {aiGenerating && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(139,92,246,0.85)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div style={{ fontSize: 28 }}>🎨</div>
                <div style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>그리는 중...</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>약 10~20초 소요</div>
              </div>
            )}
            {/* 제목 더블클릭 편집 오버레이 */}
            {editingTitle && (
              <input
                autoFocus
                value={editingTitleVal}
                onChange={(e) => setEditingTitleVal(e.target.value)}
                onBlur={() => { setTitleText(editingTitleVal); setEditingTitle(false); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { setTitleText(editingTitleVal); setEditingTitle(false); } if (e.key === 'Escape') setEditingTitle(false); }}
                style={{
                  position: 'absolute',
                  left: `${titlePos.x * 100}%`,
                  top:  `${titlePos.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '84%', textAlign: 'center',
                  background: 'rgba(255,255,255,0.93)',
                  border: '2px solid #7C3AED', borderRadius: 8,
                  padding: '5px 10px', fontSize: 13, fontWeight: 800,
                  outline: 'none', zIndex: 10,
                  boxShadow: '0 2px 12px rgba(99,60,180,0.25)',
                  fontFamily: `"${fontStyle}", sans-serif`,
                }}
              />
            )}
          </div>

          {rawBgBase64 && (
            <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 10, color: '#8B5CF6', fontWeight: 600 }}>
                ✦ 드래그로 이동 · 더블클릭으로 제목 수정
              </div>
              <button onClick={handleCenterAlign}
                style={{ padding: '3px 9px', borderRadius: 6, border: '1.5px solid #E9D5FF',
                  background: '#FAF5FF', color: '#7C3AED', fontWeight: 800, fontSize: 10, cursor: 'pointer' }}>
                ⊞ 가운데
              </button>
            </div>
          )}

          {/* 배경 설정 / 글자 설정 버튼 */}
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button ref={bgBtnRef} onClick={() => openPanel('bg')}
              style={{ flex: 1, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 11,
                border: '1.5px solid #FDE68A', background: bgOpen ? '#FEF3C7' : '#FFFBEB',
                color: '#92400E', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              🖼️ 배경 설정
            </button>
            <button ref={txtBtnRef} onClick={() => openPanel('txt')}
              style={{ flex: 1, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 11,
                border: '1.5px solid #E9D5FF', background: txtOpen ? '#EDE9FE' : '#FAF5FF',
                color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              🔤 글자 설정
            </button>
          </div>

          <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 8, background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <div style={{ fontSize: 10, color: '#16A34A', fontWeight: 700, lineHeight: 1.6 }}>
              ✅ 글자 위치 먼저 정한 후 배경 생성하면<br />글자 자리를 피해서 배경을 만들어줘요!
            </div>
          </div>

          <button onClick={handleAiGenerate} disabled={aiGenerating}
            style={{ width: '100%', marginTop: 8, padding: '10px', borderRadius: 10, border: 'none',
              background: aiGenerating ? '#E5E7EB' : 'linear-gradient(135deg,#6366F1,#8B5CF6)',
              color: aiGenerating ? '#9CA3AF' : '#fff', fontWeight: 900, fontSize: 13,
              cursor: aiGenerating ? 'not-allowed' : 'pointer',
              boxShadow: aiGenerating ? 'none' : '0 4px 14px rgba(99,102,241,0.35)' }}>
            {aiGenerating ? '🎨 그리는 중...' : rawBgBase64 ? '🔄 다시 생성하기' : '✨ AI로 생성하기'}
          </button>
        </div>
      )}

      {/* 오버레이 */}
      {(bgOpen || txtOpen) && (
        <div onClick={() => { setBgOpen(false); setTxtOpen(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 9998 }} />
      )}

      {/* ══════════════════════════════════
          🖼️ 배경 설정 패널
      ══════════════════════════════════ */}
      {bgOpen && mode === 'ai' && (
        <div style={{ ...panelBase, ...bgPanelStyle }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#92400E' }}>🖼️ 배경 설정</div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#92400E', marginBottom: 5 }}>분위기 / 스타일 프롬프트</div>
            <textarea
              placeholder="예: 벚꽃 날리는 봄날, 밤하늘의 별빛 가득한 여름 축제..."
              value={stylePrompt} onChange={(e) => setStylePrompt(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8,
                border: '1.5px solid #FDE68A', fontSize: 12, minHeight: 72, resize: 'none',
                outline: 'none', fontFamily: 'inherit', background: '#fff', lineHeight: 1.5 }} />
            <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 3 }}>비워두면 제목에서 자동 유추해요</div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#92400E', marginBottom: 5 }}>
              배경 투명도 — {Math.round(bgOpacity * 100)}%
            </div>
            <input type="range" min={0} max={1} step={0.05} value={bgOpacity}
              onChange={(e) => setBgOpacity(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#F59E0B' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>
              <span>투명</span><span>원본</span>
            </div>
          </div>

          <button onClick={() => setBgOpen(false)}
            style={{ width: '100%', padding: '7px', borderRadius: 8, border: 'none',
              background: '#FEF3C7', color: '#92400E', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
            닫기
          </button>
        </div>
      )}

      {/* ══════════════════════════════════
          🔤 글자 설정 패널
      ══════════════════════════════════ */}
      {txtOpen && mode === 'ai' && (
        <div style={{ ...panelBase, ...txtPanelStyle }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#7C3AED' }}>🔤 글자 설정</div>

          {/* ── 글꼴 (전체 너비) + 스크롤 후 선택 시 맨 위 유지 ── */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#7C3AED', marginBottom: 5 }}>글꼴</div>
            <select
              ref={fontSelectRef}
              value={fontStyle}
              onChange={(e) => {
                setFontStyle(e.target.value);
                setTimeout(() => { if (fontSelectRef.current) fontSelectRef.current.scrollTop = 0; }, 0);
              }}
              size={4}
              style={{ ...selectSt, height: 'auto', padding: 0, overflowY: 'auto' }}>
              {FONT_OPTIONS.map(({ value, label, desc }) => (
                <option key={value} value={value}
                  style={{ padding: '5px 10px', fontFamily: `"${value}", sans-serif` }}>
                  {label} — {desc}
                </option>
              ))}
            </select>
            <div style={{ marginTop: 6, padding: '5px 10px', borderRadius: 8, background: '#EDE9FE',
              fontFamily: `"${fontStyle}", sans-serif`, fontSize: 14, color: '#5B21B6',
              textAlign: 'center', fontWeight: 700 }}>
              가나다 ABC 123
            </div>
          </div>

          {/* ── 2열 그리드: 색상 + 크기 ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* 글자 색상 */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#7C3AED', marginBottom: 5 }}>글자 색상</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                {FONT_COLOR_PRESETS.map(({ value, label }) => (
                  <button key={value} onClick={() => { setFontColor(value); setCustomColor(value); }} title={label}
                    style={{ width: 24, height: 24, borderRadius: '50%', outline: 'none',
                      border: fontColor === value ? '3px solid #7C3AED' : '2px solid #E5E7EB',
                      background: value, cursor: 'pointer',
                      boxShadow: value === '#FFFFFF' ? 'inset 0 0 0 1px #ddd' : 'none' }} />
                ))}
                <label style={{ cursor: 'pointer' }}>
                  <input type="color" value={customColor}
                    onChange={(e) => { setCustomColor(e.target.value); setFontColor(e.target.value); }}
                    style={{ width: 24, height: 24, border: '2px solid #E5E7EB', padding: 0, borderRadius: '50%', cursor: 'pointer' }} />
                </label>
              </div>
              <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: fontColor, border: '1px solid #E5E7EB' }} />
                <span style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace' }}>{fontColor}</span>
              </div>
            </div>

            {/* 글자 크기 */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#7C3AED', marginBottom: 5 }}>제목 크기</div>
              <input type="number" min={20} max={200} value={fontSize}
                onChange={(e) => setFontSize(Math.max(20, Math.min(200, Number(e.target.value))))}
                style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', borderRadius: 8,
                  border: '1.5px solid #E9D5FF', fontSize: 13, fontWeight: 800,
                  textAlign: 'center', outline: 'none', background: '#fff', marginBottom: 5 }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 3 }}>
                {[48, 64, 80, 96].map(v => (
                  <button key={v} onClick={() => setFontSize(v)}
                    style={{ padding: '3px 0', borderRadius: 5, cursor: 'pointer', outline: 'none',
                      border: fontSize === v ? '2px solid #7C3AED' : '1.5px solid #E5E7EB',
                      background: fontSize === v ? '#EDE9FE' : '#fff',
                      fontSize: 10, fontWeight: 700, color: fontSize === v ? '#7C3AED' : '#9CA3AF' }}>
                    {v}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 3 }}>날짜는 50% 자동</div>
            </div>
          </div>

          {/* ── 2열 그리드: 효과 + 테두리 ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* 텍스트 효과 */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#7C3AED', marginBottom: 5 }}>텍스트 효과</div>
              <select value={textEffect} onChange={(e) => setTextEffect(e.target.value)} style={selectSt}>
                {TEXT_EFFECTS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* 글자 테두리 */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#7C3AED', marginBottom: 5 }}>글자 테두리</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                {[0, 1, 2, 4, 6].map(v => (
                  <button key={v} onClick={() => setBorderWidth(v)}
                    style={{ padding: '3px 6px', borderRadius: 5, cursor: 'pointer', outline: 'none',
                      border: borderWidth === v ? '2px solid #7C3AED' : '1.5px solid #E5E7EB',
                      background: borderWidth === v ? '#EDE9FE' : '#fff',
                      fontSize: 10, fontWeight: 700,
                      color: borderWidth === v ? '#7C3AED' : '#9CA3AF' }}>
                    {v === 0 ? '없음' : `${v}`}
                  </button>
                ))}
              </div>
              {borderWidth > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {BORDER_COLOR_PRESETS.map(c => (
                    <button key={c} onClick={() => setBorderColor(c)}
                      style={{ width: 20, height: 20, borderRadius: '50%', background: c, cursor: 'pointer', outline: 'none',
                        border: borderColor === c ? '3px solid #7C3AED' : '2px solid #E5E7EB',
                        boxShadow: c === '#FFFFFF' ? 'inset 0 0 0 1px #ddd' : 'none' }} />
                  ))}
                  <label style={{ cursor: 'pointer' }}>
                    <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)}
                      style={{ width: 20, height: 20, border: '2px solid #E5E7EB', padding: 0, borderRadius: '50%', cursor: 'pointer' }} />
                  </label>
                </div>
              )}
            </div>
          </div>

          <button onClick={() => setTxtOpen(false)}
            style={{ width: '100%', padding: '7px', borderRadius: 8, border: 'none',
              background: '#EDE9FE', color: '#7C3AED', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
            닫기
          </button>
        </div>
      )}
    </div>
  );
};

// ── 멀티 이미지 업로드 ────────────────────────────────────────
const MultiImageUpload = ({ label, files, onChange }) => {
  const ref = useRef();
  return (
    <div>
      <Label>{label}</Label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {files.map((f, i) => (
          <div key={i} style={{ position: 'relative', width: 76, height: 76, borderRadius: 10, overflow: 'hidden', border: '1px solid #E5E7EB', flexShrink: 0 }}>
            <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button onClick={() => onChange(files.filter((_, idx) => idx !== i))}
              style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 9, fontWeight: 900 }}>✕</button>
          </div>
        ))}
        <div onClick={() => ref.current.click()}
          style={{ width: 76, height: 76, borderRadius: 10, border: '2px dashed #FFD700', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#D97706', fontSize: 22, fontWeight: 700, flexShrink: 0 }}>+</div>
      </div>
      <input ref={ref} type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={(e) => { onChange([...files, ...Array.from(e.target.files)]); e.target.value = ''; }} />
    </div>
  );
};

const TopicSelector = ({ label, required, hint, items, selected, onToggle, aiSuggested }) => (
  <div>
    <Label required={required}>
      {label} <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>{hint}</span>
      {aiSuggested && <AiBadge />}
    </Label>
    <Select value="" onChange={(e) => { if (e.target.value) onToggle(Number(e.target.value)); }}>
      <option value="">{label} 추가</option>
      {items.map((t) => (<option key={t.id} value={t.id} disabled={selected.includes(t.id)}>{selected.includes(t.id) ? '✓ ' : ''}{t.name}</option>))}
    </Select>
    {selected.length > 0 && (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        {selected.map((id) => {
          const t = items.find((h) => h.id === id);
          return (
            <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: '#FFD700', color: '#111', fontSize: 12, fontWeight: 800 }}>
              #{t?.name}
              <button onClick={() => onToggle(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 900, color: '#555', padding: 0, lineHeight: 1 }}>✕</button>
            </span>
          );
        })}
      </div>
    )}
  </div>
);

const HashtagSelector = ({ label, hint, items, selected, onToggle, aiSuggested }) => (
  <div>
    <Label>
      {label} <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>{hint}</span>
      {aiSuggested && <AiBadge />}
    </Label>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px 8px', padding: '14px 16px', borderRadius: 12, border: '1.5px solid #E5E7EB', background: '#FAFAFA' }}>
      {items.map((t) => {
        const checked = selected.includes(t.id);
        return (
          <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: checked ? '#111' : '#6B7280', cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={checked} onChange={() => onToggle(t.id)} style={{ accentColor: '#FFD700', width: 15, height: 15, cursor: 'pointer', flexShrink: 0 }} />
            {t.name}
          </label>
        );
      })}
    </div>
    {selected.length > 0 && (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        {selected.map((id) => {
          const t = items.find((h) => h.id === id);
          return (
            <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: '#E0F2FE', color: '#0369A1', fontSize: 12, fontWeight: 800 }}>
              #{t?.name}
              <button onClick={() => onToggle(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 900, color: '#0369A1', padding: 0, lineHeight: 1 }}>✕</button>
            </span>
          );
        })}
      </div>
    )}
  </div>
);

const checkStyle = { accentColor: '#FFD700', width: 16, height: 16, cursor: 'pointer' };

export default function EventHost() {
  const navigate = useNavigate();
  const [saving,    setSaving]    = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestedFields, setAiSuggestedFields] = useState({
    simpleExplain: false, category: false, topics: false, hashtags: false,
  });
  const today = new Date().toISOString().split('T')[0];
  const [thumbnail,       setThumbnail]       = useState(null);
  const [detailFiles,     setDetailFiles]     = useState([]);
  const [boothFiles,      setBoothFiles]      = useState([]);
  const [selectedTopics,  setSelectedTopics]  = useState([]);
  const [selectedHashtags,setSelectedHashtags]= useState([]);
  const [hasBooth,    setHasBooth]    = useState(false);
  const [hasFacility, setHasFacility] = useState(false);
  const [booths,  setBooths]  = useState([INIT_BOOTH()]);
  const [facis,   setFacis]   = useState([INIT_FACI()]);
  const [hostInfo,setHostInfo]= useState({ name: '', email: '', phone: '', profileImg: '' });

  const toggleTopic = (id) => {
    setAiSuggestedFields((p) => ({ ...p, topics: false }));
    setSelectedTopics((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) { alert('주제는 최대 5개까지 선택할 수 있어요.'); return prev; }
      return [...prev, id];
    });
  };
  const toggleHashtag = (id) => {
    setAiSuggestedFields((p) => ({ ...p, hashtags: false }));
    setSelectedHashtags((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) { alert('해시태그는 최대 5개까지 선택할 수 있어요.'); return prev; }
      return [...prev, id];
    });
  };
  const updateBooth = (i, f, v) => setBooths((p) => p.map((b, idx) => (idx === i ? { ...b, [f]: v } : b)));
  const updateFaci  = (i, f, v) => setFacis ((p) => p.map((x, idx) => (idx === i ? { ...x, [f]: v } : x)));

  useEffect(() => {
    apiJson().get('/api/user/me').then((res) => {
      const d = res.data?.data || res.data;
      if (!d || (!d.name && !d.email)) { alert('로그인이 필요한 서비스입니다.'); navigate('/login'); return; }
      setHostInfo({ name: d.name || '', email: d.email || '', phone: d.phone || '', profileImg: d.profileImg || '' });
      setLoading(false);
    }).catch(() => { alert('로그인이 필요한 서비스입니다.'); navigate('/login'); });
  }, [navigate]);

  const [form, setForm] = useState({
    title: '', simpleExplain: '', description: '', categoryId: '',
    startDate: '', endDate: '', startTime: '', endTime: '',
    zipCode: '', roadAddress: '', detailAdr: '', lotNumberAdr: '',
    detailAddressExtra: '', isFree: true, price: '', noLimit: false,
    capacity: '', startRecruit: '', endRecruit: '',
    boothStartRecruit: '', boothEndRecruit: '',
  });
  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const openAddressSearch = () => {
    if (!window.daum?.Postcode) { alert('주소 검색 스크립트가 로드되지 않았습니다.'); return; }
    new window.daum.Postcode({
      oncomplete: (data) => {
        setF('zipCode', data.zonecode);
        setF('roadAddress', data.roadAddress);
        setF('lotNumberAdr', data.jibunAddress);
        setF('detailAddressExtra', '');
        const sidoKey   = data.sido.substring(0, 2);
        const subRegions = REGION_DATA[sidoKey] || [];
        const matched   = subRegions.find((r) => data.sigungu.includes(r.name) || r.name.includes(data.sigungu.split(' ')[0]));
        setF('regionId', matched ? matched.id : CITY_IDS[sidoKey]);
      },
    }).open();
  };

  const minEndDate       = form.startDate || today;
  const minEndRecruit    = form.startRecruit || today;
  const maxEndRecruit    = dayBefore(form.startDate) || '';
  const minBoothEndRecruit = form.boothStartRecruit || '';
  const minEndTime       = form.startDate === form.endDate ? form.startTime || '' : '';
  const boothMaxDate     = dayBefore(form.startRecruit);
  const boothStartIsPast = form.boothStartRecruit && form.boothStartRecruit < today;
  const boothEndIsPast   = form.boothEndRecruit   && form.boothEndRecruit   < today;
  const handleBoothToggle = (v) => { setHasBooth(v); if (!v) setHasFacility(false); };

  const handleAiSuggest = async () => {
    if (!form.title.trim())       { alert('먼저 행사 제목을 입력해주세요.'); return; }
    if (!form.description.trim()) { alert('먼저 상세 설명을 입력해주세요.'); return; }
    setAiLoading(true);
    try {
      const result = await suggestTags({ title: form.title, description: form.description });
      if (result.simpleExplain) { setF('simpleExplain', result.simpleExplain); setAiSuggestedFields((p) => ({ ...p, simpleExplain: true })); }
      if (result.categoryId)    { setF('categoryId', String(result.categoryId)); setAiSuggestedFields((p) => ({ ...p, category: true })); }
      if (result.topicIds?.length > 0) { setSelectedTopics(result.topicIds.slice(0, 5)); setAiSuggestedFields((p) => ({ ...p, topics: true })); }
      if (result.hashtagNames?.length > 0) {
        const matchedIds = result.hashtagNames.map((name) => HASHTAGS.find((h) => h.name === name)?.id).filter(Boolean).slice(0, 5);
        if (matchedIds.length > 0) { setSelectedHashtags(matchedIds); setAiSuggestedFields((p) => ({ ...p, hashtags: true })); }
      }
    } catch (e) {
      alert(e.message || 'AI 분석에 실패했어요. 다시 시도해주세요.');
    } finally {
      setAiLoading(false);
    }
  };

  const validate = () => {
    if (!thumbnail)                  { alert('썸네일 이미지를 등록해주세요.'); return false; }
    if (!form.title.trim())          { alert('행사 제목을 입력해주세요.'); return false; }
    if (!form.simpleExplain.trim())  { alert('한줄 설명을 입력해주세요.'); return false; }
    if (!form.startDate)             { alert('행사 시작일을 선택해주세요.'); return false; }
    if (!form.endDate)               { alert('행사 종료일을 선택해주세요.'); return false; }
    if (!form.startRecruit)          { alert('모집 시작일을 선택해주세요.'); return false; }
    if (!form.endRecruit)            { alert('모집 종료일을 선택해주세요.'); return false; }
    if (!form.roadAddress)           { alert('주소 찾기를 통해 주소를 입력해주세요.'); return false; }
    if (!form.detailAddressExtra.trim()) { alert('상세 주소를 입력해주세요.'); return false; }
    if (/^\d+$/.test(form.detailAddressExtra.trim())) { alert('상세 주소를 올바르게 입력해주세요.\n예) 3층, B동 201호, 광장 내'); return false; }
    if (!form.categoryId)            { alert('카테고리를 선택해주세요.'); return false; }
    if (selectedTopics.length === 0) { alert('주제(Topic)를 1개 이상 선택해주세요.'); return false; }
    if (!form.isFree && !form.price) { alert('참가비를 입력해주세요.'); return false; }
    if (!form.noLimit && !form.capacity) { alert('모집 인원을 입력하거나 제한없음을 선택해주세요.'); return false; }
    if (hasBooth) {
      if (form.boothEndRecruit && form.startRecruit && form.boothEndRecruit >= form.startRecruit) {
        alert(`부스 모집 종료일(${form.boothEndRecruit})은 행사 참여 모집 시작일(${form.startRecruit}) 이전이어야 해요.`);
        return false;
      }
      for (let i = 0; i < booths.length; i++) {
        if (!booths[i].boothName.trim()) { alert(`부스 ${i + 1}의 부스명을 입력해주세요.`); return false; }
        if (booths[i].boothPrice === '')  { alert(`부스 ${i + 1}의 금액을 입력해주세요.`); return false; }
        if (!booths[i].totalCount)        { alert(`부스 ${i + 1}의 수량을 입력해주세요.`); return false; }
      }
    }
    if (hasFacility) {
      for (let i = 0; i < facis.length; i++) {
        if (!facis[i].faciName.trim())  { alert(`부대시설 ${i + 1}의 시설명을 입력해주세요.`); return false; }
        if (facis[i].faciPrice === '')   { alert(`부대시설 ${i + 1}의 금액을 입력해주세요.`); return false; }
        if (!facis[i].faciUnit.trim())   { alert(`부대시설 ${i + 1}의 단위를 입력해주세요.`); return false; }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const eventInfo = {
        ...form,
        detailAdr: `${form.roadAddress} ${form.detailAddressExtra}`.trim(),
        price:     form.isFree ? 0 : Number(form.price),
        capacity:  form.noLimit ? null : Number(form.capacity),
        category:  { categoryId: Number(form.categoryId) },
        region:    { regionId:   Number(form.regionId) },
        topicIds:  selectedTopics.join(','),
        hashtagIds:selectedHashtags.join(','),
        hasBooth, hasFacility,
      };
      delete eventInfo.categoryId; delete eventInfo.regionId;
      const eventData = {
        eventInfo,
        booths:     hasBooth    ? booths.map((b) => ({ ...b, boothPrice: Number(b.boothPrice), totalCount: Number(b.totalCount) })) : [],
        facilities: hasFacility ? facis.map((f)  => ({ ...f, faciPrice:  Number(f.faciPrice),  totalCount: f.hasCount ? Number(f.totalCount) : null })) : [],
      };
      const newId = await createEvent({ eventData, thumbnail, detailFiles, boothFiles });
      alert('행사가 등록되었습니다. 확인 과정을 거친 뒤 공개됩니다.');
      navigate(`/events/${newId}`);
    } catch (e) {
      alert(e.message || '저장에 실패했어요.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: '#F9FAFB' }} />;

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Pretendard',-apple-system,sans-serif" }}>
      <Header />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 80px' }}>
        <div style={{ marginBottom: 22 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#111' }}>행사 만들기</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9CA3AF' }}>
            <span style={{ color: '#EF4444', fontWeight: 800 }}>*</span> 표시는 필수 항목이에요.
          </p>
        </div>

        {/* SECTION 1 */}
        <SectionCard step="1" title="행사 기본 정보" icon="📋">
          <div style={{ display: 'flex', gap: 20, marginBottom: 18 }}>
            <ThumbnailSection
              thumbnail={thumbnail}
              setThumbnail={setThumbnail}
              formTitle={form.title}
              formStartDate={form.startDate}
              formEndDate={form.endDate}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <Label required>제목</Label>
                <Input placeholder="행사 제목을 입력하세요" value={form.title} onChange={(e) => setF('title', e.target.value)} />
              </div>
              <G2>
                <div>
                  <Label required>행사 시작일</Label>
                  <Input type="date" value={form.startDate} min={today}
                    onChange={(e) => {
                      setF('startDate', e.target.value);
                      if (form.endDate && e.target.value > form.endDate) setF('endDate', '');
                      const newMax = dayBefore(e.target.value);
                      if (newMax && form.endRecruit && form.endRecruit > newMax) setF('endRecruit', '');
                    }} />
                </div>
                <div>
                  <Label required>행사 종료일</Label>
                  <Input type="date" value={form.endDate} min={minEndDate} onChange={(e) => setF('endDate', e.target.value)} />
                </div>
              </G2>
              <G2>
                <div>
                  <Label>행사 시작 시간</Label>
                  <Input type="time" value={form.startTime}
                    onChange={(e) => {
                      setF('startTime', e.target.value);
                      if (form.startDate === form.endDate && form.endTime && e.target.value > form.endTime) setF('endTime', '');
                    }} />
                </div>
                <div>
                  <Label>행사 종료 시간</Label>
                  <Input type="time" value={form.endTime} min={minEndTime} onChange={(e) => setF('endTime', e.target.value)} />
                </div>
              </G2>
            </div>
          </div>

          <Divider />

          <div style={{ padding: '14px 16px', background: '#FFFBEB', borderRadius: 12, border: '1px solid #FDE68A', marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#92400E', marginBottom: 4 }}>📅 행사 참여 모집 기간</div>
            {form.startDate && (
              <div style={{ fontSize: 11, color: '#B45309', marginBottom: 10 }}>
                모집 종료일은 행사 시작일 하루 전({dayBefore(form.startDate)})까지 가능해요.
              </div>
            )}
            <G2>
              <div>
                <Label required>모집 시작일</Label>
                <Input type="date" value={form.startRecruit} min={today} max={maxEndRecruit || undefined}
                  onChange={(e) => {
                    setF('startRecruit', e.target.value);
                    if (form.endRecruit && e.target.value > form.endRecruit) setF('endRecruit', '');
                    if (form.boothStartRecruit && e.target.value <= form.boothStartRecruit) setF('boothStartRecruit', '');
                    if (form.boothEndRecruit   && e.target.value <= form.boothEndRecruit)   setF('boothEndRecruit', '');
                  }} />
              </div>
              <div>
                <Label required>모집 종료일</Label>
                <Input type="date" value={form.endRecruit} min={minEndRecruit} max={maxEndRecruit || undefined}
                  onChange={(e) => setF('endRecruit', e.target.value)} />
              </div>
            </G2>
          </div>

          <div>
            <Label required>행사 장소</Label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Input placeholder="주소 찾기를 이용해주세요" value={form.roadAddress} readOnly style={{ background: '#F9FAFB', cursor: 'default', flex: 1 }} />
              <button onClick={openAddressSearch}
                style={{ padding: '10px 18px', borderRadius: 10, border: 'none', whiteSpace: 'nowrap', background: '#FFD700', color: '#111', fontWeight: 900, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>
                🔍 주소 찾기
              </button>
            </div>
            {form.zipCode && (
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>
                📮 {form.zipCode}{form.lotNumberAdr && ` · 지번: ${form.lotNumberAdr}`}
              </div>
            )}
            <Input 
              placeholder="상세 주소를 입력하세요 (예: 3층, B동 201호, 광장 내) *필수" 
              value={form.detailAddressExtra} 
              onChange={(e) => setF('detailAddressExtra', e.target.value)} 
            />
            {form.roadAddress && form.detailAddressExtra && (
              <div style={{ marginTop: 8, padding: '8px 12px', background: '#F0FDF4', borderRadius: 10, fontSize: 12, color: '#15803D', fontWeight: 700 }}>
                📍 저장될 주소: {form.roadAddress} {form.detailAddressExtra}
              </div>
            )}
          </div>
        </SectionCard>

        {/* SECTION 2 */}
        <SectionCard step="2" title="상세 설명 / 준비물 / 유의사항" icon="📝">
          <div style={{ marginBottom: 16 }}>
            <Label>상세설명 / 준비물 / 유의사항</Label>
            <Textarea rows={6} placeholder="행사 상세 설명, 준비물, 유의사항 등을 자유롭게 작성해주세요." value={form.description} onChange={(e) => setF('description', e.target.value)} />
          </div>
          <MultiImageUpload label="상세 이미지 (여러 장 가능)" files={detailFiles} onChange={setDetailFiles} />
        </SectionCard>

        {/* AI 분석 버튼 */}
        <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <button onClick={handleAiSuggest} disabled={aiLoading}
            style={{
              padding: '14px 44px', borderRadius: 50,
              background: aiLoading ? '#E5E7EB' : 'linear-gradient(135deg,#6366F1,#8B5CF6)',
              border: 'none', color: aiLoading ? '#9CA3AF' : '#fff',
              fontWeight: 900, fontSize: 15, cursor: aiLoading ? 'not-allowed' : 'pointer',
              boxShadow: aiLoading ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
              display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s',
            }}>
            {aiLoading ? '✨ AI가 분석 중이에요...' : '✨ AI로 추가 정보 자동 입력하기'}
          </button>
          <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>
            제목과 상세설명을 입력하면 AI가 카테고리/주제/해시태그를 자동으로 추천해줘요
          </span>
        </div>

        {/* SECTION 3 */}
        <SectionCard step="3" title="추가 정보" icon="📌">
          <div style={{ marginBottom: 18 }}>
            <Label required>
              한 줄 설명
              {aiSuggestedFields.simpleExplain && <AiBadge />}
            </Label>
            <Input
              placeholder="행사를 한 줄로 소개해주세요"
              value={form.simpleExplain}
              onChange={(e) => { setF('simpleExplain', e.target.value); setAiSuggestedFields((p) => ({ ...p, simpleExplain: false })); }}
              style={aiSuggestedFields.simpleExplain ? { borderColor: '#8B5CF6', background: '#FAF5FF' } : {}}
            />
          </div>
          <Divider />
          <G2 style={{ marginBottom: 18 }}>
            <div>
              <Label required>
                카테고리
                {aiSuggestedFields.category && <AiBadge />}
              </Label>
              <Select value={form.categoryId}
                onChange={(e) => { setF('categoryId', e.target.value); setAiSuggestedFields((p) => ({ ...p, category: false })); }}
                style={aiSuggestedFields.category ? { borderColor: '#8B5CF6', background: '#FAF5FF' } : {}}>
                <option value="">선택</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <TopicSelector label="주제 (Topic)" required hint="(최대 5가지)"
              items={TOPICS} selected={selectedTopics} onToggle={toggleTopic} aiSuggested={aiSuggestedFields.topics} />
          </G2>
          <Divider />
          <div style={{ marginBottom: 18 }}>
            <HashtagSelector label="해시태그" hint="(분위기/감성 태그, 최대 5가지)"
              items={HASHTAGS} selected={selectedHashtags} onToggle={toggleHashtag} aiSuggested={aiSuggestedFields.hashtags} />
          </div>
          <Divider />
          <G2>
            <div>
              <Label required>유료 / 무료</Label>
              <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                {[{ v: true, l: '무료' }, { v: false, l: '유료' }].map(({ v, l }) => (
                  <label key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#374151' }}>
                    <input type="radio" name="isFree" checked={form.isFree === v} onChange={() => setF('isFree', v)} style={checkStyle} />
                    {l}
                  </label>
                ))}
              </div>
              {!form.isFree && <Input type="number" min={0} placeholder="참가비 금액 (원)" value={form.price} onChange={(e) => setF('price', e.target.value)} />}
              {form.isFree  && <div style={{ padding: '9px 13px', background: '#F0FDF4', borderRadius: 10, fontSize: 13, color: '#16A34A', fontWeight: 700 }}>0 원</div>}
            </div>
            <div>
              <Label required>모집 정원</Label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                <input type="checkbox" checked={form.noLimit} onChange={(e) => setF('noLimit', e.target.checked)} style={checkStyle} />
                제한 없음
              </label>
              {!form.noLimit && <Input type="number" min={1} placeholder="모집 인원 수" value={form.capacity} onChange={(e) => setF('capacity', e.target.value)} />}
              {form.noLimit  && <div style={{ padding: '9px 13px', background: '#F0FDF4', borderRadius: 10, fontSize: 13, color: '#16A34A', fontWeight: 700 }}>제한 없음</div>}
            </div>
          </G2>
        </SectionCard>

        {/* SECTION 4 */}
        <SectionCard step="4" title="주최자 정보" icon="🏢">
          <div style={{ padding: '14px 16px', background: '#F9FAFB', borderRadius: 12, border: '1px solid #E5E7EB' }}>
            {hostInfo.profileImg && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <img src={photoImageUrl(hostInfo.profileImg)} alt="프로필"
                  style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E5E7EB' }}
                  onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}
            <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 700, marginBottom: 12 }}>
              로그인한 계정 정보로 자동 설정됩니다. 수정이 필요하면 마이페이지에서 변경해주세요.
            </div>
            <G2>
              <div><Label>주최자/기업 명</Label><Input value={hostInfo.name  || '(이름 없음)'}     readOnly style={{ background: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed' }} /></div>
              <div><Label>전화번호</Label>      <Input value={hostInfo.phone || '(전화번호 없음)'} readOnly style={{ background: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed' }} /></div>
            </G2>
            <div style={{ marginTop: 12 }}>
              <Label>이메일</Label>
              <Input value={hostInfo.email || '(이메일 없음)'} readOnly style={{ background: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed' }} />
            </div>
          </div>
        </SectionCard>

        {/* SECTION 5 */}
        <SectionCard step="5" title="부스 & 부대시설" icon="🏪">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F9FAFB', borderRadius: 12, marginBottom: hasBooth ? 16 : 0 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>부스 운영</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>행사에서 부스를 모집하나요?</div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
              <input type="checkbox" checked={hasBooth} onChange={(e) => handleBoothToggle(e.target.checked)} style={checkStyle} />운영
            </label>
          </div>

          {hasBooth && (
            <>
              <div style={{ padding: '14px 16px', background: '#FFFBEB', borderRadius: 12, border: '1px solid #FDE68A', marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#92400E', marginBottom: 4 }}>📅 부스 모집 기간</div>
                {form.startRecruit
                  ? <div style={{ fontSize: 11, color: '#B45309', marginBottom: 10 }}>⚠️ 부스 모집 기간은 참여 모집 <strong>시작일({form.startRecruit}) 이전</strong>이어야 해요.</div>
                  : <div style={{ fontSize: 11, color: '#B45309', marginBottom: 10 }}>⚠️ 먼저 행사 참여 모집 시작일을 설정해주세요.</div>}
                <G2>
                  <div>
                    <Label>부스 모집 시작일</Label>
                    <Input type="date" value={form.boothStartRecruit} max={boothMaxDate}
                      onChange={(e) => { setF('boothStartRecruit', e.target.value); if (form.boothEndRecruit && e.target.value > form.boothEndRecruit) setF('boothEndRecruit', ''); }} />
                    {boothStartIsPast && <div style={{ marginTop: 5, fontSize: 11, color: '#DC2626', fontWeight: 700 }}>⚠️ 오늘 이전 날짜입니다.</div>}
                  </div>
                  <div>
                    <Label>부스 모집 종료일</Label>
                    <Input type="date" value={form.boothEndRecruit} min={minBoothEndRecruit} max={boothMaxDate}
                      onChange={(e) => setF('boothEndRecruit', e.target.value)} />
                    {boothEndIsPast && <div style={{ marginTop: 5, fontSize: 11, color: '#DC2626', fontWeight: 700 }}>⚠️ 오늘 이전 날짜입니다.</div>}
                  </div>
                </G2>
              </div>

              {booths.map((b, i) => (
                <div key={i} style={{ padding: '16px', background: '#F9FAFB', borderRadius: 12, border: '1px solid #E5E7EB', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: '#9CA3AF' }}>BOOTH {i + 1}</span>
                    {booths.length > 1 && <button onClick={() => setBooths((p) => p.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 12, fontWeight: 800 }}>✕ 삭제</button>}
                  </div>
                  <G2>
                    <div><Label required>부스명</Label><Input placeholder="부스명" value={b.boothName} onChange={(e) => updateBooth(i, 'boothName', e.target.value)} /></div>
                    <div><Label>크기</Label><Input placeholder="예: 2m×2m" value={b.boothSize} onChange={(e) => updateBooth(i, 'boothSize', e.target.value)} /></div>
                    <div><Label required>금액 (원)</Label><Input type="number" min={0} placeholder="0 = 무료" value={b.boothPrice} onChange={(e) => updateBooth(i, 'boothPrice', e.target.value)} /></div>
                    <div><Label required>수량</Label><Input type="number" min={1} placeholder="총 부스 수량" value={b.totalCount} onChange={(e) => updateBooth(i, 'totalCount', e.target.value)} /></div>
                  </G2>
                  <div style={{ marginTop: 10 }}><Label>비고</Label><Input placeholder="부스 관련 추가 안내 (선택)" value={b.boothNote} onChange={(e) => updateBooth(i, 'boothNote', e.target.value)} /></div>
                </div>
              ))}
              <button onClick={() => setBooths((p) => [...p, INIT_BOOTH()])} style={{ width: '100%', padding: '10px', borderRadius: 12, marginBottom: 16, border: '2px dashed #FFD700', background: '#FFFBEB', color: '#D97706', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>+ 부스 추가</button>

              <MultiImageUpload label="부스 관련 이미지" files={boothFiles} onChange={setBoothFiles} />
              <Divider />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F9FAFB', borderRadius: 12, marginBottom: hasFacility ? 16 : 0 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>부대시설 운영</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>전기/수도/책상/의자</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
                  <input type="checkbox" checked={hasFacility} onChange={(e) => setHasFacility(e.target.checked)} style={checkStyle} />운영
                </label>
              </div>

              {hasFacility && (
                <>
                  {facis.map((f, i) => (
                    <div key={i} style={{ padding: '16px', background: '#F9FAFB', borderRadius: 12, border: '1px solid #E5E7EB', marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 900, color: '#9CA3AF' }}>시설 {i + 1}</span>
                        {facis.length > 1 && <button onClick={() => setFacis((p) => p.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 12, fontWeight: 800 }}>✕ 삭제</button>}
                      </div>
                      <G2>
                        <div><Label required>시설명</Label><Input placeholder="예: 전기, 인터넷, 의자" value={f.faciName} onChange={(e) => updateFaci(i, 'faciName', e.target.value)} /></div>
                        <div><Label required>단위</Label><Input placeholder="예: 회, 개, 시간" value={f.faciUnit} onChange={(e) => updateFaci(i, 'faciUnit', e.target.value)} /></div>
                        <div><Label required>금액 (원)</Label><Input type="number" min={0} placeholder="0 = 무료" value={f.faciPrice} onChange={(e) => updateFaci(i, 'faciPrice', e.target.value)} /></div>
                        <div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, color: '#374151', cursor: 'pointer', marginTop: 22 }}>
                            <input type="checkbox" checked={f.hasCount} onChange={(e) => updateFaci(i, 'hasCount', e.target.checked)} style={checkStyle} />수량 관리
                          </label>
                          {f.hasCount && <Input type="number" min={1} placeholder="총 수량" value={f.totalCount} onChange={(e) => updateFaci(i, 'totalCount', e.target.value)} style={{ marginTop: 6 }} />}
                        </div>
                      </G2>
                    </div>
                  ))}
                  <button onClick={() => setFacis((p) => [...p, INIT_FACI()])} style={{ width: '100%', padding: '10px', borderRadius: 12, border: '2px dashed #FFD700', background: '#FFFBEB', color: '#D97706', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>+ 시설 추가</button>
                </>
              )}
            </>
          )}
        </SectionCard>

        {/* 하단 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
          <button onClick={() => navigate(-1)} style={{ padding: '12px 28px', borderRadius: 13, border: '1.5px solid #E5E7EB', background: '#fff', color: '#6B7280', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>취소</button>
          <button onClick={handleSubmit} disabled={saving}
            style={{ padding: '12px 40px', borderRadius: 13, background: saving ? '#E5E7EB' : 'linear-gradient(135deg,#FFD700,#FFC200)', border: 'none', color: saving ? '#9CA3AF' : '#111', fontWeight: 900, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 14px rgba(255,215,0,0.45)' }}>
            {saving ? '등록 중...' : '행사 등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
