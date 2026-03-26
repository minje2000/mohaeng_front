import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { geoArea, geoMercator, geoPath } from "d3-geo";
import styles from "./Home.module.css";
import { apiJson } from '../../app/http/request';
import NotificationBell from "../../features/notification/components/NotificationBell";
import { useAuth } from '../../app/providers/AuthProvider';
import { tokenStore } from '../../app/http/tokenStore';
import AiChatWidget from '../components/ai/AiChatWidget';



const REGION_CENTER = {
    서울: { slug: "seoul", id: 1100000000 },
    경기: { slug: "gyeonggi", id: 4100000000 },
    인천: { slug: "incheon", id: 2800000000 },
    강원: { slug: "gangwon", id: 5100000000 },
    충북: { slug: "chungbuk", id: 4300000000 },
    충남: { slug: "chungnam", id: 4400000000 },
    세종: { slug: "sejong", id: 3611000000 },
    대전: { slug: "daejeon", id: 3000000000 },
    전북: { slug: "jeonbuk", id: 5200000000 },
    전남: { slug: "jeonnam", id: 4600000000 },
    광주: { slug: "gwangju", id: 2900000000 },
    경북: { slug: "gyeongbuk", id: 4700000000 },
    경남: { slug: "gyeongnam", id: 4800000000 },
    대구: { slug: "daegu", id: 2700000000 },
    부산: { slug: "busan", id: 2600000000 },
    울산: { slug: "ulsan", id: 3100000000 },
    제주: { slug: "jeju", id: 5000000000 },
};

function normalizeRegionName(raw) {
  if (!raw) return null;
  const s = String(raw).replace(/\s/g, "");
  if (s.includes("서울")) return "서울";
  if (s.includes("경기")) return "경기";
  if (s.includes("인천")) return "인천";
  if (s.includes("강원")) return "강원";
  if (s.includes("충북") || s.includes("충청북")) return "충북";
  if (s.includes("충남") || s.includes("충청남")) return "충남";
  if (s.includes("전북") || s.includes("전라북")) return "전북";
  if (s.includes("전남") || s.includes("전라남")) return "전남";
  if (s.includes("경북") || s.includes("경상북")) return "경북";
  if (s.includes("경남") || s.includes("경상남")) return "경남";
  if (s.includes("제주")) return "제주";
  if (s.includes("세종")) return "세종";
  if (s.includes("대전")) return "대전";
  if (s.includes("대구")) return "대구";
  if (s.includes("광주")) return "광주";
  if (s.includes("울산")) return "울산";
  if (s.includes("부산")) return "부산";
  const lower = s.toLowerCase();
  if (lower.includes("seoul")) return "서울";
  if (lower.includes("gyeonggi")) return "경기";
  if (lower.includes("incheon")) return "인천";
  if (lower.includes("gangwon")) return "강원";
  if (lower.includes("chungbuk")) return "충북";
  if (lower.includes("chungnam")) return "충남";
  if (lower.includes("jeonbuk")) return "전북";
  if (lower.includes("jeonnam")) return "전남";
  if (lower.includes("gyeongbuk")) return "경북";
  if (lower.includes("gyeongnam")) return "경남";
  if (lower.includes("jeju")) return "제주";
  if (lower.includes("sejong")) return "세종";
  if (lower.includes("daejeon")) return "대전";
  if (lower.includes("daegu")) return "대구";
  if (lower.includes("gwangju")) return "광주";
  if (lower.includes("ulsan")) return "울산";
  if (lower.includes("busan")) return "부산";
  return null;
}

function keepLargestPolygonUnlessJeju(feature) {
  const name = String(feature?.properties?.NAME_1 ?? feature?.properties?.name ?? "");
  const lower = name.toLowerCase();
  if (lower.includes("jeju") || lower.includes("제주")) return feature;
  const geom = feature?.geometry;
  if (geom?.type === "MultiPolygon" && Array.isArray(geom.coordinates)) {
    let bestIdx = 0, bestArea = -Infinity;
    geom.coordinates.forEach((polyCoords, idx) => {
      const a = geoArea({ type: "Feature", geometry: { type: "Polygon", coordinates: polyCoords } });
      if (a > bestArea) { bestArea = a; bestIdx = idx; }
    });
    return { ...feature, geometry: { type: "Polygon", coordinates: geom.coordinates[bestIdx] } };
  }
  return feature;
}

const labelText = {
  서울: "서울", 세종: "세종", 부산: "부산", 인천: "인천", 대구: "대구",
  대전: "대전", 광주: "광주", 울산: "울산", 경기: "경기도", 강원: "강원도",
  충북: "충청북도", 충남: "충청남도", 전북: "전라북도", 전남: "전라남도",
  경북: "경상북도", 경남: "경상남도", 제주: "제주도"
};

const labelFontSize = {
  서울: 13, 세종: 11, 인천: 12, 대전: 13, 광주: 13, 대구: 14, 울산: 12, 부산: 14,
  경기: 18, 강원: 19, 충북: 15, 충남: 15, 전북: 16, 전남: 17, 경북: 18, 경남: 16, 제주: 14,
};

const labelOffset = {
  경기: { dx: 24, dy: 36 },
  충북: { dx: -32, dy: -6 },
  제주: { dx: 0, dy: -4 },
  세종: { dx: 3, dy: 12 },
  인천: { dx: 3, dy: 0 },
  서울: { dx: 2, dy: 6 },
  부산: { dx: -2, dy: 6 },
  울산: { dx: 2, dy: 0 },
  대구: { dx: 2, dy: 0 },
};

function Icon({ children }) { return <span className={styles.navIcon} aria-hidden="true">{children}</span>; }
function MapIcon() { return <Icon><svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M9 5 3.5 7.2v11.1L9 16.1l6 2.3 5.5-2.2V5.1L15 7.4 9 5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M9 5v11.1" stroke="currentColor" strokeWidth="1.6" /><path d="M15 7.4v11" stroke="currentColor" strokeWidth="1.6" /></svg></Icon>; }
function CalendarIcon() { return <Icon><svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M7 3v3M17 3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M4.5 7.2h15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M6 5.5h12a2 2 0 0 1 2 2v12.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M8 11h3M13 11h3M8 14.5h3M13 14.5h3M8 18h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></Icon>; }
function BoardIcon() { return <Icon><svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M4 20V10.2c0-.6.3-1.2.9-1.5l6.2-3.5c.6-.3 1.2-.3 1.8 0l6.2 3.5c.6.3.9.9.9 1.5V20" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M4 20h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></Icon>; }
function RightIcon({ children }) { return <span className={styles.rightIcon} aria-hidden="true">{children}</span>; }
function UserIcon() { return <RightIcon><svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="1.6" /><path d="M4.5 20.2a7.6 7.6 0 0 1 15 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></RightIcon>; }
function LoginIcon() { return <RightIcon><svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M10 7V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-1" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M3 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M9 8l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></RightIcon>; }
function BellIcon() { return <RightIcon><svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></RightIcon>; }

export default function Home() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();
  const [loggedIn, setLoggedIn] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem("accessToken") && tokenStore.getUserName());
  });

  const onLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setLoggedIn(false);
    navigate("/");
  };
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  const isActive = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    let disposed = false;

    const run = async () => {
      let countsData = [];
      try {
        const countRes = await apiJson().get("/api/events/counts").catch(() => null);
        if (countRes) {
          const raw = countRes.data || [];
          const sidoMap = {};
          raw.forEach(item => {
            const prefix = String(item.regionId).substring(0, 2);
            sidoMap[prefix] = (sidoMap[prefix] || 0) + Number(item.count);
          });
          countsData = Object.entries(sidoMap).map(([prefix, count]) => ({
            regionId: prefix,
            count,
          }));
        }
      } catch (err) { console.warn("데이터 로딩 실패"); }

      const res = await fetch("/geo/korea-sido.json");
      const geojson = await res.json();
      if (disposed) return;

      const ns = "http://www.w3.org/2000/svg";
      svg.innerHTML = `
        <defs>
          <filter id="softShadow" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="blur"/>
            <feOffset dx="0" dy="16" result="offsetBlur"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0" />
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="tileFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="58%" stop-color="#f3f4f6"/>
            <stop offset="100%" stop-color="#e5e7eb"/>
          </linearGradient>
          <linearGradient id="tileFillHover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f0f5ff"/>
            <stop offset="55%" stop-color="#dde8f8"/>
            <stop offset="100%" stop-color="#c7d9f0"/>
          </linearGradient>
        </defs>
      `;

      const width = 1800, height = 1350;
      svg.setAttribute("viewBox", `0 0 ${width} ${height + 60}`);

      const cleaned = { ...geojson, features: geojson.features.map(keepLargestPolygonUnlessJeju) };
      const projection = geoMercator();
      const pathGenerator = geoPath().projection(projection);
      projection.fitExtent([[40, 40], [width - 40, height - 40]], cleaned);

      const topG = document.createElementNS(ns, "g");
      topG.setAttribute("transform", "translate(0,6)");
      topG.setAttribute("filter", "url(#softShadow)");
      svg.appendChild(topG);

      cleaned.features.forEach((feature) => {
        const d = pathGenerator(feature) ?? "";
        if (!d) return;

        const key = normalizeRegionName(
          feature?.properties?.NAME_1 ?? feature?.properties?.name ?? feature?.properties?.CTP_KOR_NM
        );

        const g = document.createElementNS(ns, "g");
        g.setAttribute("data-region-key", key || "");
        topG.appendChild(g);

        const p = document.createElementNS(ns, "path");
        p.setAttribute("d", d);
        p.setAttribute("fill", "url(#tileFill)");
        p.setAttribute("stroke", "#6B7280");
        p.setAttribute("stroke-width", "2");
        p.setAttribute("stroke-linejoin", "round");
        p.style.cursor = "pointer";
        p.style.pointerEvents = "all";
        g.appendChild(p);

        const [cx, cy] = pathGenerator.centroid(feature);

        if (key && labelText[key]) {
          const off = labelOffset[key] ?? { dx: 0, dy: 0 };
          const fontSize = labelFontSize[key] ?? 15;

          const t = document.createElementNS(ns, "text");
          t.setAttribute("x", String(cx + off.dx));
          t.setAttribute("y", String(cy + off.dy));
          t.setAttribute("text-anchor", "middle");
          t.setAttribute("dominant-baseline", "middle");
          t.setAttribute("font-size", String(fontSize));
          t.setAttribute("font-weight", "900");
          t.setAttribute("fill", "#374151");
          t.setAttribute("letter-spacing", "-0.3");
          t.style.pointerEvents = "none";
          t.textContent = labelText[key];
          g.appendChild(t);
        }

        p.addEventListener("mousemove", (e) => {
          const tip = tooltipRef.current;
          if (!tip) return;
          tip.style.left = (e.clientX + 14) + "px";
          tip.style.top  = (e.clientY - 38) + "px";
        });

        p.addEventListener("mouseenter", (e) => {
          p.setAttribute("fill", "url(#tileFillHover)");
          p.setAttribute("stroke", "#4B72B8");
          p.setAttribute("stroke-width", "2.2");
          p.style.transformOrigin = `${cx}px ${cy}px`;
          p.style.transform = "scale(1.05) translateY(-10px)";
          p.style.transition = "transform 0.13s cubic-bezier(0.2, 0, 0.2, 1)";
          p.style.filter = "drop-shadow(0px 8px 12px rgba(0,0,0,0.4))";

          const tip = tooltipRef.current;
          if (tip && key) {
            const rid = REGION_CENTER[key]?.id;
            const ridPrefix = rid ? String(rid).substring(0, 2) : null;
            const cInfo = ridPrefix ? countsData.find(c => String(c.regionId) === ridPrefix) : null;
            const count = cInfo?.count ?? 0;
            tip.innerHTML = `
              <span style="font-weight:900;font-size:13px;color:#111">${labelText[key] ?? key}</span>
              <span style="display:block;font-size:12px;margin-top:2px;color:${count > 0 ? '#D97706' : '#9CA3AF'};font-weight:700">
                ${count > 0 ? `${count}개의 행사` : '등록된 행사 없음'}
              </span>`;
            tip.style.display = "block";
            tip.style.left = (e.clientX + 14) + "px";
            tip.style.top  = (e.clientY - 38) + "px";
          }
        });

        p.addEventListener("mouseleave", () => {
          p.setAttribute("fill", "url(#tileFill)");
          p.setAttribute("stroke", "#6B7280");
          p.setAttribute("stroke-width", "2");
          p.style.transform = "";
          p.style.filter = "";
          p.style.transition = "transform 0.12s cubic-bezier(0.4, 0, 1, 1)";

          const tip = tooltipRef.current;
          if (tip) tip.style.display = "none";
        });

        p.addEventListener("click", () => {
          if (key && REGION_CENTER[key]) {
            navigate(`/events?regionId=${REGION_CENTER[key].id}`);
          }
        });
      });
    };

    run().catch(console.error);
    return () => { disposed = true; };
  }, [navigate]);

  return (
    <main className={styles.page}>
      <div className={styles.bg} style={{ pointerEvents: "none" }}>
        <img src="/images/print.png" alt="배경" className={styles.bgImg} />
        <div className={styles.bgOverlay} />
      </div>
      <header className={styles.nav} style={{ pointerEvents: "none" }}>
        <div className={styles.navInner} style={{ pointerEvents: "auto" }}>
          <nav className={styles.navLeft}>
            <Link className={`${styles.navItem} ${isActive("/") ? styles.active : ""}`} to="/">
              <MapIcon /> <span className={styles.navLabel}>행사 지도</span>
            </Link>
            <Link className={`${styles.navItem} ${isActive("/calendar") ? styles.active : ""}`} to="/calendar">
              <CalendarIcon /> <span className={styles.navLabel}>행사 달력</span>
            </Link>
            <Link className={`${styles.navItem} ${isActive("/events") ? styles.active : ""}`} to="/events">
              <BoardIcon /> <span className={styles.navLabel}>행사 게시판</span>
            </Link>
          </nav>
          <div className={styles.navRight}>
            {loggedIn ? (
              <>
                {tokenStore.getUserName()} 님, 환영합니다!
                <NotificationBell className={styles.authLink} BellIcon={BellIcon} />
                <Link className={styles.authLink} to={isAdmin ? "/admin/stats" : "/mypage"}><UserIcon /> 마이페이지</Link>
                <a 
                  className={styles.authLink} 
                  onClick={onLogout}
                  style={{ cursor: "pointer" }}
                >
                  <LoginIcon /> 로그아웃
                </a>
              </>
            ) : (
              <>
                <Link className={styles.authLink} to="/api/user/signup"><UserIcon /> 회원가입</Link>
                <Link className={styles.authLink} to="/login"><LoginIcon /> 로그인</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.titleBlock}>
            <img src="/images/moheng.png" alt="모행" className={styles.logo} />
            <h1 className={styles.title}>- 모두의 모든 행사 -</h1>
            <p className={styles.desc}>원하는 지역 클릭 시 그 지역의 행사 게시판으로 이동합니다.</p>
          </div>
          <div className={styles.mapWrap}>
            <svg ref={svgRef} className={styles.svg} />
          </div>
          {/* 마우스 hover 툴팁 */}
          <div
            ref={tooltipRef}
            style={{
              display: "none",
              position: "fixed",
              pointerEvents: "none",
              zIndex: 9999,
              background: "rgba(255,255,255,0.97)",
              border: "1px solid #E5E7EB",
              borderRadius: "10px",
              padding: "8px 14px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.13)",
              minWidth: "110px",
              lineHeight: "1.4",
            }}
          />
          <AiChatWidget pageType="map" />
        </div>
      </section>
    </main>
  );
}
