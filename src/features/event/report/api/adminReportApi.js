// src/features/event/report/api/adminReportApi.js
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

export async function fetchAdminReports({ page = 0, size = 10 } = {}) {
  try {
    const res = await apiJson().get("/api/admin/reports", { params: { page, size } });
    const data = unwrap(res.data);
    return { raw: data, items: pickList(data) };
  } catch (e) {
    throwBackend(e);
  }
}

export async function fetchAdminReportDetail(reportId) {
  try {
    const res = await apiJson().get(`/api/admin/reports/${reportId}`);
    return unwrap(res.data);
  } catch (e) {
    throwBackend(e);
  }
}

export async function approveAdminReport(reportId) {
  try {
    const res = await apiJson().put(`/api/admin/reports/${reportId}/approve`);
    return unwrap(res.data);
  } catch (e) {
    throwBackend(e);
  }
}

export async function rejectAdminReport(reportId) {
  try {
    const res = await apiJson().put(`/api/admin/reports/${reportId}/reject`);
    return unwrap(res.data);
  } catch (e) {
    throwBackend(e);
  }
}