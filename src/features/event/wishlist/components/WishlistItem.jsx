import React, { useEffect, useState } from "react";
import NotificationToggle from "./NotificationToggle";

//  EventDetail.jsx에서 쓰는 경로와 동일하게 맞춤
const UPLOAD_BASE = "http://localhost:8080/upload_files/event";
const PLACEHOLDER =
  "https://dummyimage.com/80x80/f3f4f6/666666.png&text=Mohaeng";

const imgUrl = (fileName) => (fileName ? `${UPLOAD_BASE}/${fileName}` : PLACEHOLDER);

export default function WishlistItem({
  item,
  onRemove,
  onToggleNotification,
  removing,
  toggling,
}) {
  const [localEnabled, setLocalEnabled] = useState(!!item.notificationEnabled);

  //  item이 갱신되면 토글 상태도 동기화
  useEffect(() => {
    setLocalEnabled(!!item.notificationEnabled);
  }, [item.notificationEnabled]);

  const handleToggle = async (next) => {
    setLocalEnabled(next);
    try {
      await onToggleNotification(item.wishId, next);
    } catch {
      setLocalEnabled((v) => !v); // 실패 시 롤백
    }
  };

  const title = item.eventTitle || `행사 ID: ${item.eventId}`;

  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 12,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/*  왼쪽: 썸네일 + 행사명 */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <img
          src={imgUrl(item.eventThumbnail)}
          alt={title}
          style={{
            width: 56,
            height: 56,
            borderRadius: 10,
            objectFit: "cover",
            border: "1px solid #ddd",
            background: "#f5f5f5",
            flex: "0 0 auto",
          }}
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
        />

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              marginBottom: 4,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            eventId: {item.eventId} · wishId: {item.wishId}
          </div>
        </div>
      </div>

      {/*  오른쪽: 알림 토글 + 삭제 */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <NotificationToggle
          enabled={localEnabled}
          onChange={handleToggle}
          disabled={toggling}
        />

        <button
          type="button"
          onClick={() => onRemove(item.wishId)}
          disabled={removing}
          style={{
            border: "1px solid #ddd",
            background: removing ? "#f5f5f5" : "#fff",
            borderRadius: 10,
            padding: "8px 10px",
            cursor: removing ? "not-allowed" : "pointer",
          }}
        >
          삭제
        </button>
      </div>
    </div>
  );
}