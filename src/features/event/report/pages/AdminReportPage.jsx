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

//  업로드 경로(프로젝트에 맞게 수정 가능)
const UPLOAD_BASE = "http://localhost:8080/upload_files/event";
const PLACEHOLDER = "https://dummyimage.com/80x80/f3f4f6/666666.png&text=Mohaeng";

//  너희가 정한 신고 사유 라벨(6개)
const REASON_LABEL = {
  SPAM: "광고/스팸/도배",
  FRAUD: "허위 정보/내용 불일치",
  COPYRIGHT: "도용/사칭/저작권 침해",

  INAPPROPRIATE: "부적절한 내용",
  ABUSE: "부적절한 내용",
  ADULT: "부적절한 내용",
  ILLEGAL: "부적절한 내용",

  DUPLICATE: "중복/반복 등록",
  OTHER: "기타",
};
const reasonLabel = (v) => REASON_LABEL[v] || v || "-";

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
  return v || "-";
}

function statusWeight(v) {
  return v === "PENDING" ? 0 : 1;
}

function toImgUrl(v) {
  if (!v) return null;
  if (typeof v !== "string") return null;
  if (v.startsWith("http")) return v;
  return `${UPLOAD_BASE}/${v}`; // 파일명만 오면 서버 경로 붙이기
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

  //  미처리 위 / 처리 아래 + 최신순
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
    navigate(`/events/${eventId}`); //  행사 상세 페이지로 이동
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: 0, marginBottom: 12 }}>행사 신고 관리</h2>

      

      {loading && <div>불러오는 중...</div>}
      {!loading && error && <div style={{ color: "crimson" }}>{error}</div>}
      {!loading && !error && sorted.length === 0 && <div>신고가 없어요.</div>}

      {!loading && !error && sorted.length > 0 && (
        <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
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

                    {/*  행사 클릭 → 행사 상세 */}
                    <td style={{ padding: 12 }}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => goEventDetail(it.eventId)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") goEventDetail(it.eventId);
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

                          {/*  eventId 숨김 */}
                          {/* <div style={{ fontSize: 12, opacity: 0.7 }}>eventId: {it.eventId}</div> */}
                        </div>
                      </div>
                    </td>

                    {/*  신고 사유 클릭 → 신고 상세 팝업 */}
                    <td
                      style={{ padding: 12, cursor: "pointer", textDecoration: "underline" }}
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

          {raw && (
            <div style={{ padding: 12, fontSize: 12, opacity: 0.7 }}>
              totalElements: {raw.totalElements ?? "?"}, totalPages: {raw.totalPages ?? "?"}
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