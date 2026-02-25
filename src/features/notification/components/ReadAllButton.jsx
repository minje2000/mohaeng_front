import React from "react";

export default function ReadAllButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: 0,
        background: "transparent",
        color: "#b9b9b9",
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      모두 읽음 처리
    </button>
  );
}