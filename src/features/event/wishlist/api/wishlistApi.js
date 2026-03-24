// src/features/event/wishlist/api/wishlistApi.js
import { apiForm, apiJson } from '../../../../app/http/request';

function pickPageContent(pageData) {
  if (!pageData) return [];
  return pageData.content || pageData.items || pageData.list || pageData.records || [];
}

function throwBackend(error) {
  //  로그(여기 찍히면 API 호출은 된 것)
  console.warn("[WISHLIST API] ERROR", error);

  if (error?.response?.data) throw error.response.data;
  throw error;
}

// GET /api/user/wishlist
export async function fetchWishlist({ page = 0, size = 10 } = {}) {
  console.log("[WISHLIST API] fetchWishlist 호출", { page, size });

  try {
    const { data } = await apiJson().get("/api/user/wishlist", {
      params: { page, size },
    });

    //console.log("[WISHLIST API] fetchWishlist 응답 raw(ApiResponse)", data);

    const payload = data?.data; //  ApiResponse.data만
    console.log("[WISHLIST API] fetchWishlist payload", payload);

    return { raw: payload, items: pickPageContent(payload) };
  } catch (error) {
    throwBackend(error);
  }
}

// POST /api/user/wishlist
export async function addWishlist(eventId) {
  console.log("[WISHLIST API] addWishlist 호출", { eventId });

  try {
    const { data } = await apiJson().post("/api/user/wishlist", {
      eventId: Number(eventId),
    });

    console.log("[WISHLIST API] addWishlist 응답 raw(ApiResponse)", data);

    //  wishId(Long) 기대
    const payload = data?.data;
    console.log("[WISHLIST API] addWishlist payload(wishId 기대)", payload);

    return payload;
  } catch (error) {
    throwBackend(error);
  }
}

// DELETE /api/user/wishlist/{wishId}
export async function removeWishlist(wishId) {
  console.log("[WISHLIST API] removeWishlist 호출", { wishId });

  try {
    const { data } = await apiJson().delete(`/api/user/wishlist/${wishId}`);

    console.log("[WISHLIST API] removeWishlist 응답 raw(ApiResponse)", data);

    return data?.data;
  } catch (error) {
    throwBackend(error);
  }
}

// PUT /api/user/wishlist/{wishId}/notification
export async function toggleWishlistNotification(wishId, notificationEnabled) {
  try {
    const { data } = await apiJson().put(`/api/user/wishlist/${wishId}/notification`, {
      enabled: Boolean(notificationEnabled), //  핵심: enabled로 보내기
    });
    return data?.data;
  } catch (error) {
    if (error?.response?.data) throw error.response.data;
    throw error;
  }
}