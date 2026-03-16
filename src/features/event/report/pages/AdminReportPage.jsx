// src/features/event/report/pages/AdminReportPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  approveAdminReport,
  fetchAdminReportDetail,
  fetchAdminReports,
  rejectAdminReport,
} from "../api/adminReportApi";
import AdminReportDetailModal from "../components/AdminReportDetailModal";
import { reasonLabel } from "../utils/reasonLabel";
import eventThumbUrl from "../../../../shared/utils/eventThumbUrl";

const PLACEHOLDER = "https://dummyimage.com/80x80/f3f4f6/666666.png&text=Mohaeng";

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
  if (v === "REPORT_DELETED") return "삭제(신고승인)";
  return v || "-";
}

function statusWeight(v) {
  return v === "PENDING" ? 0 : 1;
}

function toImgUrl(v) {
  if (!v) return null;
  if (typeof v !== "string") return null;
  return eventThumbUrl(v);
}

// 페이지 버튼 숫자 구성(너무 많으면 ... 처리)
function buildPageItems(totalPages, current) {
  const last = totalPages - 1;
  if (totalPages <= 1) return [0];

  const windowSize = 2;
  const set = new Set([0, last]);

  for (let p = current - windowSize; p <= current + windowSize; p += 1) {
    if (p >= 0 && p <= last) set.add(p);
  }

  const pages = Array.from(set).sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < pages.length; i += 1) {
    const p = pages[i];
    const prev = pages[i - 1];
    if (i > 0 && p - prev > 1) result.push("...");
    result.push(p);
  }
  return result;
}

function pageBtnStyle(isActive, isDisabled) {
  return {
    minWidth: 32,
    height: 32,
    padding: "0 10px",
    borderRadius: 8,
    border: `1px solid ${isActive ? "#111" : "#d9d9d9"}`,
    background: isActive ? "#111" : "#fff",
    color: isActive ? "#fff" : isDisabled ? "#cfcfcf" : "#111",
    fontSize: 13,
    fontWeight: isActive ? 700 : 600,
    cursor: isDisabled ? "not-allowed" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  };
}

export default function AdminReportPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 모달 상태
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // 페이지 상태
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const totalPages = Number(raw?.totalPages ?? 0);
  const totalElements = Number(raw?.totalElements ?? 0);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAdminReports({ page, size });
      setItems(res.items);
      setRaw(res.raw);
    } catch (e) {
      setError(e?.message || e?.data || "신고 목록 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  // 미처리 위 / 처리 아래 + 최신순
  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const wa = statusWeight(a.reportResult);
      const wb = statusWeight(b.reportResult);
      if (wa !== wb) return wa - wb;

      const ta = new Date(a.createdAt ?? 0).getTime();
      const tb = new Date(b.createdAt ?? 0).getTime();
      return tb - ta;
    });
  }, [items]);

  const openDetail = async (it) => {
    setSelected(it);
    setOpen(true);

    const reportId = it.reportId ?? it.id;
    if (!reportId) return;

    try {
      const detail = await fetchAdminReportDetail(reportId);
      setSelected((prev) => ({ ...prev, ...detail }));
    } catch {
      // 실패해도 모달 유지
    }
  };

  const closeDetail = () => {
    setOpen(false);
    setSelected(null);
  };

  const handleApprove = async (report) => {
    const reportId = report?.reportId ?? report?.id;
    if (!reportId) return;

    const ok = window.confirm("이 신고를 승인 처리할까요?");
    if (!ok) return;

    try {
      await approveAdminReport(reportId);
      await load();
      closeDetail();
    } catch (e) {
      alert(e?.message || e?.data || "승인 처리 실패");
    }
  };

  const handleReject = async (report) => {
    const reportId = report?.reportId ?? report?.id;
    if (!reportId) return;

    const ok = window.confirm("이 신고를 반려 처리할까요?");
    if (!ok) return;

    try {
      await rejectAdminReport(reportId);
      await load();
      closeDetail();
    } catch (e) {
      alert(e?.message || e?.data || "반려 처리 실패");
    }
  };

  const goEventDetail = (eventId) => {
    if (!eventId) return;
    navigate(`/events/${eventId}`);
  };

  const pagerItems = useMemo(
    () => buildPageItems(totalPages, page),
    [totalPages, page]
  );

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: 0, marginBottom: 12 }}>행사 신고 관리</h2>

      <div style={{ marginBottom: 12, fontSize: 12, opacity: 0.7 }}>
        총 {totalElements.toLocaleString()}건
      </div>

      {loading && <div>불러오는 중...</div>}
      {!loading && error && <div style={{ color: "crimson" }}>{error}</div>}
      {!loading && !error && sorted.length === 0 && <div>신고가 없어요.</div>}

      {!loading && !error && sorted.length > 0 && (
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 12,
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <th style={{ textAlign: "left", padding: 12, width: 80 }}>번호</th>
                <th style={{ textAlign: "left", padding: 12, width: 320 }}>행사</th>
                <th style={{ textAlign: "left", padding: 12 }}>신고 사유</th>
                <th style={{ textAlign: "left", padding: 12, width: 180 }}>신고일</th>
                <th style={{ textAlign: "left", padding: 12, width: 110 }}>상태</th>
              </tr>
            </thead>

            <tbody>
              {sorted.map((it, idx) => {
                const reportId = it.reportId ?? it.id;
                const thumb = toImgUrl(it.eventThumbnail);

                return (
                  <tr key={reportId} style={{ borderTop: "1px solid #eee" }}>
                    <td style={{ padding: 12 }}>{page * size + (idx + 1)}</td>

                    <td style={{ padding: 12 }}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => goEventDetail(it.eventId)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            goEventDetail(it.eventId);
                          }
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          cursor: "pointer",
                        }}
                        title="행사 상세로 이동"
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
                          <img
                            src={thumb || PLACEHOLDER}
                            alt="행사 포스터"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              e.currentTarget.src = PLACEHOLDER;
                            }}
                          />
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {it.eventTitle ?? it.eventName ?? "행사"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      style={{
                        padding: 12,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                      onClick={() => openDetail(it)}
                      title="신고 상세 보기"
                    >
                      {reasonLabel(it.reasonCategory)}
                    </td>

                    <td style={{ padding: 12 }}>{formatDate(it.createdAt)}</td>
                    <td style={{ padding: 12 }}>{statusLabel(it.reportResult)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 6,
                padding: "12px 16px",
                borderTop: "1px solid #eee",
                flexWrap: "wrap",
                background: "#fff",
              }}
            >
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                style={pageBtnStyle(false, page <= 0)}
              >
                이전
              </button>

              {pagerItems.map((p, i) =>
                p === "..." ? (
                  <span
                    key={`dots-${i}`}
                    style={{
                      padding: "0 4px",
                      fontSize: 13,
                      color: "#999",
                    }}
                  >
                    …
                  </span>
                ) : (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPage(p)}
                    style={pageBtnStyle(p === page, false)}
                  >
                    {p + 1}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                style={pageBtnStyle(false, page >= totalPages - 1)}
              >
                다음
              </button>
            </div>
          )}
        </div>
      )}

      <AdminReportDetailModal
        open={open}
        report={selected}
        onClose={closeDetail}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}