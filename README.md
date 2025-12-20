🛡️ SLA-Guard AI

Predictive SLA Risk Monitoring with Explainable ML

🚨 Problem Statement

Service Level Agreements (SLAs) define availability guarantees such as 99.9% uptime.
However, most monitoring systems today are reactive:

SLA breaches are detected after damage is done

Engineers see metrics, not future risk

Alerts are threshold-based, noisy, and lack context

This leads to:

Late incident response

Alert fatigue

Loss of trust in monitoring systems

💡 Solution — SLA-Guard AI

SLA-Guard AI predicts SLA breaches before they happen.

Instead of reacting to failures, it answers:

“Will this service violate its SLA in the next X hours — and why?”

It combines:

SRE-grade feature engineering

Explainable machine learning

Clear, actionable alerts

🎯 Core Capabilities (v1)
✅ Predictive SLA Risk

Outputs a probability of SLA breach

Time-horizon aware (e.g., next 6 hours)

✅ Explainability (Trust-First)

Always explains why a service is at risk

Example:

High SLA burn rate

Latency deviating from baseline

✅ ML-Backed Decisions

Logistic Regression for:

Probability output

Interpretability

Stability

✅ Proactive Alerts

Alerts triggered only when risk crosses threshold

Stored for auditability

🧠 How It Works (High Level)
Metrics → Feature Engineering → ML Prediction → Explanation → Alert

1️⃣ Telemetry Ingestion

Every few minutes:

Uptime %

Latency (avg, p95)

Error rate

Request volume

Deployment events

2️⃣ Feature Engineering

Derived signals:

SLA burn rate

Error trend slope

Error acceleration

Latency deviation from baseline

3️⃣ Risk Prediction

Logistic Regression outputs breach probability

Rule-based logic provides explanation

4️⃣ Alerting

Alerts triggered when risk > threshold

Stored for visibility and audit

🧪 Example API Response
{
  "service": "payment-service",
  "sla_risk_probability": 0.82,
  "time_horizon": "6 hours",
  "alert_required": true,
  "top_factors": [
    "High SLA burn rate",
    "Latency deviating from baseline"
  ]
}

🏗️ Architecture
Backend

FastAPI — API layer

Supabase (PostgreSQL) — persistence

scikit-learn — ML model

joblib — model loading

Architecture Pattern

Offline ML training

Online inference (clean separation)

Rule-based explanation + ML probability

📂 Project Structure
sla-guard-ai/
├── app/
│   ├── main.py
│   ├── features/
│   ├── ml/
│   ├── schemas/
│   └── db/
├── ml/
│   ├── train_model.py
│   └── sla_risk_model.joblib
├── README.md
└── requirements.txt

🔐 Trust & Reliability Philosophy

SLA-Guard AI is a trust-critical system.

Design principles:

No silent failures

Explain every decision

Prefer conservative alerts over noisy ones

🔭 Roadmap (v2 – Planned)
🛡️ Self-Observability (Meta-Monitoring)

“Who watches the watcher?”

Planned enhancements:

SLA-Guard AI monitors its own health

Detects degradation in prediction pipeline

Enters safe-mode if reliability is compromised

Transparent messaging to users during degraded states

This ensures:

User trust is preserved

No false confidence is ever given

🚀 Why SLA-Guard AI Is Different

Existing Tools	                SLA-Guard AI

Reactive alerts                	Predictive risk
Metric-level focus	            SLA-level decisions
Threshold-based	                Learned patterns
Black-box alerts	              Explainable causes
Vendor-locked	                  Vendor-neutral

🧪 MVP Status

v1 Complete

( 1.) Predicts SLA breaches

( 2.) Explains why

( 3.) Alerts proactively

( 4.) ML-backed, explainable, and stable

👤 Intended Users

-> SREs

-> Platform Engineers

-> Reliability teams

-> DevOps teams