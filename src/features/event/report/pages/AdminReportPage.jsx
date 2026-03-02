// src/features/event/report/pages/AdminReportPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  approveAdminReport,
  fetchAdminReportDetail,
  fetchAdminReports,
  rejectAdminReport,
} from "../api/adminReportApi";
import AdminReportDetailModal from "../components/AdminReportDetailModal";

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

export default function AdminReportPage() {
  const [items, setItems] = useState([]);
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 모달 상태
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const page = 0;
  const size = 10;

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
  }, []);

  // 최신순 보장(프론트)
  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const ta = new Date(a.createdAt ?? 0).getTime();
      const tb = new Date(b.createdAt ?? 0).getTime();
      return tb - ta;
    });
  }, [items]);

  const posterSrc = (it) =>
    it.posterUrl || it.thumbnailUrl || it.eventPosterUrl || it.imageUrl || null;

  const openDetail = async (it) => {
    setSelected(it);
    setOpen(true);

    const reportId = it.reportId ?? it.id;
    if (!reportId) return;

    // 목록에는 detailText/이름/포스터가 없을 수 있으니 상세로 보강
    try {
      const detail = await fetchAdminReportDetail(reportId);
      setSelected((prev) => ({ ...prev, ...detail }));
    } catch {
      // 실패해도 모달은 유지
    }
  };

  const closeDetail = () => {
    setOpen(false);
    setSelected(null);
  };

  const handleApprove = async (report) => {
    const reportId = report?.reportId ?? report?.id;
    if (!reportId) return;

    const ok = window.confirm("이 신고를 승인 처리할까요? (처리 후 목록에서 제거됩니다)");
    if (!ok) return;

    try {
      await approveAdminReport(reportId);

      //  서버에서 삭제됐으므로, 서버 기준으로 재조회해서 확실히 동기화
      await load();

      closeDetail();
    } catch (e) {
      alert(e?.message || e?.data || "승인 처리 실패");
    }
  };

  const handleReject = async (report) => {
    const reportId = report?.reportId ?? report?.id;
    if (!reportId) return;

    const ok = window.confirm("이 신고를 반려 처리할까요? (처리 후 목록에서 제거됩니다)");
    if (!ok) return;

    try {
      await rejectAdminReport(reportId);

      //  서버에서 삭제됐으므로, 서버 기준으로 재조회해서 확실히 동기화
      await load();

      closeDetail();
    } catch (e) {
      alert(e?.message || e?.data || "반려 처리 실패");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: 0, marginBottom: 12 }}>행사 신고 관리</h2>

      <div style={{ marginBottom: 10 }}>
        <button onClick={load} style={{ padding: "6px 10px", cursor: "pointer" }}>
          새로고침
        </button>
      </div>

      {loading && <div>불러오는 중...</div>}
      {!loading && error && <div style={{ color: "crimson" }}>{error}</div>}
      {!loading && !error && sorted.length === 0 && <div>신고가 없어요.</div>}

      {!loading && !error && sorted.length > 0 && (
        <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <th style={{ textAlign: "left", padding: 12, width: 80 }}>번호</th>
                <th style={{ textAlign: "left", padding: 12, width: 260 }}>행사</th>
                <th style={{ textAlign: "left", padding: 12 }}>신고 사유</th>
                <th style={{ textAlign: "left", padding: 12, width: 180 }}>신고일</th>
              </tr>
            </thead>

            <tbody>
              {sorted.map((it, idx) => {
                const reportId = it.reportId ?? it.id;
                const img = posterSrc(it);

                return (
                  <tr
                    key={reportId}
                    onClick={() => openDetail(it)}
                    style={{ borderTop: "1px solid #eee", cursor: "pointer" }}
                  >
                    <td style={{ padding: 12 }}>{page * size + (idx + 1)}</td>

                    <td style={{ padding: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                          {img ? (
                            <img
                              src={img}
                              alt="행사 포스터"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : null}
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
                            {it.eventTitle ?? it.eventName ?? `eventId=${it.eventId}`}
                          </div>
                          <div style={{ fontSize: 12, opacity: 0.7 }}>
                            eventId: {it.eventId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: 12 }}>{it.reasonCategory}</td>
                    <td style={{ padding: 12 }}>{formatDate(it.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {raw && (
            <div style={{ padding: 12, fontSize: 12, opacity: 0.7 }}>
              totalElements: {raw.totalElements ?? "?"}, totalPages: {raw.totalPages ?? "?"}
            </div>
          )}
        </div>
      )}

      {/*  모달에서만 승인/반려, 성공하면 load()로 목록 갱신 */}
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