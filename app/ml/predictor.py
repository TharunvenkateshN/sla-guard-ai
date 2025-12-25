import pandas as pd
from app.ml.model_loader import model

# IMPORTANT:
# This must match the exact feature order used during model training
FEATURE_COLUMNS = [
    "burn_rate",
    "error_trend",
    "error_acceleration",
    "latency_deviation"
]


def predict_sla_risk_ml(features: dict) -> float:
    """
    Predict SLA breach probability using trained ML model.

    Expected features:
    {
        "burn_rate": float,
        "error_trend": float,
        "error_acceleration": float,
        "latency_deviation": float
    }
    """

    # Create DataFrame with named columns (prevents sklearn warning)
    X = pd.DataFrame(
        [[features[col] for col in FEATURE_COLUMNS]],
        columns=FEATURE_COLUMNS
    )

    probability = model.predict_proba(X)[0][1]

    # Rounded for UI stability
    return round(float(probability), 2)
