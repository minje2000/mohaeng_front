import React from 'react';

export default function Stars({ value = 0, max = 5 }) {
  const v = Math.max(0, Math.min(max, Number(value) || 0));
  return (
    <span className="mh-stars" aria-label={`rating ${v}/${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className="mh-star">
          {i < v ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}