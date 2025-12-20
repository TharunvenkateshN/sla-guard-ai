from app.features.burn_rate import calculate_burn_rate
from app.features.trend_slope import calculate_error_trend
from app.features.error_acceleration import calculate_error_acceleration
from app.features.latency_deviation import calculate_latency_deviation

def calculate_sla_risk(service_id: str) -> dict:
    burn = calculate_burn_rate(service_id)
    trend = calculate_error_trend(service_id)
    accel = calculate_error_acceleration(service_id)
    latency = calculate_latency_deviation(service_id)

    # Normalize values (simple caps for MVP)
    burn_score = min(burn / 2, 1.0)
    trend_score = min(abs(trend) * 10, 1.0)
    accel_score = min(abs(accel) * 10, 1.0)
    latency_score = min(abs(latency), 1.0)

    risk = (
        0.4 * burn_score +
        0.25 * accel_score +
        0.2 * trend_score +
        0.15 * latency_score
    )

    risk = round(min(risk, 1.0), 2)

    reasons = []
    if burn_score > 0.7:
        reasons.append("High SLA burn rate")
    if accel_score > 0.5:
        reasons.append("Error rate accelerating")
    if trend_score > 0.5:
        reasons.append("Sustained error increase")
    if latency_score > 0.3:
        reasons.append("Latency deviating from baseline")

    return {
        "sla_risk_probability": risk,
        "top_factors": reasons
    }
