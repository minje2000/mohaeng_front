import React from "react";

export default function StarsInput({ value = 1, max = 5, onChange }) {
  const v = Math.max(1, Math.min(max, Number(value) || 1));

  return (
    <span className="mh-stars" aria-label={`rating input ${v}/${max}`}>
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const filled = starValue <= v;
        return (
          <span
            key={i}
            className="mh-star clickable"
            onClick={() => onChange?.(starValue)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onChange?.(starValue);
            }}
          >
            {filled ? "★" : "☆"}
          </span>
        );
      })}
    </span>
  );
}