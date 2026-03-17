// src/features/event/report/components/AdminReportDetailModal.jsx
import React, { useEffect } from "react";
import { reasonLabel } from "../utils/reasonLabel";

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

export default function AdminReportDetailModal({
  open,
  report,
  onClose,
  onApprove,
  onReject,
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const title =
    report?.eventTitle ?? report?.eventName ?? `eventId=${report?.eventId ?? "-"}`;
  const writer = report?.reporterName ?? report?.reporterId ?? "-";
  const reason = reasonLabel(report?.reasonCategory);
  const detail = report?.reasonDetailText ?? "-";
  const result = report?.reportResult;
  const isPending = result === "PENDING" || !result;

  return (
    <div
      onClick={onClose}
      style={overlayStyle}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={modalStyle}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            style={closeBtnStyle}
          >
            ✕
          </button>
        </div>

        <div style={titleBoxStyle}>{title}</div>

        <div style={rowBoxStyle}>
          <div style={{ display: "flex" }}>
            <div style={rowLabelStyle}>작성자</div>
            <div style={rowValueStyle}>{writer}</div>
          </div>
        </div>

        <div style={rowBoxStyle}>
          <div style={{ display: "flex" }}>
            <div style={rowLabelStyle}>신고 사유</div>
            <div style={rowValueStyle}>{reason}</div>
          </div>
        </div>

        <div style={detailBoxStyle}>{detail}</div>

        <div style={footerStyle}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            신고일: {formatDate(report?.createdAt)} / 상태: {statusLabel(result)}
          </div>

          {isPending ? (
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => onApprove?.(report)}
                style={approveBtnStyle}
              >
                승인
              </button>

              <button
                type="button"
                onClick={() => onReject?.(report)}
                style={rejectBtnStyle}
              >
                반려
              </button>
            </div>
          ) : (
            <div style={{ fontSize: 12, opacity: 0.7 }}>처리된 신고입니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: 16,
};

const modalStyle = {
  width: 520,
  maxWidth: "100%",
  background: "#fff",
  borderRadius: 12,
  border: "2px solid #222",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  padding: 16,
};

const closeBtnStyle = {
  border: "1px solid #ccc",
  background: "#fff",
  borderRadius: 8,
  padding: "6px 10px",
  cursor: "pointer",
};

const titleBoxStyle = {
  border: "2px solid #222",
  borderRadius: 6,
  padding: 10,
  marginBottom: 10,
  fontWeight: 700,
  textAlign: "center",
};

const rowBoxStyle = {
  border: "2px solid #222",
  borderRadius: 6,
  overflow: "hidden",
  marginBottom: 10,
};

const rowLabelStyle = {
  width: 90,
  borderRight: "2px solid #222",
  padding: 10,
  fontWeight: 700,
};

const rowValueStyle = {
  padding: 10,
  flex: 1,
};

const detailBoxStyle = {
  border: "2px solid #222",
  borderRadius: 6,
  padding: 12,
  minHeight: 140,
  whiteSpace: "pre-wrap",
};

const footerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 12,
  gap: 12,
};

const approveBtnStyle = {
  height: 42,
  padding: "0 18px",
  borderRadius: 10,
  border: "1px solid #A7F3D0",
  background: "#ECFDF5",
  color: "#047857",
  fontWeight: 800,
  cursor: "pointer",
};

const rejectBtnStyle = {
  height: 42,
  padding: "0 18px",
  borderRadius: 10,
  border: "1px solid #FECACA",
  background: "#FEF2F2",
  color: "#B91C1C",
  fontWeight: 800,
  cursor: "pointer",
};