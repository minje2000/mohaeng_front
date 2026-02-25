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

// ✅ “숫자 userId”를 프론트에서만 해결
function resolveNumericUserId() {
  // 1) localStorage userId가 숫자면 OK
  const stored = tokenStore.getUserId();
  if (isNumericString(stored)) return String(stored);

  // 2) 아니면 accessToken(JWT)에서 꺼내기
  const access = tokenStore.getAccess();
  const payload = decodeJwtPayload(access);

  // 보통 JWT의 sub에 숫자 userId가 들어있음
  const candidate =
    payload?.sub ??
    payload?.userId ??
    payload?.id ??
    payload?.memberId ??
    payload?.uid;

  if (isNumericString(candidate)) return String(candidate);

  // 여기까지 오면 프론트에서 userId를 만들 방법이 없음
  throw new Error(
    `알림 요청 실패: userId는 숫자여야 해요. (localStorage.userId=${stored})`
  );
}

/**
 * ✅ 핵심: 알림 API는 userId 헤더 + Authorization(Bearer token) 둘 다 붙여서 보낸다.
 * (백엔드 Security가 먼저 401을 때릴 수 있어서)
 */
function requireUserHeader() {
  const userId = resolveNumericUserId();

  const token = tokenStore.getAccess();
  if (!token) {
    throw new Error("accessToken이 없어요. 다시 로그인 해주세요.");
  }

  return {
    headers: {
      userId,                          // 백엔드 @RequestHeader("userId")
      Authorization: `Bearer ${token}`, // Security 통과용
    },
  };
}

export const notificationApi = {
  async list({ page = 0, size = 5 } = {}) {
    const cfg = requireUserHeader();
    cfg.params = { page, size };
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