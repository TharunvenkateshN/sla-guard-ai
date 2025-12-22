import React from "react";
export default function FactorsList({ factors }) {
  return (
    <div className="bg-white shadow rounded p-6">
      <h3 className="font-semibold mb-2">Why at risk?</h3>
      <ul className="list-disc list-inside text-gray-700">
        {factors.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
    </div>
  );
}
