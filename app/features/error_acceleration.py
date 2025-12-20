from app.db.supabase_client import supabase

def calculate_error_acceleration(service_id: str, window: int = 6) -> float:
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

    if len(data) < 4:
        return 0.0  # not enough data for acceleration

    # oldest → newest
    error_rates = [row["error_rate"] for row in reversed(data)]

    mid = len(error_rates) // 2

    first_half = error_rates[:mid]
    second_half = error_rates[mid:]

    def slope(values):
        return (values[-1] - values[0]) / len(values)

    early_slope = slope(first_half)
    recent_slope = slope(second_half)

    acceleration = recent_slope - early_slope
    return round(acceleration, 4)
