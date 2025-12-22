from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from app.db.supabase_client import supabase
from app.schemas.metrics import MetricsIn
from app.schemas.prediction import PredictRequest

from app.features.burn_rate import calculate_burn_rate
from app.features.trend_slope import calculate_error_trend
from app.features.error_acceleration import calculate_error_acceleration
from app.features.latency_deviation import calculate_latency_deviation
from app.features.risk_score import calculate_sla_risk

from app.ml.predictor import predict_sla_risk_ml


# --------------------------------------------------
# APP INITIALIZATION
# --------------------------------------------------
app = FastAPI(title="SLA-Guard AI")

# --------------------------------------------------
# CORS CONFIGURATION (REQUIRED FOR FRONTEND)
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # React (Vite)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# HEALTH CHECK (OPTIONAL BUT RECOMMENDED)
# --------------------------------------------------
@app.get("/")
def health():
    return {"status": "ok"}


# --------------------------------------------------
# INGEST METRICS (Core Input API)
# --------------------------------------------------
@app.post("/ingest-metrics")
def ingest_metrics(payload: MetricsIn):
    service_resp = (
        supabase
        .table("services")
        .select("id")
        .eq("name", payload.service_name)
        .execute()
    )

    if service_resp.data:
        service_id = service_resp.data[0]["id"]
    else:
        new_service = (
            supabase
            .table("services")
            .insert({"name": payload.service_name})
            .execute()
        )
        service_id = new_service.data[0]["id"]

    metrics_data = {
        "service_id": service_id,
        "timestamp": datetime.utcnow().isoformat(),
        "uptime_percent": payload.uptime_percent,
        "avg_latency_ms": payload.avg_latency_ms,
        "p95_latency_ms": payload.p95_latency_ms,
        "error_rate": payload.error_rate,
        "request_volume": payload.request_volume,
        "deployment_event": payload.deployment_event
    }

    supabase.table("metrics").insert(metrics_data).execute()

    return {
        "status": "success",
        "service": payload.service_name,
        "timestamp": metrics_data["timestamp"]
    }


# --------------------------------------------------
# PREDICT SLA RISK (CORE PRODUCT API)
# --------------------------------------------------
@app.post("/predict-sla-risk")
def predict_sla_risk(payload: PredictRequest):
    service = (
        supabase
        .table("services")
        .select("id")
        .eq("name", payload.service_name)
        .execute()
    )

    if not service.data:
        raise HTTPException(status_code=404, detail="Service not found")

    service_id = service.data[0]["id"]

    # ---------------------------------
    # Rule-based analysis (Explanation)
    # ---------------------------------
    rule_result = calculate_sla_risk(service_id)
    factors = rule_result.get("top_factors", [])

    # ---------------------------------
    # Feature extraction for ML
    # ---------------------------------
    features = {
        "burn_rate": calculate_burn_rate(service_id),
        "error_trend": calculate_error_trend(service_id),
        "error_acceleration": calculate_error_acceleration(service_id),
        "latency_deviation": calculate_latency_deviation(service_id)
    }

    # ---------------------------------
    # ML-based probability prediction
    # ---------------------------------
    risk_score = predict_sla_risk_ml(features)

    ALERT_THRESHOLD = 0.7
    alert_required = risk_score >= ALERT_THRESHOLD

    # ---------------------------------
    # Persist prediction
    # ---------------------------------
    supabase.table("predictions").insert({
        "service_id": service_id,
        "risk_probability": risk_score,
        "time_horizon_hours": payload.time_horizon_hours,
        "alert_required": alert_required
    }).execute()

    # ---------------------------------
    # Persist alert (if required)
    # ---------------------------------
    if alert_required:
        supabase.table("alerts").insert({
            "service_id": service_id,
            "risk_probability": risk_score,
            "time_horizon": f"{payload.time_horizon_hours} hours",
            "top_cause": factors[0] if factors else "Unknown"
        }).execute()

    return {
        "service": payload.service_name,
        "sla_risk_probability": risk_score,
        "time_horizon": f"{payload.time_horizon_hours} hours",
        "alert_required": alert_required,
        "top_factors": factors
    }
# --------------------------------------------------
# DEBUG FEATURES (EXPLAINABILITY ENDPOINT)
# --------------------------------------------------
@app.post("/debug-features")
def debug_features(payload: PredictRequest):
    service = (
        supabase
        .table("services")
        .select("id")
        .eq("name", payload.service_name)
        .execute()
    )

    if not service.data:
        raise HTTPException(status_code=404, detail="Service not found")

    service_id = service.data[0]["id"]

    # Feature extraction
    burn_rate = calculate_burn_rate(service_id)
    error_trend = calculate_error_trend(service_id)
    error_acceleration = calculate_error_acceleration(service_id)
    latency_deviation = calculate_latency_deviation(service_id)

    features = {
        "burn_rate": burn_rate,
        "error_trend": error_trend,
        "error_acceleration": error_acceleration,
        "latency_deviation": latency_deviation
    }

    # ML prediction
    risk_score = predict_sla_risk_ml(features)

    return {
        "service": payload.service_name,
        "features": features,
        "sla_risk_probability": risk_score,
        "time_horizon": f"{payload.time_horizon_hours} hours"
    }
