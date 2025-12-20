from pathlib import Path
import joblib

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / "ml" / "sla_risk_model.joblib"

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"ML model not found at {MODEL_PATH}")

model = joblib.load(MODEL_PATH)
