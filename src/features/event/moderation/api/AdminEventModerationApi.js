import { apiJson } from "../../../../app/http/request";

const unwrap = (resData) => resData?.data ?? resData;

function throwBackend(error) {
  if (error?.response?.data) throw error.response.data;
  throw error;
}

function pickList(pageData) {
  if (!pageData) return [];
  return pageData.items || pageData.content || pageData.list || pageData.records || [];
}

// GET /api/admin/events/moderation
export async function fetchAdminEventModerations({ page = 0, size = 10 } = {}) {
  try {
    const res = await apiJson().get("/api/admin/events/moderation", {
      params: { page, size },
    });

    const data = unwrap(res.data);
    return {
      raw: data,
      items: pickList(data),
    };
  } catch (e) {
    throwBackend(e);
  }
}

// GET /api/admin/events/moderation/{eventId}
export async function fetchAdminEventModerationDetail(eventId) {
  try {
    const res = await apiJson().get(`/api/admin/events/moderation/${eventId}`);
    return unwrap(res.data);
  } catch (e) {
    throwBackend(e);
  }
}

// PUT /api/admin/events/moderation/{eventId}/approve
export async function approveAdminEventModeration(eventId) {
  try {
    const res = await apiJson().put(`/api/admin/events/moderation/${eventId}/approve`);
    return unwrap(res.data);
  } catch (e) {
    throwBackend(e);
  }
}

// PUT /api/admin/events/moderation/{eventId}/reject
export async function rejectAdminEventModeration(eventId) {
  try {
    const res = await apiJson().put(`/api/admin/events/moderation/${eventId}/reject`);
    return unwrap(res.data);
  } catch (e) {
    throwBackend(e);
  }
}