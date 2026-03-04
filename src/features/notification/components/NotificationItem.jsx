import React from "react";

const TYPE_LABEL = {
  EVENT_DAY_BEFORE: "행사 모집 하루 전 알림",
  EVENT_DAY_OF: "행사 모집 당일 알림",

  INQUIRY_RECEIVER: "문의 접수 알림",
  INQUIRY_SENDER: "문의 답변 알림",

  REPORT_RECEIVER: "신고 접수 알림",
  REPORT_ACCEPT: "신고 승인 알림",
  REPORT_REJECT: "신고 반려 알림",

  BOOTH_RECEIVER: "부스 신청 알림",
  BOOTH_ACCEPT: "부스 승인 알림",
  BOOTH_REJECT: "부스 반려 알림",

  REPORT_REFUND:"결제 금액 환불 알림",
  REPORT_PCTCANCEL:"행사 참여 취소 알림"
};

export default function NotificationItem({ item, onClick }) {
  const id = item.notificationId ?? item.id;

  //  원본 타입(코드명)
  const rawType = item.notiTypeName ?? item.typeName ?? "알림";
  //  코드명이면 한글로 변환
  const typeName = TYPE_LABEL[rawType] ?? rawType;

  const contents = item.contents ?? item.message ?? "";
  const createdAt = item.createdAt ?? "";

  return (
    <button
      type="button"
      onClick={() => id && onClick?.(id)}
      style={{
        width: "100%",
        textAlign: "left",
        border: 0,
        background: "transparent",
        cursor: "pointer",
        padding: "9px 8px",
        borderRadius: 12,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f6f6f6")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ fontWeight: 900, fontSize: 13 }}>• {typeName}</div>

      <div
        style={{
          fontSize: 12,
          opacity: 0.86,
          marginTop: 4,

          //  줄바꿈 + 긴 단어(링크/영문)도 끊기
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {contents}
      </div>

      {createdAt ? (
        <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
          {String(createdAt)}
        </div>
      ) : null}
    </button>
  );
}