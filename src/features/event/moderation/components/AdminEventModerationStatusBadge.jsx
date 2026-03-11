import React from "react";

function badgeStyle(status) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 76,
    height: 32,
    padding: "0 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    border: "1px solid #E5E7EB",
    background: "#F8FAFC",
    color: "#0F172A",
  };

  if (status === "승인대기") {
    return {
      ...base,
      background: "#FFF7ED",
      border: "1px solid #FED7AA",
      color: "#C2410C",
    };
  }

  if (status === "반려") {
    return {
      ...base,
      background: "#FEF2F2",
      border: "1px solid #FECACA",
      color: "#B91C1C",
    };
  }

  if (status === "승인") {
    return {
      ...base,
      background: "#ECFDF5",
      border: "1px solid #A7F3D0",
      color: "#047857",
    };
  }

  return base;
}

export default function AdminEventModerationStatusBadge({ status }) {
  return <span style={badgeStyle(status)}>{status || "-"}</span>;
}