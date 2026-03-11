import React, { useEffect, useRef, useState } from "react";
import {
  fetchAdminEventModerations,
  approveAdminEventModeration,
  rejectAdminEventModeration,
} from "../api/AdminEventModerationApi";
import AdminEventModerationTable from "../components/AdminEventModerationTable";

export default function AdminEventModerationPage() {
  const [items, setItems] = useState([]);
  const [rawPage, setRawPage] = useState(null);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [previewEventId, setPreviewEventId] = useState(null);
  const [previewStatus, setPreviewStatus] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // 세로형 팝업 기본 크기
  const [modalWidth, setModalWidth] = useState(900);
  const [modalHeight, setModalHeight] = useState(
    Math.min(Math.floor(window.innerHeight * 0.9), 980)
  );

  const iframeRef = useRef(null);
  const resizeObserverRef = useRef(null);

  const totalPages = rawPage?.totalPages || 0;

  const loadList = async (targetPage = page) => {
    try {
      setLoading(true);
      setMessage("");

      const result = await fetchAdminEventModerations({
        page: targetPage,
        size,
      });

      setItems(result.items || []);
      setRawPage(result.raw || null);
      setPage(result.raw?.page ?? targetPage);
    } catch (err) {
      setMessage(err?.message || "목록 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const movePage = async (nextPage) => {
    if (nextPage < 0 || nextPage >= totalPages) return;
    await loadList(nextPage);
  };

  const openPreview = (eventId) => {
    const selected = items.find((item) => item.eventId === eventId);
    setPreviewEventId(eventId);
    setPreviewStatus(selected?.moderationStatus || "");
    setActionLoading(false);
  };

  const closePreview = () => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }
    setPreviewEventId(null);
    setPreviewStatus("");
    setActionLoading(false);
  };

  const updateModalSize = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      const html = doc.documentElement;
      const body = doc.body;
      if (!html || !body) return;

      const contentWidth = Math.max(
        html.scrollWidth,
        body.scrollWidth,
        html.offsetWidth,
        body.offsetWidth
      );

      // 가로는 좁게, 세로는 길게
      const maxWidth = Math.floor(window.innerWidth * 0.72);
      const fixedHeight = Math.min(Math.floor(window.innerHeight * 0.9), 980);

      const nextWidth = Math.min(
        Math.max(contentWidth + 24, 820),
        maxWidth
      );

      setModalWidth(nextWidth);
      setModalHeight(fixedHeight);
    } catch (e) {
      // same-origin 실패 시 기본값 유지
    }
  };

  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      const prevStyle = doc.getElementById("admin-popup-force-style");
      if (prevStyle) prevStyle.remove();

      const style = doc.createElement("style");
      style.id = "admin-popup-force-style";
      style.textContent = `
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          min-width: 0 !important;
          background: #fff !important;
          overflow-x: hidden !important;
        }

        .ed-page,
        .ed-topbar,
        .ed-wrap,
        .ed-inner,
        .ed-content,
        .container,
        .inner,
        .wrap {
          width: 100% !important;
          max-width: none !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          box-sizing: border-box !important;
        }

        .ed-topbar,
        .ed-wrap,
        .ed-inner,
        .ed-content,
        .container,
        .inner,
        .wrap {
          padding-left: 18px !important;
          padding-right: 18px !important;
        }
      `;
      doc.head.appendChild(style);

      updateModalSize();

      const target = doc.documentElement || doc.body;
      if (!target) return;

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      resizeObserverRef.current = new ResizeObserver(() => {
        updateModalSize();
      });

      resizeObserverRef.current.observe(target);

      window.setTimeout(updateModalSize, 150);
      window.setTimeout(updateModalSize, 400);
      window.setTimeout(updateModalSize, 800);
    } catch (e) {
      // 무시
    }
  };

  useEffect(() => {
    const handleWindowResize = () => {
      setModalHeight(Math.min(Math.floor(window.innerHeight * 0.9), 980));
      updateModalSize();
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, []);

  const handleApprove = async () => {
    if (!previewEventId || actionLoading) return;

    const ok = window.confirm("이 행사를 승인할까요?");
    if (!ok) return;

    try {
      setActionLoading(true);
      await approveAdminEventModeration(previewEventId);
      setMessage("행사를 승인했습니다.");
      closePreview();

      const nextPage = items.length === 1 && page > 0 ? page - 1 : page;
      await loadList(nextPage);
    } catch (err) {
      setMessage(err?.message || "행사 승인 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!previewEventId || actionLoading) return;

    const ok = window.confirm("이 행사를 반려할까요?");
    if (!ok) return;

    try {
      setActionLoading(true);
      await rejectAdminEventModeration(previewEventId);
      setMessage("행사를 반려했습니다.");
      closePreview();
      await loadList(page);
    } catch (err) {
      setMessage(err?.message || "행사 반려 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const canAction = previewStatus === "승인대기";

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>
          행사 검수 관리
        </h2>
        <p style={{ marginTop: 8, color: "#64748B" }}>
          승인대기 및 반려 상태의 행사를 확인하고 검수할 수 있습니다.
        </p>
      </div>

      {message && <div style={messageStyle}>{message}</div>}

      <AdminEventModerationTable
        items={items}
        loading={loading}
        onClickDetail={openPreview}
      />

      <div style={paginationWrapStyle}>
        <button
          type="button"
          onClick={() => movePage(page - 1)}
          disabled={loading || page <= 0}
          style={{
            ...pageBtnStyle,
            ...(loading || page <= 0 ? disabledBtnStyle : {}),
          }}
        >
          이전
        </button>

        <span style={pageInfoStyle}>
          {totalPages === 0 ? 1 : page + 1} / {totalPages === 0 ? 1 : totalPages}
        </span>

        <button
          type="button"
          onClick={() => movePage(page + 1)}
          disabled={loading || totalPages === 0 || page >= totalPages - 1}
          style={{
            ...pageBtnStyle,
            ...(loading || totalPages === 0 || page >= totalPages - 1
              ? disabledBtnStyle
              : {}),
          }}
        >
          다음
        </button>
      </div>

      {previewEventId && (
        <div style={modalOverlayStyle} onClick={closePreview}>
          <div
            style={{
              ...modalContentStyle,
              width: modalWidth,
              height: modalHeight,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
                행사 상세 보기
              </h3>

              <button
                type="button"
                onClick={closePreview}
                style={modalCloseBtnStyle}
              >
                ✕
              </button>
            </div>

            <iframe
              ref={iframeRef}
              title="행사 상세 미리보기"
              src={`/popup/events/${previewEventId}`}
              style={iframeStyle}
              onLoad={handleIframeLoad}
            />

            <div style={modalFooterStyle}>
              <button
                type="button"
                onClick={handleReject}
                disabled={!canAction || actionLoading}
                style={{
                  ...rejectBtnStyle,
                  ...((!canAction || actionLoading)
                    ? disabledActionBtnStyle
                    : {}),
                }}
              >
                {actionLoading ? "처리 중..." : "반려"}
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={!canAction || actionLoading}
                style={{
                  ...approveBtnStyle,
                  ...((!canAction || actionLoading)
                    ? disabledActionBtnStyle
                    : {}),
                }}
              >
                {actionLoading ? "처리 중..." : "승인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const messageStyle = {
  marginBottom: 16,
  padding: "12px 14px",
  borderRadius: 12,
  background: "#FEF2F2",
  border: "1px solid #FECACA",
  color: "#B91C1C",
  fontWeight: 700,
};

const paginationWrapStyle = {
  marginTop: 18,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 12,
};

const pageBtnStyle = {
  minWidth: 72,
  height: 38,
  padding: "0 14px",
  borderRadius: 10,
  border: "1px solid #CBD5E1",
  background: "#FFFFFF",
  color: "#334155",
  fontWeight: 800,
  cursor: "pointer",
};

const disabledBtnStyle = {
  opacity: 0.45,
  cursor: "not-allowed",
};

const pageInfoStyle = {
  minWidth: 72,
  textAlign: "center",
  fontSize: 14,
  fontWeight: 800,
  color: "#475569",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: 20,
};

const modalContentStyle = {
  background: "#FFFFFF",
  borderRadius: 22,
  overflow: "hidden",
  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
  display: "flex",
  flexDirection: "column",
  maxWidth: "72vw",
  maxHeight: "94vh",
};

const modalHeaderStyle = {
  height: 60,
  padding: "0 18px",
  borderBottom: "1px solid #E5E7EB",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
  background: "#FFFFFF",
};

const modalCloseBtnStyle = {
  width: 36,
  height: 36,
  borderRadius: 10,
  border: "1px solid #E5E7EB",
  background: "#FFFFFF",
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 900,
};

const iframeStyle = {
  width: "100%",
  flex: 1,
  border: "none",
  background: "#FFFFFF",
};

const modalFooterStyle = {
  height: 72,
  padding: "0 20px",
  borderTop: "1px solid #E5E7EB",
  background: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 10,
  flexShrink: 0,
};

const rejectBtnStyle = {
  minWidth: 92,
  height: 40,
  padding: "0 16px",
  borderRadius: 10,
  border: "1px solid #FECACA",
  background: "#FEF2F2",
  color: "#B91C1C",
  fontWeight: 800,
  cursor: "pointer",
};

const approveBtnStyle = {
  minWidth: 92,
  height: 40,
  padding: "0 16px",
  borderRadius: 10,
  border: "1px solid #C7D2FE",
  background: "#EEF2FF",
  color: "#3730A3",
  fontWeight: 800,
  cursor: "pointer",
};

const disabledActionBtnStyle = {
  opacity: 0.45,
  cursor: "not-allowed",
};