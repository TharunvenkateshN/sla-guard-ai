from app.db.supabase_client import supabase

def calculate_error_trend(service_id: str, window: int = 6) -> float:
    # Fetch last N error_rate values
    resp = (
        supabase
        .table("metrics")
        .select("error_rate")
        .eq("service_id", service_id)
        .order("timestamp", desc=True)
        .limit(window)
        .execute()
    )

    data = resp.data or []

    # Not enough data → no trend
    if len(data) < 2:
        return 0.0

    # Reverse to oldest → newest
    error_rates = [row["error_rate"] for row in reversed(data)]

    first = error_rates[0]
    last = error_rates[-1]

    slope = (last - first) / len(error_rates)
    return round(slope, 4)
