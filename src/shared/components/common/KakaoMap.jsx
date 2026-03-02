import { useEffect, useRef, useState } from 'react';

export default function KakaoMap({ address, fallbackAddress, detailAddress, zipCode, title }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const openInfowindowRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [activeFilter, setActiveFilter] = useState(null);

  const clearMarkers = () => {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (openInfowindowRef.current) {
      openInfowindowRef.current.close();
      openInfowindowRef.current = null;
    }
  };

  const searchNearby = (keyword, filterKey) => {
    const map = mapInstanceRef.current;
    if (!map || !window.kakao?.maps) return;

    if (activeFilter === filterKey) {
      clearMarkers();
      setActiveFilter(null);
      return;
    }

    clearMarkers();
    setActiveFilter(filterKey);

    const ps = new window.kakao.maps.services.Places();
    const center = map.getCenter();

    ps.keywordSearch(keyword, (results, stat) => {
      if (stat !== window.kakao.maps.services.Status.OK) return;

      results.forEach(place => {
        const position = new window.kakao.maps.LatLng(place.y, place.x);
        const marker = new window.kakao.maps.Marker({ map, position, title: place.place_name });

        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:6px 10px;font-size:12px;font-weight:700;color:#111;white-space:nowrap;">
            🅿️ ${place.place_name}
            ${place.distance ? `<span style="color:#9CA3AF;font-weight:500;margin-left:4px;">${Number(place.distance).toLocaleString()}m</span>` : ''}
          </div>`,
        });

        window.kakao.maps.event.addListener(marker, 'click', () => {
          if (openInfowindowRef.current) {
            openInfowindowRef.current.close();
          }
          if (openInfowindowRef.current === infowindow) {
            openInfowindowRef.current = null;
            return;
          }
          infowindow.open(map, marker);
          openInfowindowRef.current = infowindow;
        });

        markersRef.current.push(marker);
      });

      window.kakao.maps.event.addListener(map, 'click', () => {
        if (openInfowindowRef.current) {
          openInfowindowRef.current.close();
          openInfowindowRef.current = null;
        }
      });
    }, {
      location: center,
      radius: 500,
      sort: window.kakao.maps.services.SortBy.DISTANCE,
    });
  };

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      setStatus('error');
      return;
    }

    const targetAddress = address || fallbackAddress;
    if (!targetAddress) {
      setStatus('error');
      return;
    }

    // "로/길/대로 + 숫자" 이후 건물명 제거
    const cleanAddress = (addr) => {
      const match = addr.match(/^(.*?(?:로|길|대로)\s*\d+)/);
      return match ? match[1] : addr;
    };

    window.kakao.maps.load(() => {
      const geocoder = new window.kakao.maps.services.Geocoder();

      const drawMap = (result, stat) => {
        if (stat !== window.kakao.maps.services.Status.OK) {
          setStatus('error');
          return;
        }
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
        const map = new window.kakao.maps.Map(mapRef.current, { center: coords, level: 4 });
        mapInstanceRef.current = map;

        const marker = new window.kakao.maps.Marker({ map, position: coords });
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:10px 14px;font-size:13px;font-weight:700;color:#111;white-space:nowrap;max-width:220px;overflow:hidden;text-overflow:ellipsis;line-height:1.5;">
            📍 ${title || '행사 장소'}
            ${zipCode ? `<div style="font-size:11px;color:#9CA3AF;font-weight:500;margin-top:2px;">우편번호 ${zipCode}</div>` : ''}
          </div>`,
        });
        infowindow.open(map, marker);
        setStatus('ok');
      };

      const cleaned = cleanAddress(targetAddress);

      // 1단계: 정제된 주소로 검색
      geocoder.addressSearch(cleaned, (result, stat) => {
        if (stat === window.kakao.maps.services.Status.OK) {
          drawMap(result, stat);
          return;
        }
        // 2단계: 원본 주소로 재시도
        geocoder.addressSearch(targetAddress, (result2, stat2) => {
          if (stat2 === window.kakao.maps.services.Status.OK) {
            drawMap(result2, stat2);
            return;
          }
          // 3단계: fallback 주소로 재시도
          if (fallbackAddress && fallbackAddress !== targetAddress) {
            geocoder.addressSearch(cleanAddress(fallbackAddress), drawMap);
          } else {
            setStatus('error');
          }
        });
      });
    });
  }, [address, fallbackAddress, zipCode, title]);

  const displayAddress = address || fallbackAddress;

  return (
    <div style={{ width: '100%' }}>
      {/* 주소 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
        padding: '10px 14px', background: '#FFF7ED', borderRadius: 10, border: '1px solid #FED7AA',
      }}>
        <span style={{ fontSize: 16 }}>📍</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>
            {displayAddress || '주소 정보가 없습니다.'}
            {detailAddress && (
              <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500, marginLeft: 6 }}>
                {detailAddress}
              </span>
            )}
          </div>
          {zipCode && (
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>우편번호 {zipCode}</div>
          )}
        </div>
      </div>

      {/* 버튼 라인 */}
      {status === 'ok' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => searchNearby('주차장', 'parking')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '7px 14px', borderRadius: 20, border: '1.5px solid',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                borderColor: activeFilter === 'parking' ? '#F97316' : '#E5E7EB',
                background: activeFilter === 'parking' ? '#FFF7ED' : '#fff',
                color: activeFilter === 'parking' ? '#F97316' : '#6B7280',
              }}
            >
              🅿️ 주변 주차장
            </button>
          </div>

          {displayAddress && (
            <a
              href={`https://map.kakao.com/link/search/${encodeURIComponent(displayAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '7px 14px', background: '#FAE100', color: '#3C1E1E',
                borderRadius: 20, fontSize: 13, fontWeight: 700, textDecoration: 'none',
                border: '1.5px solid #F0D800', transition: 'filter 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.filter = 'brightness(0.95)'}
              onMouseOut={e => e.currentTarget.style.filter = 'brightness(1)'}
            >
              카카오맵에서 보기
            </a>
          )}
        </div>
      )}

      {/* 지도 영역 */}
      <div style={{ position: 'relative', width: '100%', height: 360, borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {status === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', gap: 8 }}>
            <div style={{ fontSize: 28 }}>🗺️</div>
            <div style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600 }}>지도를 불러오는 중...</div>
          </div>
        )}

        {status === 'error' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', gap: 8 }}>
            <div style={{ fontSize: 28 }}>📍</div>
            <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>지도에서 찾을 수 없는 주소예요.</div>
            {displayAddress && (
              <a
                href={`https://map.kakao.com/link/search/${encodeURIComponent(displayAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 13, color: '#F97316', fontWeight: 700, marginTop: 4 }}
              >
                카카오맵에서 직접 검색하기
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
