// src/features/event/report/api/adminReportApi.js
import { apiJson } from "../../../../app/http/request";

function unwrap(body) {
  // ApiResponse({success, message, data}) 형태면 data만 반환
  if (body && typeof body === "object" && "success" in body && "data" in body) {
    return body.data;
  }
  return body?.data ?? body;
}

function throwBackend(error) {
  if (error?.response?.data) throw error.response.data;
  throw error;
}

function pickList(pageData) {
  if (!pageData) return [];
  return pageData.items || pageData.content || pageData.list || pageData.records || [];
}

//  목록(최신순)
export async function fetchAdminReports({ page = 0, size = 10 } = {}) {
  try {
    const res = await apiJson().get("/api/admin/reports", {
      // 백엔드가 sort를 안 받아도 프론트에서 최신순 정렬로 보정함
      params: { page, size, sort: "createdAt,desc" },
    });
    const data = unwrap(res.data);
    return { raw: data, items: pickList(data) };
  } catch (e) {
    throwBackend(e);
  }
}

//  상세(모달)
export async function fetchAdminReportDetail(reportId) {
  try {
    const res = await apiJson().get(`/api/admin/reports/${reportId}`);
    return unwrap(res.data);
  } catch (e) {
    throwBackend(e);
  }
}

//  승인
export async function approveAdminReport(reportId) {
  try {
    const res = await apiJson().put(`/api/admin/reports/${reportId}/approve`);
    return unwrap(res.data);
  } catch (e) {
    throwBackend(e);
  }
}

//  반려
export async function rejectAdminReport(reportId) {
  try {
    const res = await apiJson().put(`/api/admin/reports/${reportId}/reject`);
    return unwrap(res.data);
  } catch (e) {
    throwBackend(e);
  }
}