import React, { useEffect, useState } from "react";

function normalizeRisk(risk) {
  // backend may send 0–1 or 0–100
  return risk <= 1 ? Math.round(risk * 100) : Math.round(risk);
}

function getRiskState(riskPercent) {
  if (riskPercent >= 70) {
    return { label: "CRITICAL", color: "#dc2626" }; // red
  }
  if (riskPercent >= 30) {
    return { label: "WARNING", color: "#f59e0b" }; // orange
  }
  return { label: "HEALTHY", color: "#16a34a" }; // green
}

export default function RiskCard({ risk }) {
  console.log("Risk prop received:", risk);

  const riskPercent = normalizeRisk(risk);
  const state = getRiskState(riskPercent);

  const [displayRisk, setDisplayRisk] = useState(riskPercent);

  // Animate number
  useEffect(() => {
    let current = displayRisk;
    const target = riskPercent;
    const step = current < target ? 1 : -1;

    if (current === target) return;

    const interval = setInterval(() => {
      current += step;
      setDisplayRisk(current);
      if (current === target) clearInterval(interval);
    }, 15);

    return () => clearInterval(interval);
  }, [riskPercent]);

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "24px",
        borderRadius: "12px",
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}
    >
      <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>
        SLA Risk
      </h2>

      <div
        style={{
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          border: `10px solid ${state.color}`,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color 0.5s ease"
        }}
      >
        <span
          style={{
            fontSize: "36px",
            fontWeight: "700",
            color: state.color,
            transition: "color 0.5s ease"
          }}
        >
          {displayRisk}%
        </span>
      </div>

      <p
        style={{
          marginTop: "12px",
          fontSize: "18px",
          fontWeight: "700",
          color: state.color,
          transition: "color 0.5s ease"
        }}
      >
        {state.label}
      </p>

      <p style={{ marginTop: "6px", fontSize: "12px", color: "#666" }}>
        Alert triggers at <b style={{ color: "#dc2626" }}>70%</b>
      </p>
    </div>
  );
}
