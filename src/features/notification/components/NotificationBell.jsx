import React, { useEffect, useRef, useState } from "react";
import useNotificationCount from "../hooks/useNotificationCount";
import useNotificationList from "../hooks/useNotificationList";
import useReadNotification from "../hooks/useReadNotification";
import useReadAllNotifications from "../hooks/useReadAllNotifications";
import NotificationDropdown from "./NotificationDropdown";

function DefaultBellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.7 21a2 2 0 01-3.4 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function NotificationBell({ className, BellIcon }) {
  const [open, setOpen] = useState(false);

  const {
    count,
    setCount,
    refetch: refetchCount,
  } = useNotificationCount({ pollMs: 30000 });

  const {
    items,
    setItems,
    loading,
    error,
    fetchList,
  } = useNotificationList();

  const { read, loading: readLoading } = useReadNotification();
  const { readAll, loading: readAllLoading } = useReadAllNotifications();

  const wrapRef = useRef(null);
  const busy = loading || readLoading || readAllLoading;

  const Icon = BellIcon || DefaultBellIcon;

  const refreshList = async () => {
    await Promise.all([refetchCount(), fetchList({ all: true })]);
  };

  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }

    setOpen(true);
    await refreshList();
  };

  useEffect(() => {
    const onDown = (e) => {
      if (!open) return;
      if (!wrapRef.current) return;
      if (wrapRef.current.contains(e.target)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const onItemClick = async (notificationId) => {
    if (!notificationId) return;

    await read(notificationId);

    setItems((prev) =>
      prev.filter((it) => (it.notificationId ?? it.id) !== notificationId)
    );
    setCount((c) => Math.max(0, Number(c) - 1));
  };

  const onReadAll = async () => {
    if (count <= 0) return;

    await readAll();

    setItems([]);
    setCount(0);
  };

  return (
    <div
      ref={wrapRef}
      style={{ position: "relative", display: "inline-block" }}
    >
      <button
        type="button"
        className={className}
        aria-label="알림"
        title="알림"
        onClick={toggle}
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          boxShadow: "none",
          cursor: "pointer",
          padding: 0,
          margin: 0,
          appearance: "none",
          WebkitAppearance: "none",
        }}
      >
        <span
          style={{
            position: "relative",
            display: "inline-flex",
            width: 20,
            height: 20,
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 0,
          }}
        >
          <Icon />

          {count > 0 && (
            <span
              style={{
                position: "absolute",
                top: -15,
                right: -15,
                minWidth: 18,
                height: 18,
                padding: "0 5px",
                borderRadius: 999,
                background: "#ff4d4f",
                color: "#fff",
                fontSize: 11,
                lineHeight: "18px",
                textAlign: "center",
                fontWeight: 800,
                boxSizing: "border-box",
              }}
            >
              {count}
            </span>
          )}
        </span>
      </button>

      <NotificationDropdown
        open={open}
        count={count}
        items={items}
        loading={busy}
        error={error}
        onItemClick={onItemClick}
        onReadAll={onReadAll}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}