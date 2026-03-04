// src/features/event/report/components/ReportCategorySelect.jsx
import React from "react";

// 유저가 선택하는 신고 사유(6개)
export const REPORT_REASONS = [
  { value: "SPAM", label: "광고/스팸/도배" },
  { value: "FRAUD", label: "허위 정보/내용 불일치" },
  { value: "COPYRIGHT", label: "도용/사칭/저작권 침해" },
  { value: "INAPPROPRIATE", label: "부적절한 내용" },
  { value: "DUPLICATE", label: "중복/반복 등록" },
  { value: "OTHER", label: "기타" },
];

export default function ReportCategorySelect({
  value,
  onChange,
  disabled = false,
  className = "",
}) {
  return (
    <div className={className}>
      <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>
        신고 사유
      </label>

      <select
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #ddd",
          background: disabled ? "#f5f5f5" : "#fff",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <option value="" disabled>
          신고 사유를 선택해주세요
        </option>

        {REPORT_REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}