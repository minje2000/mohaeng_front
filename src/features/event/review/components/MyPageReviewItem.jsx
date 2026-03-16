import React from 'react';
import eventThumbUrl from '../../../../shared/utils/eventThumbUrl';
import StarsDecimal from './StarsDecimal';


function formatDate(dt) {
  return dt ? String(dt).slice(0, 10).replaceAll('-', '.') : '-';
}

function toImgUrl(v) {
  if (!v || typeof v !== 'string') return null;
  return eventThumbUrl(v);
}

function pickContent(item) {
  const content = item?.content ?? item?.reviewContent ?? item?.reviewText ?? item?.summary ?? '';
  const trimmed = String(content || '').trim();
  return trimmed || '리뷰 내용이 없습니다.';
}

function pickThumb(item) {
  return toImgUrl(item?.eventThumbnail ?? item?.thumbnail ?? item?.thumbUrl ?? item?.event?.thumbnail ?? null);
}

function pickSimpleExplain(item) {
  return item?.simpleExplain ?? item?.eventSimpleExplain ?? item?.event?.simpleExplain ?? '';
}

export default function MyPageReviewItem({ item, onClick }) {
  const avg = Number(item.avgRating) || 0;
  const content = pickContent(item);
  const thumb = pickThumb(item);
  const simpleExplain = pickSimpleExplain(item);

  return (
    <div className="mh-cardRow">
      <div className="mh-colEvent">
        <div className="mh-eventCell">
          <button
            type="button"
            className="mh-thumbWrap"
            onClick={onClick}
            style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
            aria-label={item.eventTitle ?? '행사 상세 보기'}
          >
            {thumb ? (
              <img className="mh-eventThumb" src={thumb} alt={item.eventTitle ?? ''} onError={(e) => { e.currentTarget.src = '/images/moheng.png'; }} />
            ) : (
              <img className="mh-eventThumb" src="/images/moheng.png" alt={item.eventTitle ?? ''} />
            )}
          </button>
          <button
            type="button"
            className="mh-eventMeta"
            onClick={onClick}
            style={{ border: 'none', background: 'transparent', padding: 0, textAlign: 'left', cursor: 'pointer' }}
          >
            <div className="mh-eventTitle">{item.eventTitle ?? '(제목 없음)'}</div>
            <div className="mh-eventSummary" title={simpleExplain || '행사 한 줄 설명이 없습니다.'}>{simpleExplain || '행사 한 줄 설명이 없습니다.'}</div>
          </button>
        </div>
      </div>

      <div className="mh-colContent">
        <button type="button" className={`mh-reviewLink ${content === '리뷰 내용이 없습니다.' ? 'empty' : ''}`} onClick={onClick}>
          {content}
        </button>
      </div>

      <div className="mh-colDate mh-date">{formatDate(item.createdAt)}</div>

      <div className="mh-colRating">
        <span className="mh-avgLine">
          <StarsDecimal value={avg} />
          <span className="mh-avgNum">{avg.toFixed(1)}</span>
        </span>
      </div>
    </div>
  );
}
