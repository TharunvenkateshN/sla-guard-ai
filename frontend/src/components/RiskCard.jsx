import React from "react";

export default function RiskCard({ risk }) {
  let color = "text-green-600";
  if (risk >= 0.7) color = "text-red-600";
  else if (risk >= 0.4) color = "text-yellow-500";

  return (
    <div className="bg-white shadow rounded p-6 text-center">
      <h2 className="text-lg font-semibold mb-2">SLA Risk</h2>
      <p className={`text-5xl font-bold ${color}`}>
        {Math.round(risk * 100)}%
      </p>
    </div>
  );
}
