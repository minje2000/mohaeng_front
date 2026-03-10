// src/features/event/report/components/ReportForm.jsx
import React, { useState } from "react";
import useCreateEventReport from "../hooks/useCreateEventReport";
import ReportCategorySelect from "./ReportCategorySelect";
import ReportDetailTextarea from "./ReportDetailTextarea";

export default function ReportForm({ eventId, onSuccess, onCancel }) {
  const { submit, loading, error } = useCreateEventReport();

  const [reasonCategory, setReasonCategory] = useState("SPAM");
  const [reasonDetailText, setReasonDetailText] = useState("");

  const onSubmit = async () => {
    if (!eventId) {
      alert("eventId가 없어요.");
      return;
    }
    if (!reasonDetailText.trim()) {
      alert("상세 사유를 입력해 주세요.");
      return;
    }

    //  백엔드 AdminReportCreateRequestDto 필드명 기준
    const payload = {
      eventId: Number(eventId),
      reasonCategory,
      reasonDetailText: reasonDetailText.trim(),
    };

    const ok = await submit(payload);
    if (!ok) {
      alert(error?.message || error?.data || "신고 등록에 실패했어요.");
      return;
    }

    alert("신고가 접수됐어요.");
    onSuccess?.();
  };

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <ReportCategorySelect
        value={reasonCategory}
        onChange={setReasonCategory}
        disabled={loading}
      />

      <ReportDetailTextarea
        value={reasonDetailText}
        onChange={setReasonDetailText}
        disabled={loading}
      />

      {error ? (
        <div style={{ color: "crimson", fontSize: 12 }}>
          {error?.message || error?.data || "에러가 발생했어요."}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            border: "1px solid #ddd",
            background: "#fff",
            borderRadius: 10,
            padding: "10px 12px",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          취소
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          style={{
            border: 0,
            background: "#111",
            color: "#fff",
            borderRadius: 10,
            padding: "10px 12px",
            cursor: "pointer",
            fontWeight: 900,
          }}
        >
          {loading ? "등록 중..." : "신고 등록"}
        </button>
      </div>
    </div>
  );
}