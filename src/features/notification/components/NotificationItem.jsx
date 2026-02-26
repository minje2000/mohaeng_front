import React from "react";

export default function NotificationItem({ item, onClick }) {
  const id = item.notificationId ?? item.id;
  const typeName = item.notiTypeName ?? item.typeName ?? "알림";
  const contents = item.contents ?? item.message ?? "";
  const createdAt = item.createdAt ?? "";

  return (
    <button
      type="button"
      onClick={() => id && onClick?.(id)}
      style={{
        width: "100%",
        textAlign: "left",
        border: 0,
        background: "transparent",
        cursor: "pointer",
        padding: "9px 8px",
        borderRadius: 12,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f6f6f6")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ fontWeight: 900, fontSize: 13 }}>• {typeName}</div>

      <div
        style={{
          fontSize: 12,
          opacity: 0.86,
          marginTop: 4,

          //  줄바꿈 + 긴 단어(링크/영문)도 끊기
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {contents}
      </div>

      {createdAt ? (
        <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{String(createdAt)}</div>
      ) : null}
    </button>
  );
}