import React, { useCallback, useEffect } from "react";
import { notificationApi } from "../api/notificationApi";
import useNotificationCount from "../hooks/useNotificationCount";
import useNotificationList from "../hooks/useNotificationList";
import useReadNotification from "../hooks/useReadNotification";
import useReadAllNotifications from "../hooks/useReadAllNotifications";
import NotificationList from "../components/NotificationList";
import ReadAllButton from "../components/ReadAllButton";

export default function NotificationPage() {
  const { count, setCount, refetch: refetchCount } = useNotificationCount({ pollMs: 0 });
  const { items, setItems, loading, error, fetchList } = useNotificationList();
  const { read } = useReadNotification();
  const { readAll } = useReadAllNotifications();

  const refreshPage = useCallback(async () => {
    await Promise.all([refetchCount(), fetchList({ page: 0, size: 20 })]);
  }, [refetchCount, fetchList]);

  useEffect(() => {
    refreshPage();

    const unsubscribe = notificationApi.subscribe({
      onReload: refreshPage,
      onError: (e) => {
        console.error("알림 SSE 오류:", e);
      },
    });

    return () => unsubscribe?.();
  }, [refreshPage]);

  const onItemClick = async (id) => {
    await read(id);
    setItems((prev) => prev.filter((it) => (it.notificationId ?? it.id) !== id));
    setCount((c) => Math.max(0, Number(c) - 1));
  };

  const onReadAll = async () => {
    await readAll();
    setItems([]);
    setCount(0);
  };

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>알림 ({count})</h2>
        <ReadAllButton onClick={onReadAll} disabled={count === 0 || loading} />
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #ffd5d5", borderRadius: 12 }}>
          불러오기 실패: {error?.message ?? "에러"}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        {loading && <div style={{ opacity: 0.7 }}>불러오는 중...</div>}
        {!loading && items.length === 0 && <div style={{ opacity: 0.7 }}>알림이 없어요.</div>}
        {!loading && items.length > 0 && <NotificationList items={items} onItemClick={onItemClick} />}
      </div>
    </div>
  );
}