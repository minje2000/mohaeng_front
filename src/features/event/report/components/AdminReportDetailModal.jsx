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

  // ✅ 이름이 없으면 숫자(reportId/reporterId)로 fallback
  const writer =
    report?.reporterName ??
    report?.reporterNickname ??
    report?.nickname ??
    report?.userName ??
    report?.name ??
    report?.reporterId ??
    "-";

  const reason = report?.reasonCategory ?? "-";
  const detail = report?.reasonDetailText ?? report?.reasonDetail ?? "-";
  const poster =
    report?.posterUrl ||
    report?.thumbnailUrl ||
    report?.eventPosterUrl ||
    report?.imageUrl ||
    null;

  const handleApproveClick = () => onApprove?.(report);
  const handleRejectClick = () => onReject?.(report);

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
        {/* 상단 닫기 */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            style={{
              border: "1px solid #ccc",
              background: "#fff",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* 행사 제목(포스터가 있으면 같이) */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            border: "2px solid #222",
            borderRadius: 6,
            padding: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid #ddd",
              background: "#f5f5f5",
              flex: "0 0 auto",
            }}
          >
            {poster ? (
              <img
                src={poster}
                alt="행사 포스터"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : null}
          </div>

          <div style={{ flex: 1, fontWeight: 700, textAlign: "center" }}>{title}</div>
        </div>

        {/* 작성자 */}
        <div
          style={{
            border: "2px solid #222",
            borderRadius: 6,
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex" }}>
            <div
              style={{
                width: 90,
                borderRight: "2px solid #222",
                padding: 10,
                fontWeight: 700,
              }}
            >
              작성자
            </div>
            <div style={{ padding: 10, flex: 1 }}>{writer}</div>
          </div>
        </div>

        {/* 신고 사유 */}
        <div
          style={{
            border: "2px solid #222",
            borderRadius: 6,
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex" }}>
            <div
              style={{
                width: 90,
                borderRight: "2px solid #222",
                padding: 10,
                fontWeight: 700,
              }}
            >
              신고 사유
            </div>
            <div style={{ padding: 10, flex: 1 }}>{reason}</div>
          </div>
        </div>

        {/* 신고 내용 */}
        <div
          style={{
            border: "2px solid #222",
            borderRadius: 6,
            padding: 12,
            minHeight: 140,
            whiteSpace: "pre-wrap",
          }}
        >
          {detail}
        </div>

        {/* 하단: 신고일 + 처리 아이콘(모달에서만) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 12,
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            신고일: {formatDate(report?.createdAt)}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={handleRejectClick}
              title="반려"
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                border: "2px solid #222",
                background: "#fff",
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              🗑️
            </button>

            <button
              type="button"
              onClick={handleApproveClick}
              title="승인"
              aria-label="승인"
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                border: "2px solid #222",
                background: "#d11",
                cursor: "pointer",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}