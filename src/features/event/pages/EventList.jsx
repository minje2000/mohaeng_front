import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../../shared/components/common/Header';
import Footer from '../../../shared/components/common/Footer';
import { fetchEventList } from '../api/EventlistAPI';

// 1. 지역 ID 맵핑 (CSV 데이터 기준 10자리)
const CITY_IDS = {
    "서울": 1100000000, "부산": 2600000000, "대구": 2700000000, "인천": 2800000000,
    "광주": 2900000000, "대전": 3000000000, "울산": 3100000000, "세종": 3611000000,
    "경기": 4100000000, "강원": 5100000000, "충북": 4300000000, "충남": 4400000000,
    "전북": 5200000000, "전남": 4600000000, "경북": 4700000000, "경남": 4800000000, "제주": 5000000000
};

// 2. 2차 지역(구/군) 세부 데이터
const REGION_DATA = {
    // 수도권
    "서울":[{"id":1111000000,"name":"종로구"},{"id":1114000000,"name":"중구"},{"id":1117000000,"name":"용산구"},{"id":1120000000,"name":"성동구"},{"id":1121500000,"name":"광진구"},{"id":1123000000,"name":"동대문구"},{"id":1126000000,"name":"중랑구"},{"id":1129000000,"name":"성북구"},{"id":1130500000,"name":"강북구"},{"id":1132000000,"name":"도봉구"},{"id":1135000000,"name":"노원구"},{"id":1138000000,"name":"은평구"},{"id":1141000000,"name":"서대문구"},{"id":1144000000,"name":"마포구"},{"id":1147000000,"name":"양천구"},{"id":1150000000,"name":"강서구"},{"id":1153000000,"name":"구로구"},{"id":1154500000,"name":"금천구"},{"id":1156000000,"name":"영등포구"},{"id":1159000000,"name":"동작구"},{"id":1162000000,"name":"관악구"},{"id":1165000000,"name":"서초구"},{"id":1168000000,"name":"강남구"},{"id":1171000000,"name":"송파구"},{"id":1174000000,"name":"강동구"}],
    "인천":[{"id":2811000000,"name":"중구"},{"id":2814000000,"name":"동구"},{"id":2817700000,"name":"미추홀구"},{"id":2818500000,"name":"연수구"},{"id":2820000000,"name":"남동구"},{"id":2823700000,"name":"부평구"},{"id":2824500000,"name":"계양구"},{"id":2826000000,"name":"서구"},{"id":2871000000,"name":"강화군"},{"id":2872000000,"name":"옹진군"}],
    "경기":[{"id":4111000000,"name":"수원시"},{"id":4113000000,"name":"성남시"},{"id":4115000000,"name":"의정부시"},{"id":4117000000,"name":"안양시"},{"id":4119000000,"name":"부천시"},{"id":4121000000,"name":"광명시"},{"id":4122000000,"name":"평택시"},{"id":4125000000,"name":"동두천시"},{"id":4127000000,"name":"안산시"},{"id":4128000000,"name":"고양시"},{"id":4129000000,"name":"과천시"},{"id":4131000000,"name":"구리시"},{"id":4136000000,"name":"남양주시"},{"id":4137000000,"name":"오산시"},{"id":4139000000,"name":"시흥시"},{"id":4141000000,"name":"군포시"},{"id":4143000000,"name":"의왕시"},{"id":4145000000,"name":"하남시"},{"id":4146000000,"name":"용인시"},{"id":4148000000,"name":"파주시"},{"id":4150000000,"name":"이천시"},{"id":4155000000,"name":"안성시"},{"id":4157000000,"name":"김포시"},{"id":4159000000,"name":"화성시"},{"id":4161000000,"name":"광주시"},{"id":4163000000,"name":"양주시"},{"id":4165000000,"name":"포천시"},{"id":4167000000,"name":"여주시"},{"id":4180000000,"name":"연천군"},{"id":4182000000,"name":"가평군"},{"id":4183000000,"name":"양평군"}],
    // 강원
    "강원":[{"id":5111000000,"name":"춘천시"},{"id":5113000000,"name":"원주시"},{"id":5115000000,"name":"강릉시"},{"id":5117000000,"name":"동해시"},{"id":5119000000,"name":"태백시"},{"id":5121000000,"name":"속초시"},{"id":5123000000,"name":"삼척시"},{"id":5172000000,"name":"홍천군"},{"id":5173000000,"name":"횡성군"},{"id":5175000000,"name":"영월군"},{"id":5176000000,"name":"평창군"},{"id":5177000000,"name":"정선군"},{"id":5178000000,"name":"철원군"},{"id":5179000000,"name":"화천군"},{"id":5180000000,"name":"양구군"},{"id":5181000000,"name":"인제군"},{"id":5182000000,"name":"고성군"},{"id":5183000000,"name":"양양군"}],
    // 충청권
    "세종":[{"id":3611010100,"name":"반곡동"},{"id":3611010200,"name":"소담동"},{"id":3611010300,"name":"보람동"},{"id":3611010400,"name":"대평동"},{"id":3611010500,"name":"가람동"},{"id":3611010600,"name":"한솔동"},{"id":3611010700,"name":"나성동"},{"id":3611010800,"name":"새롬동"},{"id":3611010900,"name":"다정동"},{"id":3611011000,"name":"어진동"},{"id":3611011100,"name":"종촌동"},{"id":3611011200,"name":"고운동"},{"id":3611011300,"name":"아름동"},{"id":3611011400,"name":"도담동"},{"id":3611011500,"name":"산울동"},{"id":3611011600,"name":"해밀동"},{"id":3611011700,"name":"합강동"},{"id":3611011800,"name":"집현동"},{"id":3611011900,"name":"세종동"},{"id":3611012000,"name":"누리동"},{"id":3611012100,"name":"한별동"},{"id":3611012200,"name":"다솜동"},{"id":3611012300,"name":"용호동"},{"id":3611025000,"name":"조치원읍"},{"id":3611031000,"name":"연기면"},{"id":3611032000,"name":"연동면"},{"id":3611033000,"name":"부강면"},{"id":3611034000,"name":"금남면"},{"id":3611035000,"name":"장군면"},{"id":3611036000,"name":"연서면"},{"id":3611037000,"name":"전의면"},{"id":3611038000,"name":"전동면"},{"id":3611039000,"name":"소정면"}],
    "대전":[{"id":3011000000,"name":"동구"},{"id":3014000000,"name":"중구"},{"id":3017000000,"name":"서구"},{"id":3020000000,"name":"유성구"},{"id":3023000000,"name":"대덕구"}],
    "충북":[{"id":4311000000,"name":"청주시"},{"id":4313000000,"name":"충주시"},{"id":4315000000,"name":"제천시"},{"id":4372000000,"name":"보은군"},{"id":4373000000,"name":"옥천군"},{"id":4374000000,"name":"영동군"},{"id":4374500000,"name":"증평군"},{"id":4375000000,"name":"진천군"},{"id":4376000000,"name":"괴산군"},{"id":4377000000,"name":"음성군"},{"id":4380000000,"name":"단양군"}],
    "충남":[{"id":4413000000,"name":"천안시"},{"id":4415000000,"name":"공주시"},{"id":4418000000,"name":"보령시"},{"id":4420000000,"name":"아산시"},{"id":4421000000,"name":"서산시"},{"id":4423000000,"name":"논산시"},{"id":4425000000,"name":"계룡시"},{"id":4427000000,"name":"당진시"},{"id":4471000000,"name":"금산군"},{"id":4476000000,"name":"부여군"},{"id":4477000000,"name":"서천군"},{"id":4479000000,"name":"청양군"},{"id":4480000000,"name":"홍성군"},{"id":4481000000,"name":"예산군"},{"id":4482500000,"name":"태안군"}],
    // 전라권
    "광주":[{"id":2911000000,"name":"동구"},{"id":2914000000,"name":"서구"},{"id":2915500000,"name":"남구"},{"id":2917000000,"name":"북구"},{"id":2920000000,"name":"광산구"}],
    "전북":[{"id":5211000000,"name":"전주시"},{"id":5213000000,"name":"군산시"},{"id":5214000000,"name":"익산시"},{"id":5218000000,"name":"정읍시"},{"id":5219000000,"name":"남원시"},{"id":5221000000,"name":"김제시"},{"id":5271000000,"name":"완주군"},{"id":5272000000,"name":"진안군"},{"id":5273000000,"name":"무주군"},{"id":5274000000,"name":"장수군"},{"id":5275000000,"name":"임실군"},{"id":5277000000,"name":"순창군"},{"id":5279000000,"name":"고창군"},{"id":5280000000,"name":"부안군"}],
    "전남":[{"id":4611000000,"name":"목포시"},{"id":4613000000,"name":"여수시"},{"id":4615000000,"name":"순천시"},{"id":4617000000,"name":"나주시"},{"id":4623000000,"name":"광양시"},{"id":4671000000,"name":"담양군"},{"id":4672000000,"name":"곡성군"},{"id":4673000000,"name":"구례군"},{"id":4677000000,"name":"고흥군"},{"id":4678000000,"name":"보성군"},{"id":4679000000,"name":"화순군"},{"id":4680000000,"name":"장흥군"},{"id":4681000000,"name":"강진군"},{"id":4682000000,"name":"해남군"},{"id":4683000000,"name":"영암군"},{"id":4684000000,"name":"무안군"},{"id":4686000000,"name":"함평군"},{"id":4687000000,"name":"영광군"},{"id":4688000000,"name":"장성군"},{"id":4689000000,"name":"완도군"},{"id":4690000000,"name":"진도군"},{"id":4691000000,"name":"신안군"}],
    // 경상권
    "대구":[{"id":2711000000,"name":"중구"},{"id":2714000000,"name":"동구"},{"id":2717000000,"name":"서구"},{"id":2720000000,"name":"남구"},{"id":2723000000,"name":"북구"},{"id":2726000000,"name":"수성구"},{"id":2729000000,"name":"달서구"},{"id":2771000000,"name":"달성군"},{"id":2772000000,"name":"군위군"}],
    "부산":[{"id":2611000000,"name":"중구"},{"id":2614000000,"name":"서구"},{"id":2617000000,"name":"동구"},{"id":2620000000,"name":"영도구"},{"id":2623000000,"name":"부산진구"},{"id":2626000000,"name":"동래구"},{"id":2629000000,"name":"남구"},{"id":2632000000,"name":"북구"},{"id":2635000000,"name":"해운대구"},{"id":2638000000,"name":"사하구"},{"id":2641000000,"name":"금정구"},{"id":2644000000,"name":"강서구"},{"id":2647000000,"name":"연제구"},{"id":2650000000,"name":"수영구"},{"id":2653000000,"name":"사상구"},{"id":2671000000,"name":"기장군"}],
    "울산":[{"id":3111000000,"name":"중구"},{"id":3114000000,"name":"남구"},{"id":3117000000,"name":"동구"},{"id":3120000000,"name":"북구"},{"id":3171000000,"name":"울주군"}],
    "경북":[{"id":4711000000,"name":"포항시"},{"id":4713000000,"name":"경주시"},{"id":4715000000,"name":"김천시"},{"id":4717000000,"name":"안동시"},{"id":4719000000,"name":"구미시"},{"id":4721000000,"name":"영주시"},{"id":4723000000,"name":"영천시"},{"id":4725000000,"name":"상주시"},{"id":4728000000,"name":"문경시"},{"id":4729000000,"name":"경산시"},{"id":4773000000,"name":"의성군"},{"id":4775000000,"name":"청송군"},{"id":4776000000,"name":"영양군"},{"id":4777000000,"name":"영덕군"},{"id":4782000000,"name":"청도군"},{"id":4783000000,"name":"고령군"},{"id":4784000000,"name":"성주군"},{"id":4785000000,"name":"칠곡군"},{"id":4790000000,"name":"예천군"},{"id":4792000000,"name":"봉화군"},{"id":4793000000,"name":"울진군"},{"id":4794000000,"name":"울릉군"}],
    "경남":[{"id":4812000000,"name":"창원시"},{"id":4817000000,"name":"진주시"},{"id":4822000000,"name":"통영시"},{"id":4824000000,"name":"사천시"},{"id":4825000000,"name":"김해시"},{"id":4827000000,"name":"밀양시"},{"id":4831000000,"name":"거제시"},{"id":4833000000,"name":"양산시"},{"id":4872000000,"name":"의령군"},{"id":4873000000,"name":"함안군"},{"id":4874000000,"name":"창녕군"},{"id":4882000000,"name":"고성군"},{"id":4884000000,"name":"남해군"},{"id":4885000000,"name":"하동군"},{"id":4886000000,"name":"산청군"},{"id":4887000000,"name":"함양군"},{"id":4888000000,"name":"거창군"},{"id":4889000000,"name":"합천군"}],
    // 제주
    "제주":[{"id":5011000000,"name":"제주시"},{"id":5013000000,"name":"서귀포시"}],
};

const CATEGORIES = [
    {id: 1, name: '컨퍼런스'}, {id: 2, name: '박람회'}, {id: 3, name: '전시'}, {id: 4, name: '강연/세미나'},
    {id: 5, name: '교육/워크숍'}, {id: 6, name: '공연/콘서트'}, {id: 7, name: '페스티벌/축제'}, {id: 8, name: '취업/채용'},
    {id: 9, name: '네트워킹/파티'}, {id: 10, name: '경진대회'}, {id: 11, name: '플리마켓/장터'}, {id: 12, name: '토크콘서트'},
    {id: 13, name: '스포츠/레저'}, {id: 14, name: '원데이 클래스'}, {id: 15, name: '팝업스토어'}
];

const TOPICS = [
    {id: 1, name: 'IT'}, {id: 2, name: '비즈니스/창업'}, {id: 3, name: '마케팅/브랜딩'}, {id: 4, name: '디자인/아트'},
    {id: 5, name: '재테크/투자'}, {id: 6, name: '취업/이직'}, {id: 7, name: '자기계발'}, {id: 8, name: '인문/사회/과학'},
    {id: 9, name: '환경/ESG'}, {id: 10, name: '건강/스포츠'}, {id: 11, name: '요리/베이킹'}, {id: 12, name: '음료/주류'},
    {id: 13, name: '여행/아웃도어'}, {id: 14, name: '인테리어/리빙'}, {id: 15, name: '패션/뷰티'}, {id: 16, name: '반려동물'},
    {id: 17, name: '음악/공연'}, {id: 18, name: '영화/만화/게임'}, {id: 19, name: '사진/영상제작'}, {id: 20, name: '핸드메이드/공예'},
    {id: 21, name: '육아/교육'}, {id: 22, name: '심리/명상'}, {id: 23, name: '연애/결혼'}, {id: 24, name: '종교'}, {id: 25, name: '기타'}
];

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [pageInfo, setPageInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // 💡 [해결 포인트 1] ID를 이름으로 바꿔주는 도우미 함수 (컴포넌트 최상단)
    const getCityNameFromId = (id) => {
        if (!id) return "";
        const entry = Object.entries(CITY_IDS).find(([name, cityId]) => String(cityId) === String(id));
        return entry ? entry[0] : "";
    };

    // 💡 [해결 포인트 2] 주소창 파라미터 한 번에 정리 (중복 선언 방지)
    const urlCity = searchParams.get("city") || "";
    const urlRegionId = searchParams.get("regionId") || "";
    
    // 만약 city는 없는데 regionId(지도로부터 온 값)가 있다면 이름을 찾아옵니다.
    const currentCity = urlCity || getCityNameFromId(urlRegionId); 
    const currentRegionId = urlRegionId; 
    const currentCategoryId = searchParams.get("categoryId") || "";
    const currentTopics = searchParams.getAll("topicIds");
    const currentKeyword = searchParams.get("keyword") || "";
    const currentStart = searchParams.get("filterStart") || "";
    const currentEnd = searchParams.get("filterEnd") || "";
    const isHideClosed = searchParams.get("hideClosed") === "true";
    const isCheckFree = searchParams.get("checkFree") === "true";
    const currentPage = parseInt(searchParams.get("page") || "0");

    // ✅ 수정: 의존성 배열을 [searchParams] 하나로만 유지
    // 기존에 currentTopics 등 searchParams에서 파생된 값들이 들어있어서
    // 매 렌더마다 새 배열/값이 생성되어 useEffect가 불필요하게 반복 실행됐습니다.
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                let regionId = searchParams.get("regionId") || null;
                const city = searchParams.get("city") || "";
                
                // 시/도 이름만 있을 경우 ID로 변환해서 백엔드 전달
                if (!regionId && city && CITY_IDS[city]) {
                    regionId = CITY_IDS[city];
                }

                const params = {
                    page: parseInt(searchParams.get("page") || "0"),
                    keyword: searchParams.get("keyword") || "",
                    regionId,
                    categoryId: searchParams.get("categoryId") || "",
                    filterStart: searchParams.get("filterStart") || "",
                    filterEnd: searchParams.get("filterEnd") || "",
                    checkFree: searchParams.get("checkFree") === "true",
                    hideClosed: searchParams.get("hideClosed") === "true",
                    topicIds: searchParams.getAll("topicIds").join(',') || null
                };

                const data = await fetchEventList(params);
                setEvents(data.content || []);
                setPageInfo(data);
            } catch (error) { 
                console.error("데이터 로딩 실패:", error); 
            } finally { 
                setLoading(false); 
            }
        };
        loadData();
    }, [searchParams]); // ✅ searchParams 하나만

    const setFilter = (key, value) => {
        const next = new URLSearchParams(searchParams);
        
        if (!value || value === "false") {
            next.delete(key);
        } else {
            next.set(key, value);
        }
        
        if (key !== "page") {
            next.set("page", "0");
        }
        
        setSearchParams(next);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCityChange = (city) => {
        const next = new URLSearchParams(searchParams);
        if (city) next.set("city", city);
        else next.delete("city");
        next.delete("regionId");
        next.set("page", "0");
        setSearchParams(next);
    };

    const handleTopicToggle = (topicId) => {
        const next = new URLSearchParams(searchParams);
        const idStr = String(topicId);
        if (currentTopics.includes(idStr)) {
            const filtered = currentTopics.filter(id => id !== idStr);
            next.delete("topicIds");
            filtered.forEach(id => next.append("topicIds", id));
        } else next.append("topicIds", idStr);
        next.set("page", "0");
        setSearchParams(next);
    };

    return (
        <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <style>{`
                .mohaeng-card:hover { transform: translateY(-8px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }
                .mohaeng-card img { transition: transform 0.5s ease; }
                .mohaeng-card:hover img { transform: scale(1.05); }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
            `}</style>

            <Header />
            <main style={{ flexGrow: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '40px 20px' }}>
                
                <div style={{ backgroundColor: '#FFF', padding: '20px 25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* 검색창 - 너비 고정 */}
                        <input
                            type="text"
                            placeholder="행사 제목, 한줄설명 검색... (입력 후 Enter)"
                            defaultValue={currentKeyword}
                            onKeyDown={(e) => e.key === 'Enter' && setFilter("keyword", e.target.value)}
                            style={{ width: '420px', flexShrink: 0, padding: '13px 18px', borderRadius: '12px', border: '1px solid #E5E7EB', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }}
                        />
                        {/* 구분선 */}
                        <div style={{ width: '1px', height: '36px', backgroundColor: '#E5E7EB', flexShrink: 0 }} />
                        {/* 날짜 필터 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#6B7280', whiteSpace: 'nowrap' }}>📅 기간</span>
                            <input type="date" value={currentStart} onChange={(e) => setFilter("filterStart", e.target.value)} style={{ ...dateInputStyle, padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: '10px', backgroundColor: '#F9FAFB' }} />
                            <span style={{ color: '#9CA3AF', fontWeight: 'bold' }}>~</span>
                            <input type="date" value={currentEnd} onChange={(e) => setFilter("filterEnd", e.target.value)} style={{ ...dateInputStyle, padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: '10px', backgroundColor: '#F9FAFB' }} />
                            {(currentStart || currentEnd) && (
                                <button
                                    onClick={() => { setFilter("filterStart", ""); setFilter("filterEnd", ""); }}
                                    style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '15px', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
                                    title="날짜 초기화"
                                >✕</button>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ backgroundColor: '#FFF', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '25px' }}>
                        <div style={{ minWidth: '160px' }}>
                            <select 
                                value={currentCity} 
                                onChange={(e) => handleCityChange(e.target.value)} 
                                style={{ ...selectStyle, width: '100%', border: '2px solid #FFD700', backgroundColor: '#FFFAEB' }}
                            >
                                <option value="">- 지역선택 -</option>
                                {Object.keys(REGION_DATA).map(city => <option key={city} value={city}>{city}</option>)}
                            </select>
                        </div>
                        
                        <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '10px', paddingTop: '4px' }}>
                            {!currentCity ? (
                                <div style={{ color: '#9CA3AF', fontSize: '14px', padding: '8px 0', fontWeight: 'bold' }}>
                                    👈 왼쪽에서 시/도를 선택하면 세부 지역(구/군)을 고를 수 있어요!
                                </div>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => setFilter("regionId", "")}
                                        style={{ ...regionTagStyle, backgroundColor: !currentRegionId ? '#FFD700' : '#F3F4F6', color: !currentRegionId ? '#111' : '#6B7280' }}
                                    >전체</button>
                                    {REGION_DATA[currentCity].map(town => (
                                        <button 
                                            key={town.id}
                                            onClick={() => setFilter("regionId", town.id)}
                                            style={{ 
                                                ...regionTagStyle, 
                                                backgroundColor: String(currentRegionId) === String(town.id) ? '#FFD700' : '#F3F4F6', 
                                                color: String(currentRegionId) === String(town.id) ? '#111' : '#6B7280'
                                            }}
                                        >{town.name}</button>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '40px' }}>
                    <aside style={{ width: '250px', flexShrink: 0 }}>
                        <div style={{ position: 'sticky', top: '20px' }}>
                            <div style={{ backgroundColor: '#FFF', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
                                <h3 style={sidebarTitleStyle}>CATEGORIES</h3>
                                <ul style={sidebarListStyle}>
                                    <li onClick={() => setFilter("categoryId", "")} style={{ color: !currentCategoryId ? '#FFD700' : '#4B5563', fontWeight: !currentCategoryId ? '900' : '600' }}>전체 보기</li>
                                    {/* 💡 에러 해결: === 연산자로 비교 변경 */}
                                    {CATEGORIES.map(cat => (
                                        <li key={cat.id} onClick={() => setFilter("categoryId", cat.id)} style={{ color: String(currentCategoryId) === String(cat.id) ? '#FFD700' : '#4B5563', fontWeight: String(currentCategoryId) === String(cat.id) ? '900' : '600' }}>
                                            • {cat.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ backgroundColor: '#FFF', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', maxHeight: '500px', overflowY: 'auto' }} className="custom-scrollbar">
                                <h3 style={sidebarTitleStyle}>TOPICS <span style={{fontSize: '11px', color: '#9CA3AF', fontWeight: 'normal'}}>(중복가능)</span></h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {TOPICS.map(topic => (
                                        <label key={topic.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#4B5563', cursor: 'pointer', fontWeight: '600' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={currentTopics.includes(String(topic.id))}
                                                onChange={() => handleTopicToggle(topic.id)}
                                                style={{ accentColor: '#FFD700', width: '18px', height: '18px', cursor: 'pointer' }} 
                                            /> {topic.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: '2px solid #F3F4F6' }}>
                            <div style={{ display: 'flex', gap: '25px', fontSize: '14px', fontWeight: '800', color: '#4B5563' }}>
                                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input type="checkbox" checked={isHideClosed} onChange={(e) => setFilter("hideClosed", e.target.checked)} style={{ accentColor: '#FFD700', width: '16px', height: '16px' }} /> 
                                    종료된 행사 가리기
                                </label>
                                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input type="checkbox" checked={isCheckFree} onChange={(e) => setFilter("checkFree", e.target.checked)} style={{ accentColor: '#FFD700', width: '16px', height: '16px' }} /> 
                                    무료 행사만 보기
                                </label>
                            </div>
                            
                            <button 
                                onClick={() => navigate('/events/new')}
                                style={{ backgroundColor: '#FFD700', color: '#111', border: 'none', padding: '12px 28px', borderRadius: '12px', fontWeight: '900', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,215,0,0.4)', transition: 'transform 0.1s' }}
                            >✨ 행사 만들기</button>
                        </div>

                        {loading ? (
                            <div style={{textAlign:'center', padding:'100px 0', fontSize: '18px', fontWeight: 'bold', color: '#FFD700'}}>
                                🌼 멋진 행사들을 불러오고 있어요...
                            </div>
                        ) : events.length === 0 ? (
                            <div style={{textAlign:'center', padding:'100px 0', backgroundColor: '#FFF', borderRadius: '20px', border: '2px dashed #E5E7EB'}}>
                                <p style={{fontSize: '18px', fontWeight: 'bold', color: '#9CA3AF'}}>선택하신 조건에 맞는 행사가 없네요 😢</p>
                                <p style={{fontSize: '14px', color: '#D1D5DB', marginTop: '10px'}}>필터 조건을 조금만 바꿔보시는 건 어떨까요?</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                                {events.map(event => (
                                    <div key={event.eventId} className="mohaeng-card" onClick={() => navigate(`/events/${event.eventId}`)} style={cardStyle}>
                                        <div style={{ height: '190px', backgroundColor: '#F3F4F6', overflow: 'hidden', position: 'relative' }}>
<img 
    // 💡 주소 앞에 http://localhost:8080 을 꼭 붙여주세요!
    src={`http://localhost:8080/upload_files/event/${event.thumbnail}`} 
    alt={event.title} 
    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
    onError={(e) => { 
        // 💡 가끔 placeholder 사이트가 안 뜰 때가 있어서, 더 확실한 곳으로 바꿨습니다.
        e.target.src = "https://dummyimage.com/400x300/f3f4f6/666666.png&text=Mohaeng"; 
    }} 
/>
                                            <div style={{ position: 'absolute', top: '15px', left: '15px', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '900', color: '#FFD700', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                                {event.category?.categoryName || event.category?.name || '이벤트'}
                                            </div>
                                        </div>
                                        <div style={{ padding: '22px' }}>
                                            <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '900', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</h4>
                                            <p style={{ margin: '0 0 18px 0', fontSize: '13px', color: '#6B7280', height: '38px', overflow: 'hidden', lineHeight: '1.4' }}>{event.simpleExplain}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9CA3AF', fontWeight: '800', borderTop: '1px solid #F3F4F6', paddingTop: '15px' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📍 {event.region?.regionName || event.region?.name || '지역미상'}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📅 {event.startDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && pageInfo.totalPages > 0 && (
                            <div style={{ marginTop: '70px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                <button disabled={pageInfo.first} onClick={() => setFilter("page", currentPage - 1)} style={pageBtnStyle(false, pageInfo.first)}>이전</button>
                                {[...Array(pageInfo.totalPages)].map((_, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setFilter("page", i)} 
                                        style={pageBtnStyle(currentPage === i, false)}
                                    >{i + 1}</button>
                                ))}
                                <button disabled={pageInfo.last} onClick={() => setFilter("page", currentPage + 1)} style={pageBtnStyle(false, pageInfo.last)}>다음</button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

const selectStyle = { padding: '12px 15px', borderRadius: '12px', outline: 'none', fontWeight: '800', color: '#111', cursor: 'pointer' };
const regionTagStyle = { padding: '8px 18px', borderRadius: '25px', border: 'none', fontSize: '13px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' };
const dateInputStyle = { border: 'none', background: 'transparent', outline: 'none', fontWeight: '800', color: '#4B5563', fontSize: '14px', cursor: 'pointer' };
const sidebarTitleStyle = { fontSize: '16px', fontWeight: '900', borderLeft: '5px solid #FFD700', paddingLeft: '12px', marginBottom: '22px', color: '#111', letterSpacing: '0.5px' };
const sidebarListStyle = { listStyle: 'none', padding: 0, fontSize: '15px', lineHeight: '2.8', cursor: 'pointer' };
const cardStyle = { backgroundColor: '#FFF', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.3s ease' };

const pageBtnStyle = (isActive, isDisabled) => ({
    padding: '10px 16px', minWidth: '42px', height: '42px', border: 'none', borderRadius: '12px', fontSize: '14px',
    fontWeight: '900', cursor: isDisabled ? 'not-allowed' : 'pointer', transition: '0.2s',
    backgroundColor: isActive ? '#FFD700' : '#FFF',
    color: isActive ? '#111' : (isDisabled ? '#D1D5DB' : '#6B7280'),
    boxShadow: isActive ? '0 4px 10px rgba(255,215,0,0.3)' : '0 2px 5px rgba(0,0,0,0.02)'
});

export default EventList;
