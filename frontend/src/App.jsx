import React from "react";
import { useEffect, useRef, useState } from "react";
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
  const [timeline, setTimeline] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Incident UX
  const [recovered, setRecovered] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  // -----------------------------
  // Refs (ordering matters)
  // -----------------------------
  const previousRiskRef = useRef(null);            // latest risk
  const previousRiskForRenderRef = useRef(null);   // true previous risk
  const previousRiskStateRef = useRef(null);       // HEALTHY/WARNING/CRITICAL

  // -----------------------------
  // Load services once
  // -----------------------------
  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const res = await axios.get("http://127.0.0.1:8000/services");
      setServices(res.data);
      if (res.data.length > 0) setService(res.data[0]);
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
      // Predict SLA risk
      const res = await axios.post(
        "http://127.0.0.1:8000/predict-sla-risk",
        {
          service_name: service,
          time_horizon_hours: 6
        }
      );

      const rawRisk = res.data.sla_risk_probability;

      // Capture previous risk
      const previousRisk = previousRiskRef.current;
      previousRiskForRenderRef.current = previousRisk;

      // Smooth risk
      const smoothedRisk = smoothRisk(previousRisk, rawRisk);

      // Determine state (mode-aware)
      const currentRiskState = getRiskStateWithTrend(
        smoothedRisk,
        previousRisk,
        mode
      ).label;

      const previousRiskState = previousRiskStateRef.current;

      // -----------------------------
      // Incident lifecycle tracking
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

      // Recovery badge
      if (
        (previousRiskState === "WARNING" ||
          previousRiskState === "CRITICAL") &&
        currentRiskState === "HEALTHY"
      ) {
        setRecovered(true);
      } else {
        setRecovered(false);
      }

      if (currentRiskState !== "CRITICAL") {
        setAcknowledged(false);
      }

      // Persist refs
      previousRiskRef.current = smoothedRisk;
      previousRiskStateRef.current = currentRiskState;

      // Update UI state
      setRisk(smoothedRisk);
      setFactors(res.data.top_factors || []);
      setTimeHorizon(res.data.time_horizon);
      setLastUpdated(new Date());

      // Fetch history + timeline
      const historyRes = await axios.get(
        `http://127.0.0.1:8000/risk-history/${service}`
      );
      setRiskHistory(historyRes.data);

      const timelineRes = await axios.get(
        `http://127.0.0.1:8000/incident-timeline/${service}`
      );
      setTimeline(timelineRes.data);

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
          {/* Mode toggle */}
          <select
            className="select"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="production">Production</option>
            <option value="demo">Demo</option>
          </select>

          {/* Service dropdown */}
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
        {/* SLA Risk */}
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

        {/* Risk Trend */}
        <div className="card">
          <div className="card-title">Risk Trend</div>
          {riskHistory.length > 0 ? (
            <RiskHistoryChart data={riskHistory} />
          ) : (
            <p>No history available</p>
          )}
        </div>

        {/* Explanation */}
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

        {/* Incident Timeline */}
        <div className="card">
          <div className="card-title">Incident Timeline</div>
          <IncidentTimeline events={timeline} />
        </div>
      </div>
    </div>
  );
}

export default App;
