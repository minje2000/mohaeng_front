import { apiJson } from "../../../app/http/request";
import { tokenStore } from "../../../app/http/tokenStore";

// ApiResponse { success, message, data } 래핑 벗기기
const unwrap = (resData) => resData?.data ?? resData;

function isNumericString(v) {
  return /^\d+$/.test(String(v ?? ""));
}

// JWT payload 디코딩 (base64url)
function decodeJwtPayload(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "===".slice((base64.length + 3) % 4);

  try {
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function resolveNumericUserId() {
  const stored = tokenStore.getUserId();
  if (isNumericString(stored)) return String(stored);

  const access = tokenStore.getAccess();
  const payload = decodeJwtPayload(access);

  const candidate =
    payload?.sub ??
    payload?.userId ??
    payload?.id ??
    payload?.memberId ??
    payload?.uid;

  if (isNumericString(candidate)) return String(candidate);

  throw new Error(
    `알림 요청 실패: userId는 숫자여야 해요. (localStorage.userId=${stored})`
  );
}

function requireUserHeader() {
  const userId = resolveNumericUserId();

  const token = tokenStore.getAccess();
  if (!token) {
    throw new Error("accessToken이 없어요. 다시 로그인 해주세요.");
  }

  return {
    headers: {
      userId,
      Authorization: `Bearer ${token}`,
    },
  };
}

export const notificationApi = {
  //  all=true 지원
  async list({ page = 0, size = 5, all = false } = {}) {
    const cfg = requireUserHeader();

    //  all이면 ?all=true로 보내기
    cfg.params = all ? { all: true } : { page, size };

    const res = await apiJson().get("/api/notifications", cfg);
    return unwrap(res.data);
  },

  async count() {
    const res = await apiJson().get("/api/notifications/count", requireUserHeader());
    return unwrap(res.data);
  },

  async read(notificationId) {
    const res = await apiJson().delete(
      `/api/notifications/${notificationId}`,
      requireUserHeader()
    );
    return unwrap(res.data);
  },

  async readAll() {
    const res = await apiJson().delete("/api/notifications", requireUserHeader());
    return unwrap(res.data);
  },
};