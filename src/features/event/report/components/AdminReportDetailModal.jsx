// src/features/event/report/components/AdminReportDetailModal.jsx
import React, { useEffect } from "react";

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(v) {
  if (v === "PENDING") return "미처리";
  if (v === "APPROVED") return "승인";
  if (v === "REJECTED") return "반려";
  return v || "-";
}

export default function AdminReportDetailModal({ open, report, onClose, onApprove, onReject }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const title = report?.eventTitle ?? report?.eventName ?? `eventId=${report?.eventId ?? "-"}`;
  const writer = report?.reporterName ?? report?.reporterId ?? "-";
  const reason = report?.reasonCategory ?? "-";
  const detail = report?.reasonDetailText ?? "-";
  const result = report?.reportResult;
  const isPending = result === "PENDING" || !result;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 520,
          maxWidth: "100%",
          background: "#fff",
          borderRadius: 12,
          border: "2px solid #222",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          padding: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            style={{ border: "1px solid #ccc", background: "#fff", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        <div style={{ border: "2px solid #222", borderRadius: 6, padding: 10, marginBottom: 10, fontWeight: 700, textAlign: "center" }}>
          {title}
        </div>

        <div style={{ border: "2px solid #222", borderRadius: 6, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ display: "flex" }}>
            <div style={{ width: 90, borderRight: "2px solid #222", padding: 10, fontWeight: 700 }}>작성자</div>
            <div style={{ padding: 10, flex: 1 }}>{writer}</div>
          </div>
        </div>

        <div style={{ border: "2px solid #222", borderRadius: 6, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ display: "flex" }}>
            <div style={{ width: 90, borderRight: "2px solid #222", padding: 10, fontWeight: 700 }}>신고 사유</div>
            <div style={{ padding: 10, flex: 1 }}>{reason}</div>
          </div>
        </div>

        <div style={{ border: "2px solid #222", borderRadius: 6, padding: 12, minHeight: 140, whiteSpace: "pre-wrap" }}>
          {detail}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            신고일: {formatDate(report?.createdAt)} / 상태: {statusLabel(result)}
          </div>

          {isPending ? (
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => onReject?.(report)}
                title="반려"
                style={{ width: 44, height: 44, borderRadius: 10, border: "2px solid #222", background: "#fff", cursor: "pointer", fontSize: 18 }}
              >
                🗑️
              </button>
              <button
                type="button"
                onClick={() => onApprove?.(report)}
                title="승인"
                aria-label="승인"
                style={{ width: 44, height: 44, borderRadius: 999, border: "2px solid #222", background: "#d11", cursor: "pointer" }}
              />
            </div>
          ) : (
            <div style={{ fontSize: 12, opacity: 0.7 }}>처리된 신고입니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}