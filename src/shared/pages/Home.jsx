import React, { useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { geoArea, geoMercator, geoPath } from "d3-geo";
import styles from "./Home.module.css";

/** 로그인 판별 */
function isLoggedIn() {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("moheng_logged_in=1");
}

/** 지역 slug */
const REGION_CENTER = {
  서울: { slug: "seoul" },
  경기: { slug: "gyeonggi" },
  인천: { slug: "incheon" },
  강원: { slug: "gangwon" },
  충북: { slug: "chungbuk" },
  충남: { slug: "chungnam" },
  세종: { slug: "sejong" },
  대전: { slug: "daejeon" },
  전북: { slug: "jeonbuk" },
  전남: { slug: "jeonnam" },
  광주: { slug: "gwangju" },
  경북: { slug: "gyeongbuk" },
  경남: { slug: "gyeongnam" },
  대구: { slug: "daegu" },
  부산: { slug: "busan" },
  울산: { slug: "ulsan" },
  제주: { slug: "jeju" },
};

function normalizeRegionName(raw) {
  if (!raw) return null;
  const s = String(raw).toLowerCase().replace(/\s/g, "");

  if (s.includes("서울")) return "서울";
  if (s.includes("세종")) return "세종";
  if (s.includes("부산")) return "부산";
  if (s.includes("인천")) return "인천";
  if (s.includes("대구")) return "대구";
  if (s.includes("대전")) return "대전";
  if (s.includes("광주")) return "광주";
  if (s.includes("울산")) return "울산";

  if (s.includes("경기")) return "경기";
  if (s.includes("강원")) return "강원";
  if (s.includes("충청북") || s.includes("충북")) return "충북";
  if (s.includes("충청남") || s.includes("충남")) return "충남";
  if (s.includes("전라북") || s.includes("전북")) return "전북";
  if (s.includes("전라남") || s.includes("전남")) return "전남";
  if (s.includes("경상북") || s.includes("경북")) return "경북";
  if (s.includes("경상남") || s.includes("경남")) return "경남";
  if (s.includes("제주")) return "제주";

  return null;
}

function keepLargestPolygonUnlessJeju(feature) {
  const name = String(feature?.properties?.NAME_1 ?? feature?.properties?.name ?? "");
  const lower = name.toLowerCase();
  const isJeju = lower.includes("jeju") || lower.includes("제주");
  if (isJeju) return feature;

  const geom = feature?.geometry;
  if (!geom) return feature;

  if (geom.type === "MultiPolygon" && Array.isArray(geom.coordinates)) {
    let bestIdx = 0;
    let bestArea = -Infinity;

    geom.coordinates.forEach((polyCoords, idx) => {
      const poly = {
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: polyCoords },
      };
      const a = geoArea(poly);
      if (a > bestArea) {
        bestArea = a;
        bestIdx = idx;
      }
    });

    return {
      ...feature,
      geometry: { type: "Polygon", coordinates: geom.coordinates[bestIdx] },
    };
  }

  return feature;
}

const labelText = {
  서울: "서울",
  세종: "세종",
  부산: "부산",
  인천: "인천",
  대구: "대구",
  대전: "대전",
  광주: "광주",
  울산: "울산",
  경기: "경기도",
  강원: "강원도",
  충북: "충청북도",
  충남: "충청남도",
  전북: "전라북도",
  전남: "전라남도",
  경북: "경상북도",
  경남: "경상남도",
  제주: "제주도",
};

const labelOffset = {
  경기: { dx: 20, dy: 35 },
  충북: { dx: -40, dy: -8 },
  제주: { dx: 0, dy: -5 },
  울산: { dx: 0, dy: 0 },
  대구: { dx: 4, dy: 0 },
  광주: { dx: 0, dy: 0 },
  세종: { dx: 0, dy: 10 },
  인천: { dx: -5, dy: 0 },
  서울: { dx: 0, dy: 5 },
  부산: { dx: 5, dy: 5 },
};

/** 아이콘 (✅ width/height를 JSX에도 박아서 CSS가 안 먹어도 커지지 않게 안전장치) */
function Icon({ children }) {
  return <span className={styles.navIcon} aria-hidden="true">{children}</span>;
}
function MapIcon() {
  return (
    <Icon>
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <path d="M9 5 3.5 7.2v11.1L9 16.1l6 2.3 5.5-2.2V5.1L15 7.4 9 5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 5v11.1" stroke="currentColor" strokeWidth="1.6" />
        <path d="M15 7.4v11" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </Icon>
  );
}
function CalendarIcon() {
  return (
    <Icon>
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <path d="M7 3v3M17 3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4.5 7.2h15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6 5.5h12a2 2 0 0 1 2 2v12.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M8 11h3M13 11h3M8 14.5h3M13 14.5h3M8 18h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </Icon>
  );
}
function BoardIcon() {
  return (
    <Icon>
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <path d="M4 20V10.2c0-.6.3-1.2.9-1.5l6.2-3.5c.6-.3 1.2-.3 1.8 0l6.2 3.5c.6.3.9.9.9 1.5V20" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M4 20h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </Icon>
  );
}
function RightIcon({ children }) {
  return <span className={styles.rightIcon} aria-hidden="true">{children}</span>;
}
function UserIcon() {
  return (
    <RightIcon>
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4.5 20.2a7.6 7.6 0 0 1 15 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </RightIcon>
  );
}
function LoginIcon() {
  return (
    <RightIcon>
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path d="M10 7V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-1" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M3 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M9 8l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </RightIcon>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const loggedIn = useMemo(() => isLoggedIn(), []);
  const requireLogin = !loggedIn;

  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let disposed = false;

    const run = async () => {
      const res = await fetch("/geo/korea-sido.json");
      const geojson = await res.json();
      if (disposed) return;

      const ns = "http://www.w3.org/2000/svg";

      svg.innerHTML = `
        <defs>
          <filter id="softShadow" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="blur"/>
            <feOffset in="blur" dx="0" dy="16" result="offsetBlur"/>
            <feColorMatrix in="offsetBlur" type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0.42 0" />
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="baseBlur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>

          <linearGradient id="tileFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="58%" stop-color="#f3f4f6"/>
            <stop offset="100%" stop-color="#e5e7eb"/>
          </linearGradient>

          <linearGradient id="tileFillHover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="55%" stop-color="#eef2f7"/>
            <stop offset="100%" stop-color="#dfe7f2"/>
          </linearGradient>
        </defs>
      `;

      const width = 1100;
      const height = 820;
      svg.setAttribute("viewBox", `0 0 ${width} ${height + 60}`);

      const cleaned = { ...geojson, features: geojson.features.map(keepLargestPolygonUnlessJeju) };

      const projection = geoMercator();
      const path = geoPath().projection(projection);

      projection.fitExtent(
        [
          [8, 8],
          [width - 8, height - 24],
        ],
        cleaned
      );

      const baseG = document.createElementNS(ns, "g");
      baseG.setAttribute("transform", "translate(0,28)");
      baseG.setAttribute("opacity", "0.70");
      baseG.setAttribute("filter", "url(#baseBlur)");
      svg.appendChild(baseG);

      const topG = document.createElementNS(ns, "g");
      topG.setAttribute("transform", "translate(0,6)");
      topG.setAttribute("filter", "url(#softShadow)");
      svg.appendChild(topG);

      let hoveredG = null;
      let hoveredPath = null;

      const resetHover = () => {
        if (!hoveredG || !hoveredPath) return;
        hoveredG.setAttribute("transform", "translate(0,0)");
        hoveredPath.setAttribute("fill", "url(#tileFill)");
        hoveredPath.setAttribute("stroke", "#9CA3AF");
        hoveredPath.setAttribute("stroke-width", "1");
        hoveredG = null;
        hoveredPath = null;
      };

      const boundsAll = cleaned.features.reduce(
        (acc, f) => {
          const b = path.bounds(f);
          acc.minX = Math.min(acc.minX, b[0][0]);
          acc.minY = Math.min(acc.minY, b[0][1]);
          acc.maxX = Math.max(acc.maxX, b[1][0]);
          acc.maxY = Math.max(acc.maxY, b[1][1]);
          return acc;
        },
        { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
      );

      const pad = 10;
      const mapX = boundsAll.minX - pad;
      const mapY = boundsAll.minY - pad;
      const mapW = boundsAll.maxX - boundsAll.minX + pad * 2;
      const mapH = boundsAll.maxY - boundsAll.minY + pad * 2;

      svg.onmousemove = (e) => {
        const ctm = svg.getScreenCTM();
        if (!ctm) return;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const p = pt.matrixTransform(ctm.inverse());

        const inside = p.x >= mapX && p.x <= mapX + mapW && p.y >= mapY && p.y <= mapY + mapH;
        if (!inside) resetHover();
      };

      cleaned.features.forEach((feature) => {
        const d = path(feature) ?? "";
        if (!d) return;

        const base = document.createElementNS(ns, "path");
        base.setAttribute("d", d);
        base.setAttribute("fill", "#bfc5cc");
        base.setAttribute("stroke", "none");
        base.style.pointerEvents = "none";
        baseG.appendChild(base);

        const g = document.createElementNS(ns, "g");
        topG.appendChild(g);

        const p = document.createElementNS(ns, "path");
        p.setAttribute("d", d);
        p.setAttribute("fill", "url(#tileFill)");
        p.setAttribute("stroke", "#9CA3AF");
        p.setAttribute("stroke-width", "1");
        p.style.cursor = "pointer";
        g.appendChild(p);

        const rawName = feature?.properties?.NAME_1 ?? feature?.properties?.name;
        const key = normalizeRegionName(rawName);

        if (key && labelText[key]) {
          const b = path.bounds(feature);
          const cx = (b[0][0] + b[1][0]) / 2;
          const cy = (b[0][1] + b[1][1]) / 2;
          const off = labelOffset[key] ?? { dx: 0, dy: 0 };

          const t = document.createElementNS(ns, "text");
          t.setAttribute("x", String(cx + off.dx));
          t.setAttribute("y", String(cy + off.dy));
          t.setAttribute("text-anchor", "middle");
          t.setAttribute("dominant-baseline", "middle");
          t.setAttribute("font-size", "13");
          t.setAttribute("font-weight", "700");
          t.setAttribute("fill", "#6b7280");
          t.setAttribute("stroke", "rgba(255,255,255,0.92)");
          t.setAttribute("stroke-width", "3");
          t.setAttribute("paint-order", "stroke");
          t.style.pointerEvents = "none";
          t.textContent = labelText[key];
          g.appendChild(t);
        }

        g.addEventListener("mouseenter", () => {
          if (hoveredG && hoveredG !== g) resetHover();
          topG.appendChild(g);
          g.setAttribute("transform", "translate(0,-12)");
          p.setAttribute("fill", "url(#tileFillHover)");
          p.setAttribute("stroke", "#374151");
          p.setAttribute("stroke-width", "2");
          hoveredG = g;
          hoveredPath = p;
        });

        g.addEventListener("mouseleave", () => {
          if (hoveredG === g) resetHover();
        });

        g.addEventListener("click", () => {
          if (!key) return;

          resetHover();
          topG.appendChild(g);

          g.style.transition = "transform 0.6s cubic-bezier(.16,1,.3,1)";
          g.setAttribute("transform", "translate(0,-14) scale(1.08)");

          p.setAttribute("stroke", "#111827");
          p.setAttribute("stroke-width", "2.2");

          setTimeout(() => {
            if (requireLogin) navigate("/login");
            else navigate(`/region/${REGION_CENTER[key].slug}`);
          }, 600);
        });
      });
    };

    run().catch(console.error);
    return () => {
      disposed = true;
    };
  }, [navigate, requireLogin]);

  const isActive = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <main className={styles.page}>
      {/* Background */}
      <div className={styles.bg}>
        <img src="/images/print.png" alt="배경" className={styles.bgImg} draggable={false} />
        <div className={styles.bgOverlay} />
      </div>

      {/* TopNav */}
      <header className={styles.nav} role="banner">
        <div className={styles.navInner}>
          <nav className={styles.navLeft} aria-label="주요 메뉴">
            <Link className={`${styles.navItem} ${isActive("/") ? styles.active : ""}`} to={loggedIn ? "/board" : "/login"}>
              <MapIcon />
              <span className={styles.navLabel}>행사 지도</span>
            </Link>

            <Link className={`${styles.navItem} ${isActive("/calendar") ? styles.active : ""}`} to="/calendar">
              <CalendarIcon />
              <span className={styles.navLabel}>행사 달력</span>
            </Link>

            <Link className={`${styles.navItem} ${isActive("/board") ? styles.active : ""}`} to="/board">
              <BoardIcon />
              <span className={styles.navLabel}>행사 게시판</span>
            </Link>
          </nav>

          <div className={styles.navRight} aria-label="계정">
            {loggedIn ? (
              <Link className={styles.authLink} to="/logout">
                <LoginIcon /> 로그아웃
              </Link>
            ) : (
              <>
                <Link className={styles.authLink} to="/api/user/signup">
                  <UserIcon /> 회원가입
                </Link>
                <Link className={styles.authLink} to="/login">
                  <LoginIcon /> 로그인
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Title + Map */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.titleBlock}>
            <img src="/images/moheng.png" alt="모행" className={styles.logo} draggable={false} />
            <h1 className={styles.title}>- 모두의 모든 행사 -</h1>
            <p className={styles.desc}>원하는 지역 클릭 시 그 지역의 행사 게시판으로 이동합니다.</p>
          </div>

          <div className={styles.mapWrap}>
            <svg ref={svgRef} className={styles.svg} preserveAspectRatio="xMidYMid meet" />
          </div>
        </div>
      </section>
    </main>
  );
}