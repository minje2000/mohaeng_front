// src/features/event/wishlist/pages/WishMyPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./WishMyPage.module.css";
import {
  fetchWishlist,
  removeWishlist,
  toggleWishlistNotification,
} from "../api/wishlistApi";

//  EventDetail.jsx와 동일한 경로로 맞춤
const UPLOAD_BASE = "http://localhost:8080/upload_files/event";
const PLACEHOLDER =
  "https://dummyimage.com/80x80/f3f4f6/666666.png&text=Mohaeng";

function toImgUrl(v) {
  if (!v) return null;
  if (typeof v !== "string") return null;
  if (v.startsWith("http")) return v;
  // 파일명만 내려오는 경우 → 서버 경로 붙이기
  return `${UPLOAD_BASE}/${v}`;
}

function getTitle(item) {
  return (
    item?.eventTitle ||
    item?.title ||
    item?.name ||
    (item?.eventId != null ? `행사 #${item.eventId}` : "행사")
  );
}

function getThumb(item) {
  //  백엔드가 내려주는 eventThumbnail(파일명) 우선
  return toImgUrl(
    item?.eventThumbnail ||
      item?.thumbnailUrl ||
      item?.thumbUrl ||
      item?.imageUrl ||
      item?.posterUrl ||
      item?.eventImageUrl ||
      null
  );
}

function getNotiEnabled(item) {
  return Boolean(
    item?.notificationEnabled ??
      item?.notiEnabled ??
      item?.alarmEnabled ??
      item?.notifyEnabled ??
      false
  );
}

function setNotiEnabledOnItem(item, enabled) {
  return {
    ...item,
    notificationEnabled: enabled,
  };
}

export default function WishMyPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const [items, setItems] = useState([]);
  const [raw, setRaw] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [removingId, setRemovingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const totalPages = useMemo(() => raw?.totalPages ?? null, [raw]);

  const canPrev = page > 0;
  const canNext =
    totalPages != null ? page < totalPages - 1 : (items?.length ?? 0) === size;

  const load = async (nextPage = page) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchWishlist({ page: nextPage, size });
      setItems(res?.items ?? []);
      setRaw(res?.raw ?? null);
      setPage(nextPage);
    } catch (e) {
      setItems([]);
      setRaw(null);
      setError(e?.message || "관심행사 목록을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRowClick = (eventId) => {
    if (!eventId) return;
    navigate(`/events/${eventId}`);
  };

  const handleRemove = async (wishId) => {
    if (!wishId) return;
    const ok = window.confirm("관심행사를 삭제할까요?");
    if (!ok) return;

    setRemovingId(wishId);
    try {
      await removeWishlist(wishId);
      setItems((prev) => prev.filter((it) => it.wishId !== wishId));
    } catch (e) {
      alert(e?.message || "삭제에 실패했어요.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleToggleNotification = async (item, nextEnabled) => {
    const wishId = item?.wishId;
    if (!wishId) return;

    // 1) 낙관적 업데이트
    setItems((prev) =>
      prev.map((it) =>
        it.wishId === wishId ? setNotiEnabledOnItem(it, nextEnabled) : it
      )
    );

    setTogglingId(wishId);
    try {
      const updated = await toggleWishlistNotification(wishId, nextEnabled);
      // 2) 서버가 최신 DTO를 주면 반영
      if (updated && typeof updated === "object") {
        setItems((prev) =>
          prev.map((it) => (it.wishId === wishId ? { ...it, ...updated } : it))
        );
      }
    } catch (e) {
      // 실패 시 롤백
      setItems((prev) =>
        prev.map((it) =>
          it.wishId === wishId ? setNotiEnabledOnItem(it, !nextEnabled) : it
        )
      );
      alert(e?.message || "알림 설정 변경에 실패했어요.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>관심 행사 목록</h2>
        
      </div>

      <div className={styles.table}>
        <div className={`${styles.row} ${styles.head}`}>
          <div className={styles.colNo}>번호</div>
          <div className={styles.colInfo}>관심 행사</div>
          <div className={styles.colLike}>관심</div>
          <div className={styles.colNoti}>알림</div>
        </div>

        {loading && <div className={styles.state}>불러오는 중...</div>}
        {!loading && error && <div className={styles.stateErr}>{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className={styles.state}>관심행사가 없어요.</div>
        )}

        {!loading &&
          !error &&
          items.map((item, idx) => {
            const no = page * size + idx + 1;
            const thumb = getThumb(item);
            const title = getTitle(item);

            const notiEnabled = getNotiEnabled(item);
            const isRemoving = removingId === item.wishId;
            const isToggling = togglingId === item.wishId;

            return (
              <div
                key={item.wishId ?? `${item.eventId}-${idx}`}
                className={styles.row}
              >
                <div className={styles.colNo}>{no}</div>

                {/*  이 영역(관심 행사)만 클릭 시 행사 상세로 이동 */}
                <div
                  className={styles.colInfo}
                  role="button"
                  tabIndex={0}
                  title="행사 상세로 이동"
                  onClick={() => handleRowClick(item.eventId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleRowClick(item.eventId);
                  }}
                >
                  <div className={styles.thumb}>
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.src = PLACEHOLDER;
                        }}
                      />
                    ) : (
                      <div className={styles.thumbFallback} />
                    )}
                  </div>

                  <div className={styles.infoText}>
                    <div className={styles.eventTitle}>{title}</div>
                  </div>
                </div>

                <div className={styles.colLike}>
                  <button
                    type="button"
                    className={styles.heartBtn}
                    onClick={() => handleRemove(item.wishId)}
                    disabled={isRemoving}
                    title="관심 해제"
                  >
                    ❤️
                  </button>
                </div>

                <div className={styles.colNoti}>
                  <button
                    type="button"
                    className={`${styles.bellBtn} ${
                      notiEnabled ? styles.bellOn : styles.bellOff
                    }`}
                    onClick={() => handleToggleNotification(item, !notiEnabled)}
                    disabled={isToggling}
                    title={notiEnabled ? "알림 끄기" : "알림 켜기"}
                  >
                    🔔
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      <div className={styles.pager}>
        <button
          type="button"
          onClick={() => load(page - 1)}
          disabled={loading || !canPrev}
          className={styles.pageBtn}
        >
          이전
        </button>

        <div className={styles.pageInfo}>
          {totalPages != null ? (
            <span>
              {page + 1} / {totalPages}
            </span>
          ) : (
            <span>{page + 1}</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => load(page + 1)}
          disabled={loading || !canNext}
          className={styles.pageBtn}
        >
          다음
        </button>
      </div>
    </div>
  );
}