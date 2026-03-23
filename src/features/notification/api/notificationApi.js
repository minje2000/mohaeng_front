// src/features/notification/api/notificationApi.js
import { apiJson } from "../../../app/http/request";
import { backendUrl } from "../../../app/http/axiosInstance";
import { tokenStore } from "../../../app/http/tokenStore";

// ApiResponse { success, message, data, timestamp } 래핑 벗기기
const unwrap = (resData) => resData?.data ?? resData;

// axios 에러를 백엔드 응답 객체로 throw
function throwBackend(error) {
  if (error?.response?.data) throw error.response.data;
  throw error;
}

function parseSseChunk(chunk) {
  let eventName = "message";
  let data = "";

  const lines = chunk.split(/\r?\n/);

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      data += line.slice(5).trim();
    }
  }

  return { eventName, data };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const notificationApi = {
  async list({ page = 0, size = 5, all = false } = {}) {
    try {
      const params = all ? { all: true } : { page, size };
      const res = await apiJson().get("/api/notifications", { params });
      return unwrap(res.data);
    } catch (error) {
      throwBackend(error);
    }
  },

  async count() {
    try {
      const res = await apiJson().get("/api/notifications/count");
      return unwrap(res.data);
    } catch (error) {
      throwBackend(error);
    }
  },

  async read(notificationId) {
    try {
      const res = await apiJson().delete(`/api/notifications/${notificationId}`);
      return unwrap(res.data);
    } catch (error) {
      throwBackend(error);
    }
  },

  async readAll() {
    try {
      const res = await apiJson().delete("/api/notifications");
      return unwrap(res.data);
    } catch (error) {
      throwBackend(error);
    }
  },

  subscribe({ onReload, onConnected, onError } = {}) {
    let stopped = false;
    let retryCount = 0;
    let currentController = null;

    const connect = async () => {
      while (!stopped) {
        currentController = new AbortController();
        const token = tokenStore.getAccess();

        try {
          const res = await fetch(`${backendUrl}/api/notifications/subscribe`, {
            method: "GET",
            headers: {
              Accept: "text/event-stream",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
            signal: currentController.signal,
            cache: "no-store",
          });

          if (res.status === 401 || res.status === 403) {
            stopped = true;
            const authError = new Error(`알림 SSE 인증 실패 (${res.status})`);
            onError?.(authError);
            return;
          }

          if (!res.ok) {
            throw new Error(`알림 SSE 연결 실패 (${res.status})`);
          }

          if (!res.body) {
            throw new Error("SSE 응답 본문이 없습니다.");
          }

          retryCount = 0;
          onConnected?.();

          const reader = res.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let buffer = "";

          while (!stopped) {
            const { value, done } = await reader.read();

            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });

            let match;
            while ((match = buffer.match(/\r?\n\r?\n/))) {
              const boundaryIndex = match.index;
              const separatorLength = match[0].length;

              const rawChunk = buffer.slice(0, boundaryIndex);
              buffer = buffer.slice(boundaryIndex + separatorLength);

              if (!rawChunk.trim()) continue;

              const { eventName, data } = parseSseChunk(rawChunk);

              if (eventName !== "notification") continue;

              if (data === "CONNECTED") {
                continue;
              }

              if (data === "RELOAD") {
                onReload?.();
              }
            }
          }
        } catch (e) {
          if (stopped || currentController.signal.aborted) return;
          onError?.(e);
        }

        if (stopped) return;

        retryCount += 1;
        const delay = Math.min(1000 * 2 ** (retryCount - 1), 10000);

        await sleep(delay);
      }
    };

    connect();

    return () => {
      stopped = true;
      if (currentController) {
        currentController.abort();
      }
    };
  },
};