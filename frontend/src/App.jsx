import React from "react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

import {
  getRiskState,
  smoothRisk,
  getTrend
} from "./utils/riskUtils";

function App() {
  const [service, setService] = useState("payment-service");
  const [risk, setRisk] = useState(null);
  const [factors, setFactors] = useState([]);
  const [timeHorizon, setTimeHorizon] = useState("");

  // Store previous risk for smoothing
  const previousRiskRef = useRef(null);

  useEffect(() => {
    fetchRisk();
  }, [service]);

  async function fetchRisk() {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/predict-sla-risk",
        {
          service_name: service,
          time_horizon_hours: 6
        }
      );

      const rawRisk = response.data.sla_risk_probability;

      // Smooth the risk
      const smoothedRisk = smoothRisk(
        previousRiskRef.current,
        rawRisk
      );

      previousRiskRef.current = smoothedRisk;

      setRisk(smoothedRisk);
      setFactors(response.data.top_factors || []);
      setTimeHorizon(response.data.time_horizon);

    } catch (error) {
      console.error("Error fetching SLA risk:", error);
    }
  }

  // Risk state for UI
  const riskState = risk !== null ? getRiskState(risk) : null;
  const trend = getTrend(risk, previousRiskRef.current);

  return (
    <div style={{ padding: "30px", fontFamily: "serif" }}>
      <h1>SLA-Guard AI Dashboard</h1>

      {/* Service Selector */}
      <select
        value={service}
        onChange={(e) => setService(e.target.value)}
      >
        <option value="payment-service">payment-service</option>
      </select>

      <h2 style={{ marginTop: "40px" }}>SLA Risk</h2>

      {risk !== null && (
        <div
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: riskState.color,
            marginTop: "10px"
          }}
        >
          {(risk * 100).toFixed(1)}% — {riskState.label} {trend}
        </div>
      )}

      <h3 style={{ marginTop: "40px" }}>Why at risk?</h3>
      <ul>
        {factors.map((factor, index) => (
          <li key={index}>{factor}</li>
        ))}
      </ul>

      <p style={{ marginTop: "20px" }}>
        <strong>Time horizon:</strong> {timeHorizon}
      </p>
    </div>
  );
}

export default App;
