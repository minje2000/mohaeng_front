// src/features/event/wishlist/hooks/useWishlistSyncOnEventDetail.js
import { useEffect, useRef, useState } from "react";
import { tokenStore } from "../../../../app/http/tokenStore";
import { fetchWishlist, addWishlist, removeWishlist } from "../api/wishlistApi";

export default function useWishlistSyncOnEventDetail({ eventId, liked, setLiked }) {
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const wishIdRef = useRef(null);
  const syncingRef = useRef(false);
  const pendingRef = useRef(false);
  const desiredLikedRef = useRef(liked);

  // ✅ 초기 복구 중 사용자가 눌렀는지(복구 결과가 덮어쓰지 않게)
  const userTouchedRef = useRef(false);

  // ✅ 렌더 로그 (이게 안 찍히면 훅이 아예 안 붙은 것)
  console.log("[WISHLIST HOOK] render", { eventId, liked, ready, syncing });

  useEffect(() => {
    desiredLikedRef.current = liked;
  }, [liked]);

  // ✅ ready 되기 전에 liked가 바뀌면(=사용자 클릭) 덮어쓰기 금지
  useEffect(() => {
    if (!ready) {
      userTouchedRef.current = true;
      console.log("[WISHLIST HOOK] userTouchedRef = true (before ready)");
    }
  }, [liked, ready]);

  // 1) 진입/새로고침: 서버에서 liked 복구
  useEffect(() => {
    let alive = true;

    console.log("[WISHLIST HOOK] init effect start", { eventId });

    setReady(false);
    wishIdRef.current = null;
    userTouchedRef.current = false;

    const access = tokenStore.getAccess?.();
    console.log("[WISHLIST HOOK] access token exists?", !!access);

    if (!access) {
      console.log("[WISHLIST HOOK] no access token => setLiked(false) and ready=true");
      setLiked(false);
      setReady(true);
      return () => { alive = false; };
    }

    (async () => {
      try {
        const res = await fetchWishlist({ page: 0, size: 1000 });
        const items = res?.items ?? [];

        console.log("[WISHLIST HOOK] fetched items length", items.length);

        if (!alive) return;

        const found = items.find((w) => Number(w.eventId) === Number(eventId));

        wishIdRef.current = found ? found.wishId : null;
        console.log("[WISHLIST HOOK] found?", !!found, "wishIdRef=", wishIdRef.current);

        // ✅ 사용자가 이미 눌렀으면 liked를 덮어쓰지 않음
        if (!userTouchedRef.current) {
          console.log("[WISHLIST HOOK] setLiked from server =", !!found);
          setLiked(!!found);
        } else {
          console.log("[WISHLIST HOOK] skip setLiked because userTouchedRef=true");
        }
      } catch (e) {
        console.warn("[WISHLIST HOOK] fetchWishlist failed", e);
        if (!alive) return;
        wishIdRef.current = null;
        if (!userTouchedRef.current) setLiked(false);
      } finally {
        if (alive) {
          console.log("[WISHLIST HOOK] init effect done => ready=true");
          setReady(true);
        }
      }
    })();

    return () => { alive = false; };
  }, [eventId, setLiked]);

  // 2) liked 변경 시 서버 반영(POST/DELETE)
  useEffect(() => {
    console.log("[WISHLIST HOOK] sync effect fired", { ready, liked, eventId });

    if (!ready) return;

    const access = tokenStore.getAccess?.();
    if (!access) {
      console.log("[WISHLIST HOOK] sync effect: no token");
      if (liked) {
        alert("로그인이 필요합니다.");
        setLiked(false);
      }
      return;
    }

    const syncNow = async () => {
      try {
        syncingRef.current = true;
        setSyncing(true);

        const desired = desiredLikedRef.current;
        const currentWishId = wishIdRef.current;

        console.log("[WISHLIST HOOK] syncNow start", { desired, currentWishId, eventId });

        // ON인데 wishId 없으면 -> 등록
        if (desired && !currentWishId) {
          const r = await addWishlist(Number(eventId));
          const newWishId = typeof r === "number" ? r : (r?.wishId ?? r?.id ?? null);
          wishIdRef.current = newWishId ?? null;
          console.log("[WISHLIST HOOK] add done => wishIdRef", wishIdRef.current);
        }

        // OFF인데 wishId 있으면 -> 해제
        if (!desired && currentWishId) {
          await removeWishlist(currentWishId);
          wishIdRef.current = null;
          console.log("[WISHLIST HOOK] remove done => wishIdRef null");
        }
      } catch (e) {
        console.warn("[WISHLIST HOOK] syncNow failed", e);
        alert(e?.message || "관심 처리에 실패했어요.");
        setLiked((v) => !v); // 실패 시 UI 원복
      } finally {
        syncingRef.current = false;
        setSyncing(false);

        if (pendingRef.current) {
          pendingRef.current = false;
          await syncNow();
        }
      }
    };

    if (syncingRef.current) {
      console.log("[WISHLIST HOOK] already syncing => pending=true");
      pendingRef.current = true;
      return;
    }

    syncNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liked, eventId, ready]);

  return { ready, syncing };
}
