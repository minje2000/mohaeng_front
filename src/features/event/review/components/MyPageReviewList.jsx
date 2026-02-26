// src/features/event/review/components/MyPageReviewList.jsx
import React from 'react';
import MyPageReviewItem from './MyPageReviewItem';

export default function MyPageReviewList({ items = [], onClickItem }) {
  if (!items.length) return <div className="mh-muted">작성한 리뷰가 없어요.</div>;

  return (
    <div className="mh-table">
      <div className="mh-table-head">
        <div className="mh-cell">번호</div>
        <div className="mh-cell">행사 제목</div>
        <div className="mh-cell">평균 별점</div>
        <div className="mh-cell">등록일</div>
      </div>

      {items.map((it, idx) => (
        <MyPageReviewItem
          key={it.reviewId ?? idx}
          index={idx}
          item={it}
          onClick={() => onClickItem(it)} //  그대로
        />
      ))}
    </div>
  );
}