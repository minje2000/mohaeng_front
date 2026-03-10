import React from 'react';
import MyPageReviewItem from './MyPageReviewItem';

export default function MyPageReviewList({ items = [], onClickItem }) {
  if (!items.length) return <div className="mh-emptyCard">작성한 리뷰가 없어요.</div>;

  return (
    <div>
      <div className="mh-tableHeadBar">
        <div className="mh-colEvent">행사</div>
        <div className="mh-colContent">리뷰 내용</div>
        <div className="mh-colDate">작성일</div>
        <div className="mh-colRating">평균 별점</div>
      </div>

      <div className="mh-tableCards">
        {items.map((it, idx) => (
          <MyPageReviewItem key={it.reviewId ?? idx} item={it} onClick={() => onClickItem(it)} />
        ))}
      </div>
    </div>
  );
}
