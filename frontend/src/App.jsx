import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

import RiskGauge from "./components/RiskGauge";
import RiskHistoryChart from "./components/RiskHistoryChart";
import IncidentTimeline from "./components/IncidentTimeline";

import {
  smoothRisk,
  getRiskStateWithTrend
} from "./utils/riskUtils";

// Auto-refresh interval (30s)
const REFRESH_INTERVAL_MS = 30000;

function App() {
  // -----------------------------
  // Core selection
  // -----------------------------
  const [services, setServices] = useState([]);
  const [service, setService] = useState(null);
  const [mode, setMode] = useState("production"); // demo | production

  // -----------------------------
  // Risk & UI state
  // -----------------------------
  const [risk, setRisk] = useState(null);
  const [factors, setFactors] = useState([]);
  const [timeHorizon, setTimeHorizon] = useState("");
  const [riskHistory, setRiskHistory] = useState([]);
  const [timeline, setTimeline] = useState([]); // MUST be array
  const [lastUpdated, setLastUpdated] = useState(null);

  // Incident UX
  const [recovered, setRecovered] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  // -----------------------------
  // Refs
  // -----------------------------
  const previousRiskRef = useRef(null);
  const previousRiskForRenderRef = useRef(null);
  const previousRiskStateRef = useRef(null);

  // -----------------------------
  // Load services once
  // -----------------------------
  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const res = await axios.get("http://127.0.0.1:8000/services");
      setServices(Array.isArray(res.data) ? res.data : []);
      if (res.data?.length > 0) setService(res.data[0]);
    } catch (err) {
      console.error("Failed to load services", err);
    }
  }

  // -----------------------------
  // Auto-refresh on service/mode
  // -----------------------------
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
    setTimeline([]);
    setRecovered(false);
    setAcknowledged(false);
    setLastUpdated(null);

    previousRiskRef.current = null;
    previousRiskForRenderRef.current = null;
    previousRiskStateRef.current = null;
  }

  // -----------------------------
  // Record incident event
  // -----------------------------
  async function recordIncidentEvent(eventType) {
    try {
      await axios.post("http://127.0.0.1:8000/incident-event", {
        service_name: service,
        event_type: eventType
      });
    } catch (err) {
      console.error("Failed to record incident event", err);
    }
  }

  // -----------------------------
  // Core SLA fetch
  // -----------------------------
  async function fetchRisk() {
    try {
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

      // -----------------------------
      // Incident lifecycle
      // -----------------------------
      if (previousRiskState !== currentRiskState) {
        if (currentRiskState === "WARNING") {
          recordIncidentEvent("WARNING_STARTED");
        }

        if (currentRiskState === "CRITICAL") {
          recordIncidentEvent("CRITICAL_STARTED");
        }

        if (
          (previousRiskState === "WARNING" ||
            previousRiskState === "CRITICAL") &&
          currentRiskState === "HEALTHY"
        ) {
          recordIncidentEvent("RECOVERED");
        }
      }

      setRecovered(
        (previousRiskState === "WARNING" ||
          previousRiskState === "CRITICAL") &&
          currentRiskState === "HEALTHY"
      );

      if (currentRiskState !== "CRITICAL") {
        setAcknowledged(false);
      }

      previousRiskRef.current = smoothedRisk;
      previousRiskStateRef.current = currentRiskState;

      setRisk(smoothedRisk);
      setFactors(res.data.top_factors || []);
      setTimeHorizon(res.data.time_horizon);
      setLastUpdated(new Date());

      // -----------------------------
      // History + timeline (SAFE)
      // -----------------------------
      const historyRes = await axios.get(
        `http://127.0.0.1:8000/risk-history/${service}`
      );
      setRiskHistory(Array.isArray(historyRes.data) ? historyRes.data : []);

      const timelineRes = await axios.get(
        `http://127.0.0.1:8000/incident-timeline/${service}`
      );
      setTimeline(
        Array.isArray(timelineRes.data)
          ? timelineRes.data
          : timelineRes.data?.incidents || []
      );

    } catch (err) {
      console.error("Error fetching SLA risk", err);
    }
  }

  // -----------------------------
  // Render-time risk state
  // -----------------------------
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

          {lastUpdated && (
            <p style={{ fontSize: "12px", color: "#9ca3af" }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}

          {recovered && (
            <p style={{ color: "#16a34a", marginTop: "8px" }}>
              Recovered from incident
            </p>
          )}

          {riskState?.label === "CRITICAL" && !acknowledged && (
            <button
              onClick={() => setAcknowledged(true)}
              style={{
                marginTop: "10px",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "none",
                background: "#dc2626",
                color: "white",
                fontWeight: "600"
              }}
            >
              Acknowledge Alert
            </button>
          )}
        </div>

        <div className="card">
          <div className="card-title">Risk Trend</div>
          {riskHistory.length > 0 ? (
            <RiskHistoryChart data={riskHistory} />
          ) : (
            <p>No history available</p>
          )}
        </div>

        <div className="card">
          <div className="card-title">Why at risk?</div>
          {riskState?.label === "HEALTHY"
            ? "No significant risk factors."
            : factors.map((f, i) => <div key={i}>{f}</div>)}
        </div>

        <div className="card">
          <div className="card-title">Incident Timeline</div>
          {/* ✅ CORRECT PROP NAME */}
          <IncidentTimeline incidents={timeline} />
        </div>
      </div>
    </div>
  );
}

export default App;
