import React from 'react';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const maxVisiblePages = 5;
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  );

  return (
    <div style={wrapStyle}>
      <button
        type="button"
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage <= 1}
        style={navBtn(currentPage <= 1)}
      >
        이전
      </button>
      {pages.map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => onChange(num)}
          style={pageBtn(currentPage === num)}
        >
          {num}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        style={navBtn(currentPage >= totalPages)}
      >
        다음
      </button>
    </div>
  );
}

const wrapStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 8,
  marginTop: 18,
  flexWrap: 'wrap',
};

const baseBtn = {
  minWidth: 36,
  height: 36,
  padding: '0 12px',
  borderRadius: 10,
  border: '1px solid #E5E7EB',
  background: '#fff',
  color: '#111827',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};

const pageBtn = (active) => ({
  ...baseBtn,
  background: active ? '#111827' : '#fff',
  color: active ? '#FFD84D' : '#111827',
  borderColor: active ? '#111827' : '#E5E7EB',
});

const navBtn = (disabled) => ({
  ...baseBtn,
  color: disabled ? '#9CA3AF' : '#111827',
  cursor: disabled ? 'not-allowed' : 'pointer',
  background: disabled ? '#F9FAFB' : '#fff',
});
