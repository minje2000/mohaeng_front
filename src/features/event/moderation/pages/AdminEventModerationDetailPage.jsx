import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  approveAdminEventModeration,
  fetchAdminEventModerationDetail,
  rejectAdminEventModeration,
} from "../api/AdminEventModerationApi";
import AdminEventModerationStatusBadge from "../components/AdminEventModerationStatusBadge";

function formatDate(value) {
  if (!value) return "-";
  return String(value).slice(0, 10);
}

function formatDateTime(value) {
  if (!value) return "-";
  return String(value).replace("T", " ").slice(0, 16);
}

function formatTime(value) {
  if (!value) return "-";
  return String(value).slice(0, 5);
}

function formatRiskScore(value) {
  if (value === null || value === undefined || value === "") return "-";
  const n = Number(value);
  if (Number.isNaN(n)) return "-";
  return n.toFixed(2);
}

export default function AdminEventModerationDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setMessage("");
        const data = await fetchAdminEventModerationDetail(eventId);
        if (!mounted) return;
        setItem(data);
      } catch (err) {
        setMessage(err?.message || "상세 조회 중 오류가 발생했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [eventId]);

  const handleApprove = async () => {
    if (!window.confirm("이 행사를 승인할까요?")) return;

    try {
      setSubmitting(true);
      await approveAdminEventModeration(eventId);
      alert("행사를 승인했습니다.");
      navigate("/admin/moderation");
    } catch (err) {
      alert(err?.message || "승인 처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm("이 행사를 반려할까요?")) return;

    try {
      setSubmitting(true);
      await rejectAdminEventModeration(eventId);
      alert("행사를 반려했습니다.");
      navigate("/admin/moderation");
    } catch (err) {
      alert(err?.message || "반려 처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>불러오는 중...</div>;
  if (message) return <div style={{ padding: 24 }}>{message}</div>;
  if (!item) return <div style={{ padding: 24 }}>데이터가 없습니다.</div>;

  const canModerate = item.moderationStatus === "승인대기";

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={headerRowStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>
              행사 검수 상세
            </h2>
            <div style={{ marginTop: 10 }}>
              <AdminEventModerationStatusBadge status={item.moderationStatus} />
            </div>
          </div>

          <button type="button" onClick={() => navigate("/admin/moderation")} style={backBtnStyle}>
            목록
          </button>
        </div>

        <section style={sectionStyle}>
          <h3 style={sectionTitleStyle}>기본 정보</h3>
          <div style={gridStyle}>
            <Info label="행사명" value={item.title} />
            <Info label="행사 상태" value={item.eventStatus} />
            <Info label="행사 기간" value={`${formatDate(item.startDate)} ~ ${formatDate(item.endDate)}`} />
            <Info label="행사 시간" value={`${formatTime(item.startTime)} ~ ${formatTime(item.endTime)}`} />
            <Info label="참여 모집 기간" value={`${formatDate(item.startRecruit)} ~ ${formatDate(item.endRecruit)}`} />
            <Info label="부스 모집 기간" value={`${formatDate(item.boothStartRecruit)} ~ ${formatDate(item.boothEndRecruit)}`} />
            <Info label="가격" value={item.price ?? "-"} />
            <Info label="정원" value={item.capacity ?? "-"} />
            <Info label="부스 여부" value={item.hasBooth ? "있음" : "없음"} />
            <Info label="부대시설 여부" value={item.hasFacility ? "있음" : "없음"} />
          </div>
        </section>

        <section style={sectionStyle}>
          <h3 style={sectionTitleStyle}>검수 정보</h3>
          <div style={gridStyle}>
            <Info label="검수 상태" value={item.moderationStatus} />
            <Info label="위험점수" value={formatRiskScore(item.aiRiskScore)} />
            <Info label="AI 검사 시각" value={formatDateTime(item.aiCheckedAt)} />
            <Info label="등록일" value={formatDateTime(item.createdAt)} />
            <Info label="수정일" value={formatDateTime(item.updatedAt)} />
          </div>
        </section>

        <section style={sectionStyle}>
          <h3 style={sectionTitleStyle}>장소 및 설명</h3>
          <div style={gridStyle}>
            <Info label="우편번호" value={item.zipCode} />
            <Info label="지번 주소" value={item.lotNumberAdr} />
            <Info label="상세 주소" value={item.detailAdr} />
            <Info label="카테고리 ID" value={item.categoryId} />
            <Info label="지역 ID" value={item.regionId} />
            <Info label="주최자명" value={item.hostName} />
          </div>

          <div style={{ marginTop: 18 }}>
            <Block label="한줄소개" value={item.simpleExplain} />
            <Block label="상세설명" value={item.description} />
            <Block label="주제 ID" value={item.topicIds} />
            <Block label="해시태그 ID" value={item.hashtagIds} />
          </div>
        </section>

        {canModerate && (
          <div style={actionRowStyle}>
            <button
              type="button"
              onClick={handleApprove}
              disabled={submitting}
              style={{
                ...approveBtnStyle,
                ...(submitting ? disabledBtnStyle : {}),
              }}
            >
              승인
            </button>

            <button
              type="button"
              onClick={handleReject}
              disabled={submitting}
              style={{
                ...rejectBtnStyle,
                ...(submitting ? disabledBtnStyle : {}),
              }}
            >
              반려
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={infoCardStyle}>
      <div style={infoLabelStyle}>{label}</div>
      <div style={infoValueStyle}>{value || "-"}</div>
    </div>
  );
}

function Block({ label, value }) {
  return (
    <div style={blockStyle}>
      <div style={blockLabelStyle}>{label}</div>
      <div style={blockValueStyle}>{value || "-"}</div>
    </div>
  );
}

const pageStyle = {
  padding: 24,
};

const cardStyle = {
  maxWidth: 1100,
  margin: "0 auto",
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 20,
  padding: 24,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

const headerRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
};

const backBtnStyle = {
  height: 42,
  padding: "0 16px",
  borderRadius: 10,
  border: "1px solid #D1D5DB",
  background: "#FFFFFF",
  color: "#111827",
  fontWeight: 800,
  cursor: "pointer",
};

const sectionStyle = {
  marginTop: 28,
};

const sectionTitleStyle = {
  margin: "0 0 14px 0",
  fontSize: 18,
  fontWeight: 900,
  color: "#111827",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 14,
};

const infoCardStyle = {
  border: "1px solid #E5E7EB",
  borderRadius: 14,
  padding: 14,
  background: "#FAFAFA",
};

const infoLabelStyle = {
  fontSize: 12,
  fontWeight: 800,
  color: "#64748B",
  marginBottom: 8,
};

const infoValueStyle = {
  fontSize: 15,
  fontWeight: 700,
  color: "#111827",
  wordBreak: "break-word",
};

const blockStyle = {
  border: "1px solid #E5E7EB",
  borderRadius: 14,
  padding: 16,
  background: "#FFFFFF",
  marginBottom: 12,
};

const blockLabelStyle = {
  fontSize: 13,
  fontWeight: 900,
  color: "#475569",
  marginBottom: 10,
};

const blockValueStyle = {
  fontSize: 15,
  fontWeight: 600,
  color: "#111827",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const actionRowStyle = {
  marginTop: 28,
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
};

const approveBtnStyle = {
  height: 42,
  padding: "0 18px",
  borderRadius: 10,
  border: "1px solid #A7F3D0",
  background: "#ECFDF5",
  color: "#047857",
  fontWeight: 800,
  cursor: "pointer",
};

const rejectBtnStyle = {
  height: 42,
  padding: "0 18px",
  borderRadius: 10,
  border: "1px solid #FECACA",
  background: "#FEF2F2",
  color: "#B91C1C",
  fontWeight: 800,
  cursor: "pointer",
};

const disabledBtnStyle = {
  opacity: 0.5,
  cursor: "not-allowed",
};