from app.db.supabase_client import supabase

def calculate_burn_rate(service_id: str) -> float:
    # 1. Fetch SLA target
    sla_resp = (
        supabase
        .table("sla_definitions")
        .select("availability_target")
        .eq("service_id", service_id)
        .limit(1)
        .execute()
    )

    if not sla_resp.data:
        return 0.0  # No SLA defined → no burn

    sla_target = sla_resp.data[0]["availability_target"]

    # 2. Fetch latest metric
    metric_resp = (
        supabase
        .table("metrics")
        .select("uptime_percent")
        .eq("service_id", service_id)
        .order("timestamp", desc=True)
        .limit(1)
        .execute()
    )

    if not metric_resp.data:
        return 0.0

    uptime_percent = metric_resp.data[0]["uptime_percent"]

    # 3. Burn rate calculation
    allowed_error = 100 - sla_target
    actual_error = 100 - uptime_percent

    if allowed_error <= 0:
        return 0.0

    burn_rate = actual_error / allowed_error
    return round(burn_rate, 2)
