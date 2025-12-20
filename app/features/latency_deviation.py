from app.db.supabase_client import supabase

def calculate_latency_deviation(service_id: str, window: int = 10, recent: int = 3) -> float:
    resp = (
        supabase
        .table("metrics")
        .select("p95_latency_ms")
        .eq("service_id", service_id)
        .order("timestamp", desc=True)
        .limit(window)
        .execute()
    )

    data = resp.data or []

    if len(data) < recent + 1:
        return 0.0

    # newest → oldest
    latencies = [row["p95_latency_ms"] for row in data]

    recent_vals = latencies[:recent]
    baseline_vals = latencies[recent:]

    recent_avg = sum(recent_vals) / len(recent_vals)
    baseline_avg = sum(baseline_vals) / len(baseline_vals)

    if baseline_avg == 0:
        return 0.0

    deviation = (recent_avg - baseline_avg) / baseline_avg
    return round(deviation, 4)
