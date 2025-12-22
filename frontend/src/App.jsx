import React from "react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

import RiskGauge from "./components/RiskGauge";
import RiskHistoryChart from "./components/RiskHistoryChart";

import {
  smoothRisk,
  getRiskStateWithTrend
} from "./utils/riskUtils";

const REFRESH_INTERVAL_MS = 30000;

function App() {
  const [services, setServices] = useState([]);
  const [service, setService] = useState(null);

  const [mode, setMode] = useState("production"); // demo | production

  const [risk, setRisk] = useState(null);
  const [factors, setFactors] = useState([]);
  const [timeHorizon, setTimeHorizon] = useState("");
  const [riskHistory, setRiskHistory] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [recovered, setRecovered] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const previousRiskRef = useRef(null);
  const previousRiskForRenderRef = useRef(null);
  const previousRiskStateRef = useRef(null);

  // ----------------------------------
  // Load services
  // ----------------------------------
  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    const res = await axios.get("http://127.0.0.1:8000/services");
    setServices(res.data);
    if (res.data.length > 0) setService(res.data[0]);
  }

  // ----------------------------------
  // Auto refresh on service / mode
  // ----------------------------------
  useEffect(() => {
    if (!service) return;

    resetState();
    fetchRisk();

    const id = setInterval(fetchRisk, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [service, mode]);

  function resetState() {
    setRisk(null);
    setFactors([]);
    setRiskHistory([]);
    setRecovered(false);
    setAcknowledged(false);
    setLastUpdated(null);

    previousRiskRef.current = null;
    previousRiskForRenderRef.current = null;
    previousRiskStateRef.current = null;
  }

  // ----------------------------------
  // Core fetch
  // ----------------------------------
  async function fetchRisk() {
    const res = await axios.post(
      "http://127.0.0.1:8000/predict-sla-risk",
      {
        service_name: service,
        time_horizon_hours: 6
      }
    );

    const rawRisk = res.data.sla_risk_probability;
    const previousRisk = previousRiskRef.current;
    previousRiskForRenderRef.current = previousRisk;

    const smoothedRisk = smoothRisk(previousRisk, rawRisk);

    const currentRiskState = getRiskStateWithTrend(
      smoothedRisk,
      previousRisk,
      mode
    ).label;

    const previousRiskState = previousRiskStateRef.current;

    if (
      (previousRiskState === "CRITICAL" ||
        previousRiskState === "WARNING") &&
      currentRiskState === "HEALTHY"
    ) {
      setRecovered(true);
    } else {
      setRecovered(false);
    }

    if (currentRiskState !== "CRITICAL") {
      setAcknowledged(false);
    }

    previousRiskRef.current = smoothedRisk;
    previousRiskStateRef.current = currentRiskState;

    setRisk(smoothedRisk);
    setFactors(res.data.top_factors || []);
    setTimeHorizon(res.data.time_horizon);
    setLastUpdated(new Date());

    const historyRes = await axios.get(
      `http://127.0.0.1:8000/risk-history/${service}`
    );
    setRiskHistory(historyRes.data);
  }

  const riskState =
    risk !== null
      ? getRiskStateWithTrend(
          risk,
          previousRiskForRenderRef.current,
          mode
        )
      : null;

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="header">
        <h1>SLA-Guard AI</h1>

        {/* Mode Toggle */}
        <div style={{ display: "flex", gap: "10px" }}>
          <select
            className="select"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="production">Production</option>
            <option value="demo">Demo</option>
          </select>

          <select
            className="select"
            value={service || ""}
            onChange={(e) => setService(e.target.value)}
          >
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards */}
      <div className="card-grid">
        <div className="card">
          <div className="card-title">SLA Risk</div>

          {risk !== null && riskState && (
            <RiskGauge
              value={risk}
              label={riskState.label}
              color={riskState.color}
            />
          )}

          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            Mode: <b>{mode.toUpperCase()}</b>
          </p>

          {lastUpdated && (
            <p style={{ fontSize: "12px", color: "#9ca3af" }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="card">
          <div className="card-title">Risk Trend</div>
          {riskHistory.length > 0 ? (
            <RiskHistoryChart data={riskHistory} />
          ) : (
            <p>No history</p>
          )}
        </div>

        <div className="card">
          <div className="card-title">Why at risk?</div>
          {riskState?.label === "HEALTHY" ? (
            <p>No significant risk factors.</p>
          ) : (
            factors.map((f, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                {f}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
