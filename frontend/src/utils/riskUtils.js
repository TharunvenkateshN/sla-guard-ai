// ---------------------------------------------
// Risk Utilities (Mode-aware, SLA-correct)
// ---------------------------------------------

export function getRiskStateWithTrend(
  probability,
  previous,
  mode = "production"
) {
  // Thresholds by mode
  const thresholds =
    mode === "demo"
      ? {
          healthy: 0.0,
          warning: 0.3,
          critical: 0.5
        }
      : {
          healthy: 0.0,
          warning: 0.3,
          critical: 0.7
        };

  // CRITICAL always wins
  if (probability >= thresholds.critical) {
    return { label: "CRITICAL", color: "red" };
  }

  // WARNING if above warning threshold
  if (probability >= thresholds.warning) {
    // Optional: annotate trend influence (but never downgrade to HEALTHY)
    if (previous !== null && probability > previous) {
      return { label: "WARNING", color: "orange" };
    }

    // Stable or slightly decreasing but still risky
    return { label: "WARNING", color: "orange" };
  }

  return { label: "HEALTHY", color: "green" };
}

// ---------------------------------------------
// Exponential Moving Average smoothing
// ---------------------------------------------
export function smoothRisk(previous, current, alpha = 0.6) {
  if (previous === null || previous === undefined) return current;
  return alpha * current + (1 - alpha) * previous;
}
