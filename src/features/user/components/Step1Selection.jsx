// src/features/user/components/Step1Selection.jsx
import React from 'react';

const Step1Selection = ({ onSelect }) => {
  return (
    <div className="selection-container">
      <button className="selection-card" onClick={() => onSelect('individual')}>
        <div className="icon individual-icon">
          {/* 심플한 SVG 유저 아이콘 */}
          <svg viewBox="0 0 24 24" fill="#F8B150" width="80" height="80">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </div>
        <h3>개인 회원</h3>
      </button>
      
      <button className="selection-card" onClick={() => onSelect('corporate')}>
        <div className="icon corporate-icon">
          {/* 심플한 SVG 빌딩 아이콘 */}
          <svg viewBox="0 0 24 24" fill="none" stroke="#F8B150" strokeWidth="2" width="80" height="80">
            <path d="M4 22V8l8-6 8 6v14M10 22v-6h4v6" />
            <path d="M8 10h1v2H8zm0 4h1v2H8zm6-4h1v2h-1zm0 4h1v2h-1z" />
          </svg>
        </div>
        <h3>업체 회원</h3>
      </button>
    </div>
  );
};

export default Step1Selection;