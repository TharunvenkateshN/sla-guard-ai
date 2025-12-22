import React from "react";
export default function RiskGauge({ value, label, color }) {
  const percentage = Math.round(value * 100);

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          border: `12px solid ${color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 12px auto",
          transition: "border-color 0.6s ease-in-out"
        }}
      >
        <span
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            transition: "all 0.6s ease-in-out"
          }}
        >
          {percentage}%
        </span>
      </div>

      <div style={{ fontWeight: "bold", color }}>
        {label}
      </div>
    </div>
  );
}
