from pydantic import BaseModel, Field

class MetricsIn(BaseModel):
    service_name: str = Field(..., example="payment-service")
    uptime_percent: float = Field(..., example=99.92)
    avg_latency_ms: float = Field(..., example=230)
    p95_latency_ms: float = Field(..., example=410)
    error_rate: float = Field(..., example=0.021)
    request_volume: int = Field(..., example=18500)
    deployment_event: bool = Field(False, example=False)
