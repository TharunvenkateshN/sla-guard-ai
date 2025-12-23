🚨 **SLA-Guard AI** — *Predictive SLA Monitoring (v1)*

SLA-Guard AI is a predictive monitoring system that forecasts SLA breach risk before it happens, explains why the risk is increasing, and tracks the full incident lifecycle — from early warning to recovery.

Unlike traditional monitoring tools that react after an SLA is violated, SLA-Guard AI focuses on future risk and operator decision-making.

🎯 Problem Statement

Most monitoring tools today suffer from three major limitations:

     # SLAs are detected after they are breached

     # Dashboards show raw metrics, not actionable risk

     # Engineers don’t know which signal matters right now

As a result:

   -> Teams react late

   -> Alert fatigue increases

   -> Root cause analysis is slow

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

 Raw Telemetry Metrics

     uptime_percentage
     error_rate
     error_count
     latency_avg
     latency_p95
     request_volume
     request_rate
     deployment_event
     deployment_timestamp

Engineered / Derived Metrics

     sla_burn_rate
     remaining_sla_budget
     uptime_trend_slope
     error_rate_trend
     latency_trend
     error_rate_acceleration
     latency_acceleration
     latency_deviation
     error_rate_deviation
     post_deployment_window
     post_deployment_error_spike
     post_deployment_latency_spike

Prediction Metrics
     
     sla_risk_probability
     prediction_time_horizon
     Explanation Metrics
     top_contributing_factors
     feature_weights
     risk_driver_category

Alerting Metrics

     alert_threshold
     alert_severity
     alert_trigger_time
     alert_acknowledged

Dashboard Metrics

     current_sla_health
     risk_trend
     sla_budget_remaining
     last_prediction_time
     top_risk_reason
     

Metrics are pushed by the user’s system.

📡 Sample API Usage

“SLA-Guard AI exposes simple REST APIs to ingest telemetry, predict future SLA breaches, explain root causes, and notify engineers before impact occurs.”

Base URL (local):

     http://localhost:8000


1️⃣ Ingest Metrics


Endpoint: /ingest-metrics

Method: POST

Purpose: Send service telemetry to SLA-Guard AI


🔹 Request

     {
       "service_name": "payment-service",
       "timestamp": "2025-12-23T16:30:00Z",
       "uptime_percentage": 99.91,
       "error_rate": 0.012,
       "error_count": 34,
       "latency_avg": 210,
       "latency_p95": 480,
       "request_volume": 5400,
       "request_rate": 9.2,
       "deployment_event": false
     }


🔹 cURL

curl -X POST http://localhost:8000/ingest-metrics \

-H "Content-Type: application/json" \

-d @metrics.json


🔹 Response

     {
       "status": "metrics_ingested", 
       "service_name": "payment-service"
     }


2️⃣ Predict SLA Breach Risk


Endpoint: /predict-sla-risk

Method: GET

Purpose: Predict probability of SLA violation


🔹 Request

     /predict-sla-risk?service_name=payment-service


🔹 cURL

     curl http://localhost:8000/predict-sla-risk?service_name=payment-service


🔹 Response

     {
       "service_name": "payment-service", 
       "sla_risk_probability": 0.82,
       "prediction_time_horizon": "6 hours"
     }


3️⃣ Explain SLA Risk


Endpoint: /explain-risk

Method: GET

Purpose: Explain why the SLA is at risk


🔹 Request

     /explain-risk?service_name=payment-service


🔹 Response

     {
       "service_name": "payment-service", 
       "top_contributing_factors": [
         {
           "factor": "error_rate_acceleration",
           "impact_percentage": 38
         },
         {
           "factor": "latency_deviation",
           "impact_percentage": 27  
         },
         {
           "factor": "recent_deployment",
           "impact_percentage": 17
         }
       ]
     }


4️⃣ Alerts (Auto-Triggered)


Condition:


sla_risk_probability > alert_threshold


🔹 Stored Alert (Firestore)

     {
       "service_name": "payment-service", 
       "risk_probability": 0.82,
       "time_horizon": "6 hours",
       "top_cause": "error_rate_acceleration",
       "severity": "RED",
       "timestamp": "2025-12-23T16:31:12Z"
     }


🔹 Push Notification (FCM)

🚨 SLA Risk Alert

     Service: payment-service
     
     Risk: 82%
     
     Likely breach in next 6 hours
     
     Top cause: Error rate spike


5️⃣ Minimal API Flow

     -> /ingest-metrics
      
     -> /predict-sla-risk
      
     -> /explain-risk
      
     -> Alerts + Dashboard Update



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

◘ Frontend: React , TailWind CSS

◘ Backend: FastAPI

◘ Database: Supabase (PostgreSQL)

◘ ML: Scikit-learn (explainable models)

◘ Visualization: Custom React components


🧑‍💻 Author

Tharun N V

Computer & Communication Engineering

Interested in AI/ML , SDE , MERN
