// src/features/event/host/pages/EventHost.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../api/EventHostApi';
import Header from '../../../../shared/components/common/Header';
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

const INIT_BOOTH = () => ({ boothName: '', boothSize: '', boothPrice: '', boothNote: '', totalCount: '' });
const INIT_FACI = () => ({ faciName: '', faciPrice: '', faciUnit: '', hasCount: false, totalCount: '' });

// ✅ 부스 모집 마감일 max 계산 헬퍼 (Issue 1)
const dayBefore = (dateStr) => {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const PHOTO_BASE = 'http://localhost:8080/upload_files/photo';

// ─── 공통 UI ──────────────────────────────────────────────────
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
    onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
    {...props} />
);
const Textarea = ({ style, ...props }) => (
  <textarea style={{ ...inputBase, resize: 'vertical', minHeight: 100, lineHeight: 1.6, ...style }}
    onFocus={(e) => (e.target.style.borderColor = '#FFD700')}
    onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
    {...props} />
);
const Select = ({ style, children, ...props }) => (
  <select style={{ ...inputBase, cursor: 'pointer', ...style }}
    onFocus={(e) => (e.target.style.borderColor = '#FFD700')}
    onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
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

const ImageUploadBox = ({ label, required, file, onChange, style }) => {
  const ref = useRef();
  const preview = file ? URL.createObjectURL(file) : null;
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div onClick={() => ref.current.click()}
        style={{ width: '100%', height: 150, borderRadius: 12, border: `2px dashed ${preview ? '#FFD700' : '#E5E7EB'}`, background: preview ? 'transparent' : '#FFFBEB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', transition: 'all 0.2s', ...style }}
        onMouseEnter={(e) => { if (!preview) e.currentTarget.style.borderColor = '#FFD700'; }}
        onMouseLeave={(e) => { if (!preview) e.currentTarget.style.borderColor = '#E5E7EB'; }}>
        {preview ? (
          <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ textAlign: 'center', color: '#D97706' }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>🖼️</div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>'여기'를 눌러</div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>이미지를 선택하세요</div>
          </div>
        )}
        {preview && (
          <button onClick={(e) => { e.stopPropagation(); onChange(null); }}
            style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: 11, fontWeight: 900 }}>✕</button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onChange(e.target.files[0] || null)} />
    </div>
  );
};

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
      <input ref={ref} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => { onChange([...files, ...Array.from(e.target.files)]); e.target.value = ''; }} />
    </div>
  );
};

const TopicSelector = ({ label, required, hint, items, selected, onToggle, badgeColor = '#FFD700', badgeTextColor = '#111' }) => (
  <div>
    <Label required={required}>{label} <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>{hint}</span></Label>
    <Select value="" onChange={(e) => { if (e.target.value) onToggle(Number(e.target.value)); }}>
      <option value="">{label} 추가</option>
      {items.map((t) => (<option key={t.id} value={t.id} disabled={selected.includes(t.id)}>{selected.includes(t.id) ? '✓ ' : ''}{t.name}</option>))}
    </Select>
    {selected.length > 0 && (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        {selected.map((id) => {
          const t = items.find((h) => h.id === id);
          return (
            <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: badgeColor, color: badgeTextColor, fontSize: 12, fontWeight: 800 }}>
              #{t?.name}
              <button onClick={() => onToggle(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 900, color: '#555', padding: 0, lineHeight: 1 }}>✕</button>
            </span>
          );
        })}
      </div>
    )}
  </div>
);

const HashtagSelector = ({ label, hint, items, selected, onToggle, badgeColor = '#E0F2FE', badgeTextColor = '#0369A1' }) => (
  <div>
    <Label>{label} <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>{hint}</span></Label>
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
            <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: badgeColor, color: badgeTextColor, fontSize: 12, fontWeight: 800 }}>
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

// ─── 메인 ──────────────────────────────────────────────────────
export default function EventHost() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  const [thumbnail, setThumbnail] = useState(null);
  const [detailFiles, setDetailFiles] = useState([]);
  const [boothFiles, setBoothFiles] = useState([]);

  const [selectedTopics, setSelectedTopics] = useState([]);
  const toggleTopic = (id) => {
    setSelectedTopics((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) { alert('주제는 최대 5개까지 선택할 수 있어요.'); return prev; }
      return [...prev, id];
    });
  };

  const [selectedHashtags, setSelectedHashtags] = useState([]);
  const toggleHashtag = (id) => {
    setSelectedHashtags((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) { alert('해시태그는 최대 5개까지 선택할 수 있어요.'); return prev; }
      return [...prev, id];
    });
  };

  const [hasBooth, setHasBooth] = useState(false);
  const [hasFacility, setHasFacility] = useState(false);
  const [booths, setBooths] = useState([INIT_BOOTH()]);
  const [facis, setFacis] = useState([INIT_FACI()]);
  const updateBooth = (i, f, v) => setBooths((p) => p.map((b, idx) => (idx === i ? { ...b, [f]: v } : b)));
  const updateFaci = (i, f, v) => setFacis((p) => p.map((x, idx) => (idx === i ? { ...x, [f]: v } : x)));

  // ✅ Issue 6: profileImg 포함
  const [hostInfo, setHostInfo] = useState({ name: '', email: '', phone: '', profileImg: '' });

  useEffect(() => {
    apiJson()
      .get('/api/user/me')
      .then((res) => {
        const d = res.data?.data || res.data;
        if (!d || (!d.name && !d.email)) {
          alert('로그인이 필요한 서비스입니다.');
          navigate('/login');
          return;
        }
        setHostInfo({
          name: d.name || '',
          email: d.email || '',
          phone: d.phone || '',
          profileImg: d.profileImg || '',   // ✅ Issue 6
        });
        setLoading(false);
      })
      .catch((err) => {
        console.warn('주최자 정보 로딩 실패:', err);
        alert('로그인이 필요한 서비스입니다.');
        navigate('/login');
      });
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
    if (!window.daum?.Postcode) {
      alert('주소 검색 스크립트가 로드되지 않았습니다.\nindex.html <head>에 아래를 추가해주세요:\n<script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>');
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        setF('zipCode', data.zonecode);
        setF('roadAddress', data.roadAddress);
        setF('lotNumberAdr', data.jibunAddress);
        setF('detailAddressExtra', '');
        const sidoKey = data.sido.substring(0, 2);
        const subRegions = REGION_DATA[sidoKey] || [];
        const matched = subRegions.find((r) => data.sigungu.includes(r.name) || r.name.includes(data.sigungu.split(' ')[0]));
        setF('regionId', matched ? matched.id : CITY_IDS[sidoKey]);
      },
    }).open();
  };

  const minEndDate = form.startDate || today;
  const minEndRecruit = form.startRecruit || today;
  const maxEndRecruit = form.startDate || '';
  const minBoothEndRecruit = form.boothStartRecruit || '';
  const minEndTime = form.startDate === form.endDate ? form.startTime || '' : '';

  // ✅ Issue 1: 부스 모집 max = 참여 모집 시작일 - 1일
  const boothMaxDate = dayBefore(form.startRecruit);

  const handleBoothToggle = (v) => {
    setHasBooth(v);
    if (!v) setHasFacility(false);
  };

  const validate = () => {
    if (!thumbnail) { alert('썸네일 이미지를 등록해주세요.'); return false; }
    if (!form.title.trim()) { alert('행사 제목을 입력해주세요.'); return false; }
    if (!form.simpleExplain.trim()) { alert('한줄 설명을 입력해주세요.'); return false; }
    if (!form.startDate) { alert('행사 시작일을 선택해주세요.'); return false; }
    if (!form.endDate) { alert('행사 종료일을 선택해주세요.'); return false; }
    if (!form.startRecruit) { alert('모집 시작일을 선택해주세요.'); return false; }
    if (!form.endRecruit) { alert('모집 종료일을 선택해주세요.'); return false; }
    if (!form.roadAddress) { alert('주소 찾기를 통해 주소를 입력해주세요.'); return false; }
    if (!form.detailAddressExtra.trim()) { alert('상세 주소를 입력해주세요.'); return false; }
    if (!form.categoryId) { alert('카테고리를 선택해주세요.'); return false; }
    if (selectedTopics.length === 0) { alert('주제(Topic)를 1개 이상 선택해주세요.'); return false; }
    if (!form.isFree && !form.price) { alert('참가비를 입력해주세요.'); return false; }
    if (!form.noLimit && !form.capacity) { alert('모집 인원을 입력하거나 제한없음을 선택해주세요.'); return false; }
    if (hasBooth) {
      // ✅ Issue 1: 부스 모집 종료일은 참여 모집 시작일 이전
      if (form.boothEndRecruit && form.startRecruit && form.boothEndRecruit >= form.startRecruit) {
        alert(`부스 모집 종료일(${form.boothEndRecruit})은 행사 참여 모집 시작일(${form.startRecruit}) 이전이어야 해요.`);
        return false;
      }
      for (let i = 0; i < booths.length; i++) {
        if (!booths[i].boothName.trim()) { alert(`부스 ${i + 1}의 부스명을 입력해주세요.`); return false; }
        if (booths[i].boothPrice === '') { alert(`부스 ${i + 1}의 금액을 입력해주세요.`); return false; }
        if (!booths[i].totalCount) { alert(`부스 ${i + 1}의 수량을 입력해주세요.`); return false; }
      }
    }
    if (hasFacility) {
      for (let i = 0; i < facis.length; i++) {
        if (!facis[i].faciName.trim()) { alert(`부대시설 ${i + 1}의 시설명을 입력해주세요.`); return false; }
        if (facis[i].faciPrice === '') { alert(`부대시설 ${i + 1}의 금액을 입력해주세요.`); return false; }
        if (!facis[i].faciUnit.trim()) { alert(`부대시설 ${i + 1}의 단위를 입력해주세요.`); return false; }
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
        price: form.isFree ? 0 : Number(form.price),
        capacity: form.noLimit ? null : Number(form.capacity),
        category: { categoryId: Number(form.categoryId) },
        region: { regionId: Number(form.regionId) },
        topicIds: selectedTopics.join(','),
        hashtagIds: selectedHashtags.join(','),
        hasBooth,
        hasFacility,
      };
      delete eventInfo.categoryId;
      delete eventInfo.regionId;

      const eventData = {
        eventInfo,
        booths: hasBooth ? booths.map((b) => ({ ...b, boothPrice: Number(b.boothPrice), totalCount: Number(b.totalCount) })) : [],
        facilities: hasFacility ? facis.map((f) => ({ ...f, faciPrice: Number(f.faciPrice), totalCount: f.hasCount ? Number(f.totalCount) : null })) : [],
      };
      const newId = await createEvent({ eventData, thumbnail, detailFiles, boothFiles });
      alert('행사가 등록되었습니다!');
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

        {/* SECTION 1 — 행사 기본 정보 */}
        <SectionCard step="1" title="행사 기본 정보" icon="📋">
          <div style={{ display: 'flex', gap: 20, marginBottom: 18 }}>
            <div style={{ width: 170, flexShrink: 0 }}>
              <ImageUploadBox label="썸네일 이미지" required file={thumbnail} onChange={setThumbnail} style={{ height: 170 }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <Label required>제목</Label>
                <Input placeholder="행사 제목을 입력하세요" value={form.title} onChange={(e) => setF('title', e.target.value)} />
              </div>
              <div>
                <Label required>한 줄 설명</Label>
                <Input placeholder="행사를 한 줄로 소개해주세요" value={form.simpleExplain} onChange={(e) => setF('simpleExplain', e.target.value)} />
              </div>
              <G2>
                <div>
                  <Label required>행사 시작일</Label>
                  <Input type="date" value={form.startDate} min={today}
                    onChange={(e) => {
                      setF('startDate', e.target.value);
                      if (form.endDate && e.target.value > form.endDate) setF('endDate', '');
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
                모집 종료일은 행사 시작일({form.startDate}) 이전이어야 해요.
              </div>
            )}
            <G2>
              <div>
                <Label required>모집 시작일</Label>
                <Input type="date" value={form.startRecruit} min={today} max={maxEndRecruit || undefined}
                  onChange={(e) => {
                    setF('startRecruit', e.target.value);
                    if (form.endRecruit && e.target.value > form.endRecruit) setF('endRecruit', '');
                    // ✅ Issue 1: 부스 날짜가 새 startRecruit 이후면 초기화
                    if (form.boothStartRecruit && e.target.value <= form.boothStartRecruit) setF('boothStartRecruit', '');
                    if (form.boothEndRecruit && e.target.value <= form.boothEndRecruit) setF('boothEndRecruit', '');
                  }} />
              </div>
              <div>
                <Label required>모집 종료일</Label>
                <Input type="date" value={form.endRecruit} min={minEndRecruit} max={maxEndRecruit || undefined}
                  onChange={(e) => {
                    setF('endRecruit', e.target.value);
                  }} />
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
            <Input placeholder="상세 주소를 입력하세요 (동/호수, 층 등) *필수" value={form.detailAddressExtra} onChange={(e) => setF('detailAddressExtra', e.target.value)} />
            {form.roadAddress && form.detailAddressExtra && (
              <div style={{ marginTop: 8, padding: '8px 12px', background: '#F0FDF4', borderRadius: 10, fontSize: 12, color: '#15803D', fontWeight: 700 }}>
                📍 저장될 주소: {form.roadAddress} {form.detailAddressExtra}
              </div>
            )}
          </div>
        </SectionCard>

        {/* SECTION 2 — 추가 정보 */}
        <SectionCard step="2" title="추가 정보" icon="📌">
          <G2 style={{ marginBottom: 18 }}>
            <div>
              <Label required>카테고리</Label>
              <Select value={form.categoryId} onChange={(e) => setF('categoryId', e.target.value)}>
                <option value="">선택</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <TopicSelector label="주제 (Topic)" required hint="(최대 5가지)" items={TOPICS} selected={selectedTopics} onToggle={toggleTopic} />
          </G2>
          <Divider />
          <div style={{ marginBottom: 18 }}>
            <HashtagSelector label="해시태그" hint="(분위기/감성 태그, 최대 5가지)" items={HASHTAGS} selected={selectedHashtags} onToggle={toggleHashtag} />
          </div>
          <Divider />
          <G2 style={{ marginBottom: 18 }}>
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
              {form.isFree && <div style={{ padding: '9px 13px', background: '#F0FDF4', borderRadius: 10, fontSize: 13, color: '#16A34A', fontWeight: 700 }}>0 원</div>}
            </div>
            <div>
              <Label required>모집 정원</Label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                <input type="checkbox" checked={form.noLimit} onChange={(e) => setF('noLimit', e.target.checked)} style={checkStyle} />
                제한 없음
              </label>
              {!form.noLimit && <Input type="number" min={1} placeholder="모집 인원 수" value={form.capacity} onChange={(e) => setF('capacity', e.target.value)} />}
              {form.noLimit && <div style={{ padding: '9px 13px', background: '#F0FDF4', borderRadius: 10, fontSize: 13, color: '#16A34A', fontWeight: 700 }}>제한 없음</div>}
            </div>
          </G2>
        </SectionCard>

        {/* SECTION 3 — 주최자 정보 */}
        <SectionCard step="3" title="주최자 정보" icon="🏢">
          <div style={{ padding: '14px 16px', background: '#F9FAFB', borderRadius: 12, border: '1px solid #E5E7EB', marginBottom: 4 }}>

            {/* ✅ Issue 6: 프로필 사진 */}
            {hostInfo.profileImg && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <img
                  src={`${PHOTO_BASE}/${hostInfo.profileImg}`}
                  alt="프로필 사진"
                  style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E5E7EB' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 700, marginBottom: 12 }}>
              로그인한 계정 정보로 자동 설정됩니다. 수정이 필요하면 마이페이지에서 변경해주세요.
            </div>
            <G2>
              <div>
                <Label>주최자/기업 명</Label>
                <Input value={hostInfo.name || '(이름 정보 없음)'} readOnly style={{ background: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed' }} />
              </div>
              <div>
                <Label>전화번호</Label>
                <Input value={hostInfo.phone || '(전화번호 없음)'} readOnly style={{ background: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed' }} />
              </div>
            </G2>
            <div style={{ marginTop: 12 }}>
              <Label>이메일</Label>
              <Input value={hostInfo.email || '(이메일 없음)'} readOnly style={{ background: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed' }} />
            </div>
          </div>
        </SectionCard>

        {/* SECTION 4 — 상세설명 */}
        <SectionCard step="4" title="상세 설명 / 준비물 / 유의사항" icon="📝">
          <div style={{ marginBottom: 16 }}>
            <Label>상세설명 / 준비물 / 유의사항</Label>
            <Textarea rows={6} placeholder="행사 상세 설명, 준비물, 유의사항 등을 자유롭게 작성해주세요." value={form.description} onChange={(e) => setF('description', e.target.value)} />
          </div>
          <MultiImageUpload label="상세 이미지 (여러 장 가능)" files={detailFiles} onChange={setDetailFiles} />
        </SectionCard>

        {/* SECTION 5 — 부스 & 부대시설 */}
        <SectionCard step="5" title="부스 & 부대시설" icon="🏪">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F9FAFB', borderRadius: 12, marginBottom: hasBooth ? 16 : 0 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>부스 운영</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>행사에서 부스를 모집하나요?</div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
              <input type="checkbox" checked={hasBooth} onChange={(e) => handleBoothToggle(e.target.checked)} style={checkStyle} />
              운영
            </label>
          </div>

          {hasBooth && (
            <>
              {/* ✅ Issue 1: 부스 모집 기간 패널 */}
              <div style={{ padding: '14px 16px', background: '#FFFBEB', borderRadius: 12, border: '1px solid #FDE68A', marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#92400E', marginBottom: 4 }}>📅 부스 모집 기간</div>
                {form.startRecruit ? (
                  <div style={{ fontSize: 11, color: '#B45309', marginBottom: 10 }}>
                    ⚠️ 부스 모집 기간은 행사 참여 모집 <strong>시작일({form.startRecruit}) 이전</strong>이어야 해요.
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: '#B45309', marginBottom: 10 }}>
                    ⚠️ 먼저 위에서 행사 참여 모집 시작일을 설정해주세요.
                  </div>
                )}
                <G2>
                  <div>
                    <Label>부스 모집 시작일</Label>
                    <Input type="date" value={form.boothStartRecruit}
                      max={boothMaxDate}
                      onChange={(e) => {
                        setF('boothStartRecruit', e.target.value);
                        if (form.boothEndRecruit && e.target.value > form.boothEndRecruit) setF('boothEndRecruit', '');
                      }} />
                  </div>
                  <div>
                    <Label>부스 모집 종료일</Label>
                    <Input type="date" value={form.boothEndRecruit}
                      min={minBoothEndRecruit}
                      max={boothMaxDate}
                      onChange={(e) => setF('boothEndRecruit', e.target.value)} />
                  </div>
                </G2>
              </div>

              {booths.map((b, i) => (
                <div key={i} style={{ padding: '16px', background: '#F9FAFB', borderRadius: 12, border: '1px solid #E5E7EB', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: '#9CA3AF' }}>BOOTH {i + 1}</span>
                    {booths.length > 1 && (
                      <button onClick={() => setBooths((p) => p.filter((_, idx) => idx !== i))}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 12, fontWeight: 800 }}>✕ 삭제</button>
                    )}
                  </div>
                  <G2>
                    <div><Label required>부스명</Label><Input placeholder="부스명" value={b.boothName} onChange={(e) => updateBooth(i, 'boothName', e.target.value)} /></div>
                    <div><Label>크기</Label><Input placeholder="예: 2m×2m" value={b.boothSize} onChange={(e) => updateBooth(i, 'boothSize', e.target.value)} /></div>
                    <div><Label required>금액 (원)</Label><Input type="number" min={0} placeholder="0 = 무료" value={b.boothPrice} onChange={(e) => updateBooth(i, 'boothPrice', e.target.value)} /></div>
                    <div><Label required>수량</Label><Input type="number" min={1} placeholder="총 부스 수량" value={b.totalCount} onChange={(e) => updateBooth(i, 'totalCount', e.target.value)} /></div>
                  </G2>
                  <div style={{ marginTop: 10 }}>
                    <Label>비고</Label>
                    <Input placeholder="부스 관련 추가 안내 (선택)" value={b.boothNote} onChange={(e) => updateBooth(i, 'boothNote', e.target.value)} />
                  </div>
                </div>
              ))}
              <button onClick={() => setBooths((p) => [...p, INIT_BOOTH()])}
                style={{ width: '100%', padding: '10px', borderRadius: 12, marginBottom: 16, border: '2px dashed #FFD700', background: '#FFFBEB', color: '#D97706', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
                + 부스 추가
              </button>

              <MultiImageUpload label="부스 관련 이미지" files={boothFiles} onChange={setBoothFiles} />
              <Divider />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F9FAFB', borderRadius: 12, marginBottom: hasFacility ? 16 : 0 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>부대시설 운영</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>전기/수도/책상/의자</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
                  <input type="checkbox" checked={hasFacility} onChange={(e) => setHasFacility(e.target.checked)} style={checkStyle} />
                  운영
                </label>
              </div>

              {hasFacility && (
                <>
                  {facis.map((f, i) => (
                    <div key={i} style={{ padding: '16px', background: '#F9FAFB', borderRadius: 12, border: '1px solid #E5E7EB', marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 900, color: '#9CA3AF' }}>시설 {i + 1}</span>
                        {facis.length > 1 && (
                          <button onClick={() => setFacis((p) => p.filter((_, idx) => idx !== i))}
                            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 12, fontWeight: 800 }}>✕ 삭제</button>
                        )}
                      </div>
                      <G2>
                        <div><Label required>시설명</Label><Input placeholder="예: 포토존, 푸드트럭" value={f.faciName} onChange={(e) => updateFaci(i, 'faciName', e.target.value)} /></div>
                        <div><Label required>단위</Label><Input placeholder="예: 회, 개, 시간" value={f.faciUnit} onChange={(e) => updateFaci(i, 'faciUnit', e.target.value)} /></div>
                        <div><Label required>금액 (원)</Label><Input type="number" min={0} placeholder="0 = 무료" value={f.faciPrice} onChange={(e) => updateFaci(i, 'faciPrice', e.target.value)} /></div>
                        <div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, color: '#374151', cursor: 'pointer', marginTop: 22 }}>
                            <input type="checkbox" checked={f.hasCount} onChange={(e) => updateFaci(i, 'hasCount', e.target.checked)} style={checkStyle} />
                            수량 관리
                          </label>
                          {f.hasCount && <Input type="number" min={1} placeholder="총 수량" value={f.totalCount} onChange={(e) => updateFaci(i, 'totalCount', e.target.value)} style={{ marginTop: 6 }} />}
                        </div>
                      </G2>
                    </div>
                  ))}
                  <button onClick={() => setFacis((p) => [...p, INIT_FACI()])}
                    style={{ width: '100%', padding: '10px', borderRadius: 12, border: '2px dashed #FFD700', background: '#FFFBEB', color: '#D97706', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
                    + 시설 추가
                  </button>
                </>
              )}
            </>
          )}
        </SectionCard>

        {/* 하단 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
          <button onClick={() => navigate(-1)}
            style={{ padding: '12px 28px', borderRadius: 13, border: '1.5px solid #E5E7EB', background: '#fff', color: '#6B7280', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
            취소
          </button>
          <button onClick={handleSubmit} disabled={saving}
            style={{ padding: '12px 40px', borderRadius: 13, background: saving ? '#E5E7EB' : 'linear-gradient(135deg,#FFD700,#FFC200)', border: 'none', color: saving ? '#9CA3AF' : '#111', fontWeight: 900, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 14px rgba(255,215,0,0.45)' }}>
            {saving ? '등록 중...' : '행사 등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
