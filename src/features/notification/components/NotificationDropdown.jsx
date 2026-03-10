import React from "react";
import NotificationList from "./NotificationList";
import ReadAllButton from "./ReadAllButton";

export default function NotificationDropdown({
  open,
  count,
  items,
  loading,
  error,
  onReadAll,
  onItemClick,
  onClose,
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 36,
        width: 360,
        borderRadius: 16,
        border: "2px solid #111",
        background: "#fff",
        boxShadow: "0 12px 26px rgba(0,0,0,0.14)",
        overflow: "hidden",
        zIndex: 9999,

        //  헤더/푸터 고정 + 가운데만 스크롤
        display: "flex",
        flexDirection: "column",
        maxHeight: 520, // 필요하면 600으로 조절
      }}
    >
      {/*  헤더(고정) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          flex: "0 0 auto",
        }}
      >
        <div style={{ fontWeight: 900 }}>알림 ({count})</div>
        <ReadAllButton onClick={onReadAll} disabled={count === 0 || loading} />
      </div>

      {/*  본문(스크롤 영역) */}
      <div
        style={{
          padding: "6px 10px 10px",
          overflowY: "auto",
          overflowX: "hidden",
          flex: "1 1 auto",
        }}
      >
        {loading && (
          <div style={{ padding: "18px 10px", textAlign: "center", opacity: 0.72 }}>
            불러오는 중...
          </div>
        )}

        {!loading && error && (
          <div style={{ padding: "14px 10px", textAlign: "center", color: "#c00" }}>
            불러오기 실패
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
              {error?.message ?? "에러"}
            </div>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div style={{ padding: "18px 10px", textAlign: "center", opacity: 0.72 }}>
            알림이 없어요.
          </div>
        )}

        {!loading && !error && <NotificationList items={items} onItemClick={onItemClick} />}
      </div>

      {/*  푸터(고정) */}
      <div style={{ borderTop: "1px solid #eee", padding: "10px 12px", flex: "0 0 auto" }}>
        <button
          type="button"
          onClick={onClose}
          style={{ border: 0, background: "transparent", cursor: "pointer", fontWeight: 900 }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}