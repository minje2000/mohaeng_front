import React, { useEffect, useRef, useState } from "react";
import useNotificationCount from "../hooks/useNotificationCount";
import useNotificationList from "../hooks/useNotificationList";
import useReadNotification from "../hooks/useReadNotification";
import useReadAllNotifications from "../hooks/useReadAllNotifications";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationBell({ className, BellIcon }) {
  const [open, setOpen] = useState(false);

  const { count, setCount, refetch: refetchCount } = useNotificationCount({ pollMs: 30000 });
  const { items, setItems, loading, error, fetchList } = useNotificationList();

  const { read, loading: readLoading } = useReadNotification();
  const { readAll, loading: readAllLoading } = useReadAllNotifications();

  const wrapRef = useRef(null);
  const busy = loading || readLoading || readAllLoading;

  const refreshList = async () => {
    await Promise.all([
      refetchCount(),
      fetchList({ all: true }), //  전체 조회
    ]);
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

    const ok = await read(notificationId);
    if (!ok) return;

    setItems((prev) => prev.filter((it) => (it.notificationId ?? it.id) !== notificationId));
    setCount((c) => Math.max(0, Number(c) - 1));
  };

  const onReadAll = async () => {
    if (count <= 0) return;

    const ok = await readAll();
    if (!ok) return;

    setItems([]);
    setCount(0);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        className={className}
        aria-label="알림"
        title="알림"
        onClick={toggle}
        style={
          className
            ? { position: "relative" }
            : { border: 0, background: "transparent", cursor: "pointer", padding: 6, position: "relative" }
        }
      >
        {BellIcon ? <BellIcon /> : <span style={{ fontSize: 18 }}>🔔</span>}

        {count > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -2,
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
            }}
          >
            {count}
          </span>
        )}
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