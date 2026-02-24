import React from "react";

export default function StarsDecimal({ value = 0, max = 5 }) {
  const v = Math.max(0, Math.min(max, Number(value) || 0));
  const percent = (v / max) * 100;

  return (
    <span className="mh-starWrap" aria-label={`rating ${v}/${max}`}>
      <span className="mh-starBase">★★★★★</span>
      <span className="mh-starFill" style={{ width: `${percent}%` }}>
        ★★★★★
      </span>
    </span>
  );
}