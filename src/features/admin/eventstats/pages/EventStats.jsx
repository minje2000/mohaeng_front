// src/features/admin/eventstats/pages/EventStats.jsx
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { tokenStore } from '../../../../app/http/tokenStore';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { EventStatsApi } from '../api/EventStatsApi';

// ─────────── 지역 데이터 ───────────
const CITY_IDS = {
  "서울": 1100000000, "부산": 2600000000, "대구": 2700000000, "인천": 2800000000,
  "광주": 2900000000, "대전": 3000000000, "울산": 3100000000, "세종": 3611000000,
  "경기": 4100000000, "강원": 5100000000, "충북": 4300000000, "충남": 4400000000,
  "전북": 5200000000, "전남": 4600000000, "경북": 4700000000, "경남": 4800000000, "제주": 5000000000,
};

const REGION_DATA = {
  "서울":[{id:1111000000,name:"종로구"},{id:1114000000,name:"중구"},{id:1117000000,name:"용산구"},{id:1120000000,name:"성동구"},{id:1121500000,name:"광진구"},{id:1123000000,name:"동대문구"},{id:1126000000,name:"중랑구"},{id:1129000000,name:"성북구"},{id:1130500000,name:"강북구"},{id:1132000000,name:"도봉구"},{id:1135000000,name:"노원구"},{id:1138000000,name:"은평구"},{id:1141000000,name:"서대문구"},{id:1144000000,name:"마포구"},{id:1147000000,name:"양천구"},{id:1150000000,name:"강서구"},{id:1153000000,name:"구로구"},{id:1154500000,name:"금천구"},{id:1156000000,name:"영등포구"},{id:1159000000,name:"동작구"},{id:1162000000,name:"관악구"},{id:1165000000,name:"서초구"},{id:1168000000,name:"강남구"},{id:1171000000,name:"송파구"},{id:1174000000,name:"강동구"}],
  "인천":[{id:2811000000,name:"중구"},{id:2814000000,name:"동구"},{id:2817700000,name:"미추홀구"},{id:2818500000,name:"연수구"},{id:2820000000,name:"남동구"},{id:2823700000,name:"부평구"},{id:2824500000,name:"계양구"},{id:2826000000,name:"서구"},{id:2871000000,name:"강화군"},{id:2872000000,name:"옹진군"}],
  "경기":[{id:4111000000,name:"수원시"},{id:4113000000,name:"성남시"},{id:4115000000,name:"의정부시"},{id:4117000000,name:"안양시"},{id:4119000000,name:"부천시"},{id:4121000000,name:"광명시"},{id:4122000000,name:"평택시"},{id:4125000000,name:"동두천시"},{id:4127000000,name:"안산시"},{id:4128000000,name:"고양시"},{id:4129000000,name:"과천시"},{id:4131000000,name:"구리시"},{id:4136000000,name:"남양주시"},{id:4137000000,name:"오산시"},{id:4139000000,name:"시흥시"},{id:4141000000,name:"군포시"},{id:4143000000,name:"의왕시"},{id:4145000000,name:"하남시"},{id:4146000000,name:"용인시"},{id:4148000000,name:"파주시"},{id:4150000000,name:"이천시"},{id:4155000000,name:"안성시"},{id:4157000000,name:"김포시"},{id:4159000000,name:"화성시"},{id:4161000000,name:"광주시"},{id:4163000000,name:"양주시"},{id:4165000000,name:"포천시"},{id:4167000000,name:"여주시"},{id:4180000000,name:"연천군"},{id:4182000000,name:"가평군"},{id:4183000000,name:"양평군"}],
  "강원":[{id:5111000000,name:"춘천시"},{id:5113000000,name:"원주시"},{id:5115000000,name:"강릉시"},{id:5117000000,name:"동해시"},{id:5119000000,name:"태백시"},{id:5121000000,name:"속초시"},{id:5123000000,name:"삼척시"},{id:5172000000,name:"홍천군"},{id:5173000000,name:"횡성군"},{id:5175000000,name:"영월군"},{id:5176000000,name:"평창군"},{id:5177000000,name:"정선군"},{id:5178000000,name:"철원군"},{id:5179000000,name:"화천군"},{id:5180000000,name:"양구군"},{id:5181000000,name:"인제군"},{id:5182000000,name:"고성군"},{id:5183000000,name:"양양군"}],
  "세종":[{id:3611000000,name:"세종시 전체"}],
  "대전":[{id:3011000000,name:"동구"},{id:3014000000,name:"중구"},{id:3017000000,name:"서구"},{id:3020000000,name:"유성구"},{id:3023000000,name:"대덕구"}],
  "충북":[{id:4311000000,name:"청주시"},{id:4313000000,name:"충주시"},{id:4315000000,name:"제천시"},{id:4372000000,name:"보은군"},{id:4373000000,name:"옥천군"},{id:4374000000,name:"영동군"},{id:4374500000,name:"증평군"},{id:4375000000,name:"진천군"},{id:4376000000,name:"괴산군"},{id:4377000000,name:"음성군"},{id:4380000000,name:"단양군"}],
  "충남":[{id:4413000000,name:"천안시"},{id:4415000000,name:"공주시"},{id:4418000000,name:"보령시"},{id:4420000000,name:"아산시"},{id:4421000000,name:"서산시"},{id:4423000000,name:"논산시"},{id:4425000000,name:"계룡시"},{id:4427000000,name:"당진시"},{id:4471000000,name:"금산군"},{id:4476000000,name:"부여군"},{id:4477000000,name:"서천군"},{id:4479000000,name:"청양군"},{id:4480000000,name:"홍성군"},{id:4481000000,name:"예산군"},{id:4482500000,name:"태안군"}],
  "광주":[{id:2911000000,name:"동구"},{id:2914000000,name:"서구"},{id:2915500000,name:"남구"},{id:2917000000,name:"북구"},{id:2920000000,name:"광산구"}],
  "전북":[{id:5211000000,name:"전주시"},{id:5213000000,name:"군산시"},{id:5214000000,name:"익산시"},{id:5218000000,name:"정읍시"},{id:5219000000,name:"남원시"},{id:5221000000,name:"김제시"},{id:5271000000,name:"완주군"},{id:5272000000,name:"진안군"},{id:5273000000,name:"무주군"},{id:5274000000,name:"장수군"},{id:5275000000,name:"임실군"},{id:5277000000,name:"순창군"},{id:5279000000,name:"고창군"},{id:5280000000,name:"부안군"}],
  "전남":[{id:4611000000,name:"목포시"},{id:4613000000,name:"여수시"},{id:4615000000,name:"순천시"},{id:4617000000,name:"나주시"},{id:4623000000,name:"광양시"},{id:4671000000,name:"담양군"},{id:4672000000,name:"곡성군"},{id:4673000000,name:"구례군"},{id:4677000000,name:"고흥군"},{id:4678000000,name:"보성군"},{id:4679000000,name:"화순군"},{id:4680000000,name:"장흥군"},{id:4681000000,name:"강진군"},{id:4682000000,name:"해남군"},{id:4683000000,name:"영암군"},{id:4684000000,name:"무안군"},{id:4686000000,name:"함평군"},{id:4687000000,name:"영광군"},{id:4688000000,name:"장성군"},{id:4689000000,name:"완도군"},{id:4690000000,name:"진도군"},{id:4691000000,name:"신안군"}],
  "대구":[{id:2711000000,name:"중구"},{id:2714000000,name:"동구"},{id:2717000000,name:"서구"},{id:2720000000,name:"남구"},{id:2723000000,name:"북구"},{id:2726000000,name:"수성구"},{id:2729000000,name:"달서구"},{id:2771000000,name:"달성군"},{id:2772000000,name:"군위군"}],
  "부산":[{id:2611000000,name:"중구"},{id:2614000000,name:"서구"},{id:2617000000,name:"동구"},{id:2620000000,name:"영도구"},{id:2623000000,name:"부산진구"},{id:2626000000,name:"동래구"},{id:2629000000,name:"남구"},{id:2632000000,name:"북구"},{id:2635000000,name:"해운대구"},{id:2638000000,name:"사하구"},{id:2641000000,name:"금정구"},{id:2644000000,name:"강서구"},{id:2647000000,name:"연제구"},{id:2650000000,name:"수영구"},{id:2653000000,name:"사상구"},{id:2671000000,name:"기장군"}],
  "울산":[{id:3111000000,name:"중구"},{id:3114000000,name:"남구"},{id:3117000000,name:"동구"},{id:3120000000,name:"북구"},{id:3171000000,name:"울주군"}],
  "경북":[{id:4711000000,name:"포항시"},{id:4713000000,name:"경주시"},{id:4715000000,name:"김천시"},{id:4717000000,name:"안동시"},{id:4719000000,name:"구미시"},{id:4721000000,name:"영주시"},{id:4723000000,name:"영천시"},{id:4725000000,name:"상주시"},{id:4728000000,name:"문경시"},{id:4729000000,name:"경산시"},{id:4773000000,name:"의성군"},{id:4775000000,name:"청송군"},{id:4776000000,name:"영양군"},{id:4777000000,name:"영덕군"},{id:4782000000,name:"청도군"},{id:4783000000,name:"고령군"},{id:4784000000,name:"성주군"},{id:4785000000,name:"칠곡군"},{id:4790000000,name:"예천군"},{id:4792000000,name:"봉화군"},{id:4793000000,name:"울진군"},{id:4794000000,name:"울릉군"}],
  "경남":[{id:4812000000,name:"창원시"},{id:4817000000,name:"진주시"},{id:4822000000,name:"통영시"},{id:4824000000,name:"사천시"},{id:4825000000,name:"김해시"},{id:4827000000,name:"밀양시"},{id:4831000000,name:"거제시"},{id:4833000000,name:"양산시"},{id:4872000000,name:"의령군"},{id:4873000000,name:"함안군"},{id:4874000000,name:"창녕군"},{id:4882000000,name:"고성군"},{id:4884000000,name:"남해군"},{id:4885000000,name:"하동군"},{id:4886000000,name:"산청군"},{id:4887000000,name:"함양군"},{id:4888000000,name:"거창군"},{id:4889000000,name:"합천군"}],
  "제주":[{id:5011000000,name:"제주시"},{id:5013000000,name:"서귀포시"}],
};

const CATEGORIES = [
  {id:1,name:"컨퍼런스"},{id:2,name:"박람회"},{id:3,name:"전시"},{id:4,name:"강연/세미나"},
  {id:5,name:"교육/워크숍"},{id:6,name:"공연/콘서트"},{id:7,name:"페스티벌/축제"},{id:8,name:"취업/채용"},
  {id:9,name:"네트워킹/파티"},{id:10,name:"경진대회"},{id:11,name:"플리마켓/장터"},{id:12,name:"토크콘서트"},
  {id:13,name:"스포츠/레저"},{id:14,name:"원데이 클래스"},{id:15,name:"팝업스토어"},
];

const STATUS_OPTIONS = [
  "행사예정","부스모집중","행사참여모집중","행사중","부스모집마감","행사참여마감","행사종료",
];

const PIE_COLORS = ["#6366F1","#F59E0B","#10B981","#EF4444","#3B82F6","#EC4899","#8B5CF6","#14B8A6"];

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
const GENDER_COLORS = { 남: "#3B82F6", 여: "#EC4899" };
const THUMBNAIL_BASE = "http://localhost:8080/upload_files/event/";
const PHOTO_BASE = "http://localhost:8080/upload_files/photo/";

// ─────────── 유틸 ───────────
const fmt = (n) => (n == null ? "-" : Number(n).toLocaleString());
const fmtDate = (d) => (d ? String(d).replaceAll("-", ".") : "-");

// ─────────── StatusBadge ───────────
function StatusBadge({ status }) {
  const map = {
    행사예정: { bg:"#EDE9FE", color:"#7C3AED" },
    부스모집중: { bg:"#DBEAFE", color:"#1D4ED8" },
    행사참여모집중: { bg:"#D1FAE5", color:"#065F46" },
    행사중: { bg:"#FEF3C7", color:"#92400E" },
    행사종료: { bg:"#F3F4F6", color:"#6B7280" },
    행사참여마감: { bg:"#F3F4F6", color:"#6B7280" },
    부스모집마감: { bg:"#F3F4F6", color:"#6B7280" },
  };
  const s = map[status] || { bg:"#F3F4F6", color:"#374151" };
  return (
    <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:999,
      fontSize:12, fontWeight:700, background:s.bg, color:s.color }}>
      {status || "-"}
    </span>
  );
}

// ─────────── StatCard ───────────
function StatCard({ label, value, unit = "건" }) {
  return (
    <div style={{ flex:1, border:"1px solid #E5E7EB", borderRadius:12,
      padding:"16px 20px", background:"#FAFAFA", textAlign:"center" }}>
      <div style={{ fontSize:13, color:"#6B7280", marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:900, color:"#111" }}>
        {fmt(value)}<span style={{ fontSize:14, marginLeft:4, color:"#6B7280" }}>{unit}</span>
      </div>
    </div>
  );
}

// ─────────── InfoRow ───────────
function InfoRow({ label, value }) {
  return (
    <div style={{ display:"flex", gap:8 }}>
      <span style={{ color:"#9CA3AF", minWidth:60, flexShrink:0 }}>{label}</span>
      <span style={{ color:"#111", fontWeight:600 }}>{value || "-"}</span>
    </div>
  );
}

// ══════════════════════════════════════════
//   뷰 1: 전체 행사 목록
// ══════════════════════════════════════════
function EventListView({ onSelectEvent }) {
  const [filters, setFilters] = useState({
    keyword: "", categoryId: "", status: "", city: "", regionId: "",
    startDate: "", endDate: "", checkFree: false, hideClosed: false,
  });

  const [events, setEvents]       = useState([]);
  const [pageInfo, setPageInfo]   = useState({ totalElements:0, totalPages:0, first:true, last:true });
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading]     = useState(false);

  const [monthlyData, setMonthlyData]     = useState([]);
  const [selectedYear, setSelectedYear]   = useState(new Date().getFullYear());

  const loadEvents = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const regionId = filters.regionId || (filters.city ? CITY_IDS[filters.city] : "");
      const res = await EventStatsApi.getAllEvent({
        keyword:    filters.keyword    || undefined,
        categoryId: filters.categoryId || undefined,
        status:     filters.status     || undefined,
        regionId:   regionId           || undefined,
        startDate:  filters.startDate  || undefined,
        endDate:    filters.endDate    || undefined,
        checkFree:  filters.checkFree,
        hideClosed: filters.hideClosed,
        page,
        size: 10,
      });
      const data = res.data;
      setEvents(data.content || []);
      setPageInfo({
        totalElements: data.totalElements || 0,
        totalPages:    data.totalPages    || 0,
        first:         data.first         ?? true,
        last:          data.last          ?? true,
      });
      setCurrentPage(page);
    } catch (e) {
      console.error("행사 목록 로딩 실패", e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    EventStatsApi.getEventCountByMonth(selectedYear)
      .then(r => {
        const filled = Array.from({ length: 12 }, (_, i) => {
          const found = (r.data || []).find(d => d.month === i + 1);
          return { month: `${i + 1}월`, count: found ? Number(found.count) : 0 };
        });
        setMonthlyData(filled);
      })
      .catch(console.error);
  }, [selectedYear]);

  useEffect(() => { loadEvents(0); }, [loadEvents]);

  const setFilter = (key, val) => {
    setFilters(prev => {
      const next = { ...prev, [key]: val };
      if (key === "city") next.regionId = "";
      return next;
    });
  };

  const handleSearch = () => loadEvents(0);
  const districtList = filters.city ? REGION_DATA[filters.city] || [] : [];

  return (
    <div>
      <h2 style={{ margin:"0 0 20px", fontSize:22, fontWeight:900 }}>행사 분석</h2>

      <section style={sectionStyle}>
        <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:16 }}>
          <h3 style={{ ...sectionTitleStyle, marginBottom:0 }}>전체 행사</h3>
          <span style={{ fontSize:13, color:"#9CA3AF", fontWeight:500 }}>
            {loading ? "..." : `총 ${fmt(pageInfo.totalElements)}개`}
          </span>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
            <input
              type="text"
              placeholder="제목·한줄설명 검색 (Enter)"
              value={filters.keyword}
              onChange={e => setFilter("keyword", e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              style={{ ...inputStyle, width:220 }}
            />
            <select value={filters.categoryId} onChange={e => setFilter("categoryId", e.target.value)} style={selectStyle}>
              <option value="">카테고리 전체</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={filters.status} onChange={e => setFilter("status", e.target.value)} style={selectStyle}>
              <option value="">상태 전체</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
            <select value={filters.city} onChange={e => setFilter("city", e.target.value)} style={selectStyle}>
              <option value="">시/도 전체</option>
              {Object.keys(CITY_IDS).map(city => <option key={city} value={city}>{city}</option>)}
            </select>

            {filters.city && districtList.length > 0 && (
              <select value={filters.regionId} onChange={e => setFilter("regionId", e.target.value)} style={selectStyle}>
                <option value="">시/군/구 전체</option>
                {districtList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            )}

            <div style={{ display:"flex", alignItems:"center", gap:6, border:"1px solid #E5E7EB",
              borderRadius:8, padding:"6px 10px", background:"#fff" }}>
              <input type="date" value={filters.startDate}
                onChange={e => setFilter("startDate", e.target.value)} style={dateInputStyle} />
              <span style={{ color:"#9CA3AF" }}>~</span>
              <input type="date" value={filters.endDate} min={filters.startDate}
                onChange={e => setFilter("endDate", e.target.value)} style={dateInputStyle} />
            </div>

            <label style={checkboxLabelStyle}>
              <input type="checkbox" checked={filters.checkFree}
                onChange={e => setFilter("checkFree", e.target.checked)} />
              무료만
            </label>
            <label style={checkboxLabelStyle}>
              <input type="checkbox" checked={filters.hideClosed}
                onChange={e => setFilter("hideClosed", e.target.checked)} />
              종료 제외
            </label>

            <button onClick={handleSearch} style={searchBtnStyle}>검색</button>
            <button onClick={() => {
              setFilters({ keyword:"", categoryId:"", status:"", city:"", regionId:"",
                startDate:"", endDate:"", checkFree:false, hideClosed:false });
            }} style={{ ...searchBtnStyle, background:"#6B7280" }}>초기화</button>
          </div>
        </div>

        <div style={{ border:"1px solid #E5E7EB", borderRadius:12, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:"#F9FAFB", borderBottom:"1px solid #E5E7EB" }}>
                {["썸네일","카테고리","행사 제목","지역","행사 기간","상태","조회수"].map(h => (
                  <th key={h} style={{ textAlign:"left", padding:"10px 12px",
                    fontWeight:700, color:"#374151", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding:24, textAlign:"center", color:"#9CA3AF" }}>불러오는 중...</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={7} style={{ padding:24, textAlign:"center", color:"#9CA3AF" }}>조건에 맞는 행사가 없습니다.</td></tr>
              ) : events.map(ev => (
                <tr key={ev.eventId}
                  onClick={() => onSelectEvent(ev.eventId, ev.title)}
                  style={{ borderBottom:"1px solid #F1F5F9", cursor:"pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}
                >
                  <td style={{ padding:"8px 12px" }}>
                    <img
                      src={ev.thumbnail ? `${THUMBNAIL_BASE}${ev.thumbnail}` : ""}
                      alt=""
                      style={{ width:48, height:36, objectFit:"cover", borderRadius:6, background:"#F3F4F6" }}
                      onError={e => { e.target.style.display = "none"; }}
                    />
                  </td>
                  <td style={{ padding:"10px 12px", color:"#6B7280" }}>{ev.categoryName || "-"}</td>
                  <td style={{ padding:"10px 12px", fontWeight:700, color:"#1D4ED8", textDecoration:"underline" }}>{ev.title}</td>
                  <td style={{ padding:"10px 12px", color:"#374151" }}>{ev.location || "-"}</td>
                  <td style={{ padding:"10px 12px", color:"#374151", whiteSpace:"nowrap" }}>
                    {fmtDate(ev.startDate)} ~ {fmtDate(ev.endDate)}
                  </td>
                  <td style={{ padding:"10px 12px" }}><StatusBadge status={ev.eventStatus} /></td>
                  <td style={{ padding:"10px 12px", color:"#374151" }}>{fmt(ev.views)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pageInfo.totalPages > 0 && (
          <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:16 }}>
            <button disabled={pageInfo.first} onClick={() => loadEvents(currentPage - 1)} style={pageBtnStyle(false, pageInfo.first)}>이전</button>
            {Array.from({ length: Math.min(pageInfo.totalPages, 10) }, (_, i) => {
              const start = Math.max(0, Math.min(currentPage - 4, pageInfo.totalPages - 10));
              const p = start + i;
              return (
                <button key={p} onClick={() => loadEvents(p)} style={pageBtnStyle(currentPage === p, false)}>
                  {p + 1}
                </button>
              );
            })}
            <button disabled={pageInfo.last} onClick={() => loadEvents(currentPage + 1)} style={pageBtnStyle(false, pageInfo.last)}>다음</button>
          </div>
        )}
      </section>

      <section style={{ ...sectionStyle, marginTop:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h3 style={{ ...sectionTitleStyle, marginBottom:0 }}>월별 행사</h3>
          <select value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            style={{ ...selectStyle, fontSize:13 }}>
            {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData} barSize={28} margin={{ top:4, right:8, left:-10, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize:12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize:12 }} />
            <Tooltip formatter={v => `${v}개`} />
            <Bar dataKey="count" name="행사 수" radius={[4,4,0,0]}>
              {monthlyData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}

// ══════════════════════════════════════════
//   뷰 2: 단일 행사 상세 분석
// ══════════════════════════════════════════
function EventDetailView({ eventId, eventTitle, onBack, isAdmin }) {
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    EventStatsApi.getEventAnalysis(eventId)
      .then(r => setDetail(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <div style={{ padding:40, textAlign:"center", color:"#9CA3AF" }}>분석 데이터 불러오는 중...</div>;
  if (!detail)  return <div style={{ padding:40, textAlign:"center", color:"#EF4444" }}>데이터를 불러올 수 없습니다.</div>;

  const topics = detail.topicIds
    ? detail.topicIds.split(",").map(id => TOPIC_MAP[Number(id.trim())]).filter(Boolean)
    : [];
  const hashtags = detail.hashtagIds
    ? detail.hashtagIds.split(",").map(id => HASHTAG_MAP[Number(id.trim())]).filter(Boolean)
    : [];

  const genderChartData = [
    { name:"남", value: Number(detail.maleCount || 0) },
    { name:"여", value: Number(detail.femaleCount || 0) },
  ].filter(d => d.value > 0);

  const ageChartData = detail.ageGroupCounts
    ? Object.entries(detail.ageGroupCounts)
        .map(([age, cnt]) => ({ age, count: Number(cnt) }))
        .sort((a, b) => a.age.localeCompare(b.age))
    : [];

  return (
    <div>
      {isAdmin && (
  <button onClick={onBack} style={backBtnStyle}>← 전체 행사 목록으로</button>
)}
      <h2 style={{ margin:"12px 0 20px", fontSize:22, fontWeight:900 }}>행사 분석</h2>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>

        {/* 기본 정보 */}
        <section style={sectionStyle}>
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            style={{ background:"none", border:"none", cursor:"pointer", color:"#1D4ED8",
              fontWeight:900, fontSize:16, textDecoration:"underline", padding:0, marginBottom:16, textAlign:"left" }}>
            {detail.title || eventTitle}
          </button>

          <div style={{ display:"flex", gap:14, marginBottom:14 }}>
            <div style={{ width:100, height:80, borderRadius:10, flexShrink:0, overflow:"hidden",
              background:"#F3F4F6", border:"1px solid #E5E7EB" }}>
              {detail.thumbnail ? (
                <img
                  src={`${THUMBNAIL_BASE}${detail.thumbnail}`}
                  alt="썸네일"
                  style={{ width:"100%", height:"100%", objectFit:"cover" }}
                  onError={e => { e.target.src = ""; e.target.style.display = "none"; }}
                />
              ) : (
                <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:11, color:"#9CA3AF" }}>이미지 없음</div>
              )}
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:5, fontSize:13 }}>
              <InfoRow label="행사 기간" value={detail.eventPeriod} />
              <InfoRow label="행사 장소" value={detail.location} />
              <InfoRow label="간단 소개" value={detail.simpleExplain} />
            </div>
          </div>

          {(topics.length > 0 || hashtags.length > 0) && (
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
              {topics.length > 0 && (
                <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:11, fontWeight:800, color:"#9CA3AF", whiteSpace:"nowrap" }}>주제</span>
                  {topics.map((tag, i) => (
                    <span key={i} style={{ background:"#FFF7ED", color:"#F97316", borderRadius:999,
                      padding:"3px 10px", fontSize:12, fontWeight:800 }}>{tag}</span>
                  ))}
                </div>
              )}
              {hashtags.length > 0 && (
                <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:11, fontWeight:800, color:"#9CA3AF", whiteSpace:"nowrap" }}>태그</span>
                  {hashtags.map((tag, i) => (
                    <span key={i} style={{ background:"#F3F4F6", color:"#6B7280", borderRadius:999,
                      padding:"3px 10px", fontSize:12, fontWeight:700 }}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ borderTop:"1px solid #F3F4F6", paddingTop:12 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#6B7280", marginBottom:8 }}>주최자 정보</div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
              <div style={{
                width:48, height:48, borderRadius:"50%", flexShrink:0,
                overflow:"hidden", background:"#F3F4F6", border:"1px solid #E5E7EB",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
              }}>
                {detail.hostPhoto ? (
                  <img
                    src={`${PHOTO_BASE}${detail.hostPhoto}`}
                    alt="주최자"
                    style={{ width:"100%", height:"100%", objectFit:"cover" }}
                    onError={e => { e.target.style.display = "none"; e.target.parentElement.textContent = "🏢"; }}
                  />
                ) : "🏢"}
              </div>
              <span style={{ fontSize:14, fontWeight:800, color:"#111" }}>{detail.hostName || "-"}</span>
            </div>
            <div style={{ fontSize:13, display:"flex", flexDirection:"column", gap:4 }}>
              <InfoRow label="이메일" value={detail.hostEmail} />
              <InfoRow label="전화" value={detail.hostPhone} />
            </div>
          </div>
        </section>

        {/* 통계 + 수익 */}
        <section style={sectionStyle}>
          <h3 style={sectionTitleStyle}>행사 통계</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
            <StatCard label="조회 수"   value={detail.viewCount}        unit="회" />
            <StatCard label="참여자 수" value={detail.participantCount} unit="명" />
            <StatCard label="리뷰 수"   value={detail.reviewCount}      unit="개" />
            <StatCard label="관심 수"   value={detail.wishCount}        unit="개" />
          </div>

          <div style={{ background:"#F8FAFC", borderRadius:12, padding:"14px 18px",
            border:"1px solid #E5E7EB" }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>수익 현황</div>
            <div style={{ fontSize:13, display:"flex", flexDirection:"column", gap:6 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:"#6B7280" }}>행사 참여 수익</span>
                <span style={{ fontWeight:600 }}>{fmt(detail.participantRevenue)}원</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:"#6B7280" }}>부스 수익</span>
                <span style={{ fontWeight:600 }}>{fmt(detail.boothRevenue)}원</span>
              </div>
            </div>
            <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid #E5E7EB",
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontWeight:700, fontSize:15 }}>총 수익</span>
              <span style={{ fontWeight:900, fontSize:20, color:"#111" }}>
                {fmt(detail.totalRevenue)}원
              </span>
            </div>
          </div>
        </section>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <section style={sectionStyle}>
          <h3 style={sectionTitleStyle}>행사 참여자 연령대</h3>
          {ageChartData.length === 0 ? (
            <div style={emptyStyle}>연령대 데이터 없음<br /><span style={{ fontSize:12 }}>(참여 신청 시 연령대 정보 필요)</span></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ageChartData} barSize={28} margin={{ top:4, right:8, left:-10, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="age" tick={{ fontSize:12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize:12 }} />
                <Tooltip formatter={v => `${v}명`} />
                <Bar dataKey="count" name="인원" radius={[4,4,0,0]}>
                  {ageChartData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        <section style={sectionStyle}>
          <h3 style={sectionTitleStyle}>행사 참여자 성별</h3>
          {genderChartData.length === 0 ? (
            <div style={emptyStyle}>성별 데이터 없음</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={genderChartData}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={85}
                  dataKey="value"
                  label={({ name, value, percent }) =>
                    `${name === "남" ? "남성" : "여성"} ${value}명 (${(percent * 100).toFixed(0)}%)`}
                  fontSize={12}
                >
                  {genderChartData.map((d, i) => (
                    <Cell key={i} fill={GENDER_COLORS[d.name] || "#9CA3AF"} />
                  ))}
                </Pie>
                <Legend formatter={v => v === "남" ? "남성" : "여성"} />
                <Tooltip formatter={(v, n) => [`${v}명`, n === "남" ? "남성" : "여성"]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </section>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//   메인 컴포넌트
// ══════════════════════════════════════════
export default function EventStats() {
  const location = useLocation();

  const isAdmin = useMemo(() => tokenStore.getRole?.() === 'ROLE_ADMIN', []);

  // ✅ 마이페이지 통계 버튼으로 진입 시 해당 행사 상세 바로 열기
  const [selectedEventId, setSelectedEventId] = useState(
    () => location.state?.eventId ?? null
  );
  const [selectedEventTitle, setSelectedEventTitle] = useState(
    () => location.state?.eventTitle ?? ""
  );

  const handleSelectEvent = (id, title) => {
    setSelectedEventId(id);
    setSelectedEventTitle(title);
  };

  const handleBack = () => {
    setSelectedEventId(null);
    setSelectedEventTitle("");
  };

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 20px" }}>
      {selectedEventId ? (
        <EventDetailView eventId={selectedEventId} eventTitle={selectedEventTitle} onBack={handleBack} isAdmin={isAdmin} />
      ) : (
        <EventListView onSelectEvent={handleSelectEvent} />
      )}
    </div>
  );
}

// ── 공통 스타일 ──
const sectionStyle = {
  background:"#fff", border:"1px solid #E5E7EB", borderRadius:14, padding:"20px 22px",
};
const sectionTitleStyle = {
  margin:"0 0 16px", fontSize:15, fontWeight:900,
  borderLeft:"4px solid #111", paddingLeft:10, color:"#111",
};
const inputStyle = {
  padding:"7px 12px", borderRadius:8, border:"1px solid #E5E7EB",
  fontSize:13, fontWeight:600, color:"#374151", outline:"none", background:"#fff",
};
const selectStyle = {
  padding:"7px 12px", borderRadius:8, border:"1px solid #E5E7EB",
  fontSize:13, fontWeight:600, color:"#374151", background:"#fff",
  cursor:"pointer", outline:"none",
};
const dateInputStyle = {
  border:"none", outline:"none", background:"transparent",
  fontSize:13, fontWeight:700, color:"#374151", cursor:"pointer",
};
const checkboxLabelStyle = {
  display:"flex", alignItems:"center", gap:5,
  fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer",
};
const searchBtnStyle = {
  padding:"7px 18px", borderRadius:8, border:"none",
  background:"#111", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer",
};
const backBtnStyle = {
  background:"none", border:"1px solid #E5E7EB", borderRadius:8,
  padding:"7px 14px", cursor:"pointer", fontSize:13, fontWeight:600, color:"#374151",
};
const emptyStyle = {
  height:180, display:"flex", flexDirection:"column",
  alignItems:"center", justifyContent:"center",
  color:"#9CA3AF", fontSize:14, textAlign:"center", lineHeight:1.8,
};

const pageBtnStyle = (isActive, isDisabled) => ({
  padding:"8px 14px", minWidth:38, height:38, borderRadius:8,
  fontSize:13, fontWeight:900, cursor: isDisabled ? "not-allowed" : "pointer",
  backgroundColor: isActive ? "#111" : "#fff",
  color: isActive ? "#fff" : (isDisabled ? "#D1D5DB" : "#374151"),
  border: `1px solid ${isActive ? "#111" : "#E5E7EB"}`,
});
