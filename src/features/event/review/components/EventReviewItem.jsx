import React from "react";
import StarsDecimal from "./StarsDecimal";

function formatDate(dt) {
  return dt ? String(dt).slice(0, 10) : "";
}

function summarize(text, maxLen = 30) {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length <= maxLen ? t : t.slice(0, maxLen) + "...";
}

export default function EventReviewItem({ item }) {
  const avg =
    (Number(item.ratingContent) + Number(item.ratingProgress) + Number(item.ratingMood)) / 3;

  const summary = summarize(item.content, 30);

  return (
    <div className="mh-otherRow">
      <div className="mh-otherLeft">
        <div className="mh-userName">{item.userName ?? "작성자"}</div>

        <div className="mh-avgLine">
          {/*  평균 별점: 반별 표시 */}
          <StarsDecimal value={avg} />
          <span className="mh-avgNum">{Number.isFinite(avg) ? avg.toFixed(1) : "0.0"}</span>
        </div>
      </div>

      <div className="mh-otherBody">
        {summary || <span className="mh-muted">(내용 없음)</span>}
      </div>

      <div className="mh-otherDate">{formatDate(item.createdAt)}</div>
    </div>
  );
}