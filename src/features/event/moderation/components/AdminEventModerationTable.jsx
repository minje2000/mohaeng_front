import React from "react";
import AdminEventModerationStatusBadge from "./AdminEventModerationStatusBadge";

function formatDate(value) {
  if (!value) return "-";
  return String(value).slice(0, 10);
}

function formatDateTime(value) {
  if (!value) return "-";
  return String(value).replace("T", " ").slice(0, 16);
}

function formatRiskScore(value) {
  if (value === null || value === undefined || value === "") return "-";
  const n = Number(value);
  if (Number.isNaN(n)) return "-";
  return n.toFixed(2);
}

export default function AdminEventModerationTable({
  items,
  loading,
  onClickDetail,
}) {
  return (
    <div style={tableWrapStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>행사명</th>
            <th style={thStyle}>행사 기간</th>
            <th style={thStyle}>행사 상태</th>
            <th style={thStyle}>검수 상태</th>
            <th style={thStyle}>위험점수</th>
            <th style={thStyle}>AI 검사 시각</th>
            <th style={thStyle}>등록일</th>
            <th style={thStyle}>관리</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td style={tdStyle} colSpan={8}>
                불러오는 중...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td style={tdStyle} colSpan={8}>
                검수 대상 행사가 없습니다.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.eventId}>
                <td style={tdStyle}>{item.title || "-"}</td>
                <td style={tdStyle}>
                  {formatDate(item.startDate)} ~ {formatDate(item.endDate)}
                </td>
                <td style={tdStyle}>{item.eventStatus || "-"}</td>
                <td style={tdStyle}>
                  <AdminEventModerationStatusBadge
                    status={item.moderationStatus}
                  />
                </td>
                <td style={tdStyle}>{formatRiskScore(item.aiRiskScore)}</td>
                <td style={tdStyle}>{formatDateTime(item.aiCheckedAt)}</td>
                <td style={tdStyle}>{formatDateTime(item.createdAt)}</td>
                <td style={tdStyle}>
                  <button
                    type="button"
                    onClick={() => onClickDetail(item.eventId)}
                    style={detailBtnStyle}
                  >
                    보기
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const tableWrapStyle = {
  overflowX: "auto",
  background: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: 18,
  boxShadow: "0 6px 24px rgba(15, 23, 42, 0.06)",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 1100,
};

const thStyle = {
  padding: "16px 14px",
  background: "#F8FAFC",
  borderBottom: "1px solid #E5E7EB",
  color: "#334155",
  fontSize: 14,
  fontWeight: 800,
  textAlign: "center",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "16px 14px",
  borderBottom: "1px solid #F1F5F9",
  color: "#0F172A",
  fontSize: 14,
  fontWeight: 600,
  textAlign: "center",
  verticalAlign: "middle",
};

const detailBtnStyle = {
  height: 38,
  padding: "0 16px",
  borderRadius: 10,
  border: "1px solid #BFDBFE",
  background: "#EFF6FF",
  color: "#1D4ED8",
  fontWeight: 800,
  cursor: "pointer",
};