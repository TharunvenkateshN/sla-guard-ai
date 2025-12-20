import numpy as np
from app.ml.model_loader import model

def predict_sla_risk_ml(features: dict) -> float:
    """
    features = {
        burn_rate,
        error_trend,
        error_acceleration,
        latency_deviation
    }
    """

    X = np.array([[
        features["burn_rate"],
        features["error_trend"],
        features["error_acceleration"],
        features["latency_deviation"]
    ]])

    probability = model.predict_proba(X)[0][1]
    return round(float(probability), 2)
