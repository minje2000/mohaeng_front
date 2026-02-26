import React from "react";
import StarsDecimal from "./StarsDecimal";

function formatDate(dt) {
  return dt ? String(dt).slice(0, 10) : "";
}

export default function MyPageReviewItem({ index, item, onClick }) {
  const avg = Number(item.avgRating) || 0;

  return (
    <div className="mh-table-row" onClick={onClick}>
      <div className="mh-cell">{index + 1}</div>
      <div className="mh-cell mh-eventTitle">{item.eventTitle ?? "(제목 없음)"}</div>
      <div className="mh-cell">
        {/*  평균 별점 반별 표시 */}
        <span className="mh-avgLine">
          <StarsDecimal value={avg} />
          <span className="mh-avgNum">{avg.toFixed(1)}</span>
        </span>
      </div>
      <div className="mh-cell mh-date">{formatDate(item.createdAt)}</div>
    </div>
  );
}
