import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

# -------------------------------
# 1. Generate Synthetic Data
# -------------------------------

np.random.seed(42)
N = 800

burn_rate = np.random.uniform(0, 5, N)
error_trend = np.random.uniform(-0.05, 0.1, N)
error_accel = np.random.uniform(-0.03, 0.08, N)
latency_dev = np.random.uniform(-0.3, 1.2, N)

# SLA breach logic (ground truth)
risk_score = (
    0.4 * (burn_rate / 5) +
    0.25 * np.clip(error_accel * 10, 0, 1) +
    0.2 * np.clip(error_trend * 10, 0, 1) +
    0.15 * np.clip(latency_dev, 0, 1)
)

labels = (risk_score > 0.7).astype(int)

data = pd.DataFrame({
    "burn_rate": burn_rate,
    "error_trend": error_trend,
    "error_acceleration": error_accel,
    "latency_deviation": latency_dev,
    "sla_breach": labels
})

# -------------------------------
# 2. Train/Test Split
# -------------------------------
X = data.drop("sla_breach", axis=1)
y = data["sla_breach"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -------------------------------
# 3. Train Logistic Regression
# -------------------------------
model = LogisticRegression()
model.fit(X_train, y_train)

# -------------------------------
# 4. Evaluate Model
# -------------------------------
y_pred = model.predict(X_test)
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

# Feature importance
importance = pd.Series(
    model.coef_[0],
    index=X.columns
).sort_values(ascending=False)

print("\nFeature Importance (Coefficients):\n")
print(importance)

# -------------------------------
# 5. Save Model
# -------------------------------
joblib.dump(model, "ml/sla_risk_model.joblib")
print("\nModel saved as ml/sla_risk_model.joblib")
