🚨 SLA-Guard AI — Predictive SLA Monitoring (v1)

SLA-Guard AI is a predictive monitoring system that forecasts SLA breach risk before it happens, explains why the risk is increasing, and tracks the full incident lifecycle — from early warning to recovery.

Unlike traditional monitoring tools that react after an SLA is violated, SLA-Guard AI focuses on future risk and operator decision-making.

🎯 Problem Statement

Most monitoring tools today suffer from three major limitations:

     # SLAs are detected after they are breached

     # Dashboards show raw metrics, not actionable risk

     # Engineers don’t know which signal matters right now

As a result:

   # Teams react late

   # Alert fatigue increases

   # Root cause analysis is slow

💡 Solution Overview

SLA-Guard AI answers one core question:

“Will this service violate its SLA in the next X hours — and why?”

It does this by:

    ->  Ingesting real-time service metrics

    -> Engineering SLA-focused signals

    ->  Predicting future breach probability

    ->  Explaining the top contributing factors

    ->  Tracking incident lifecycle events

✨ Key Features (v1)
🔮 Predictive SLA Risk

    #  Forecasts probability of SLA violation (e.g., next 6 hours)

    #  Uses behavior-based signals, not static thresholds

            🟢 HEALTHY / 🟡 WARNING / 🔴 CRITICAL States

    #  Trend-aware classification

    #  Early WARNING before CRITICAL

    #  Prevents alert fatigue

🧠 Explainability Engine

Shows why a service is at risk

Example:

High SLA burn rate

Latency deviation

Error rate acceleration

📈 Risk Trend Visualization

Risk over time (not just point-in-time metrics)

Helps operators understand degradation patterns

🧯 Incident Lifecycle Tracking

Automatically records:

    WARNING started

    CRITICAL triggered

    Recovered

Displays a clean incident timeline

🔄 Auto-Refreshing Dashboard

    #  Live updates every 30 seconds

    #  No manual refresh required

    #  🎛 Demo vs Production Mode

    #  Production: conservative thresholds

    #  Demo: higher sensitivity for live demos

    #  Same data, different interpretation

🧩 Multi-Service Support

Monitor multiple services from a single dashboard

🏗️ System Architecture
User / SRE
   │
   ▼
React Dashboard
   │
   ▼
FastAPI Backend
   ├── Metrics Ingestion
   ├── Feature Engineering
   ├── SLA Risk Prediction
   ├── Explanation Engine
   └── Incident Tracking
   │
   ▼
Supabase (PostgreSQL)
   ├── services
   ├── metrics
   ├── predictions
   └── incident_events

📊 Metrics Ingested

SLA-Guard AI ingests realistic service telemetry:

      ->  Uptime percentage

      ->  Average latency

      ->  p95 latency

      ->  Error rate

      ->  Request volume

      ->  Deployment events

Metrics are pushed by the user’s system (industry-standard approach).

🧪 Sample API Usage
Ingest Metrics
POST /ingest-metrics

{
  "service_name": "payment-service",
  "uptime_percent": 99.7,
  "avg_latency_ms": 420,
  "p95_latency_ms": 720,
  "error_rate": 0.025,
  "request_volume": 2100,
  "deployment_event": false
}

Predict SLA Risk
POST /predict-sla-risk

{
  "service_name": "payment-service",
  "time_horizon_hours": 6
}

🧠 Design Decisions 
Why predictive instead of reactive?
    -> Operators need lead time, not postmortems

Why explainability?
    -> A risk score without reasoning is not actionable

Why no authentication in v1?
    -> v1 focuses on core intelligence
    -> Authentication and multi-tenancy are planned for v2


🚧 Planned Features 

      # Firebase Authentication (dashboard access)

      # User-scoped services & multi-tenancy

      # API key–based metric ingestion

      # Alert notifications (push/email)

      # SLA confidence scoring

      # Post-incident summaries

🛠️ Tech Stack

Frontend: React

Backend: FastAPI

Database: Supabase (PostgreSQL)

ML: Scikit-learn (explainable models)

Visualization: Custom React components


🧑‍💻 Author

Tharun N V
Computer & Communication Engineering
