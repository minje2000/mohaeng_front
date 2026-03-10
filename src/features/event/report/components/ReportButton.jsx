// src/features/event/report/components/ReportButton.jsx
import React from "react";

export default function ReportButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation(); //  상세페이지 다른 클릭 이벤트 방지
        onClick?.();
      }}
      style={{
        border: "1px solid #ddd",
        background: "#fff",
        borderRadius: 10,
        padding: "8px 12px",
        cursor: "pointer",
        fontWeight: 800,
      }}
    >
      신고
    </button>
  );
}