from pydantic import BaseModel, Field

class PredictRequest(BaseModel):
    service_name: str = Field(..., example="payment-service")
    time_horizon_hours: int = Field(6, example=6)
