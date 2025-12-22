// ---------------------------------------------
// Risk Utilities (Mode-aware)
// ---------------------------------------------

// Mode-aware trend-based risk state
export function getRiskStateWithTrend(
  probability,
  previous,
  mode = "production"
) {
  // Thresholds differ by mode
  const thresholds =
    mode === "demo"
      ? {
          warning: 0.1,
          critical: 0.5
        }
      : {
          warning: 0.15,
          critical: 0.7
        };

  // CRITICAL always wins
  if (probability >= thresholds.critical) {
    return { label: "CRITICAL", color: "red" };
  }

  // WARNING if rising
  if (
    previous !== null &&
    probability >= thresholds.warning &&
    probability > previous
  ) {
    return { label: "WARNING", color: "orange" };
  }

  return { label: "HEALTHY", color: "green" };
}

// Exponential Moving Average smoothing
export function smoothRisk(previous, current, alpha = 0.6) {
  if (previous === null) return current;
  return alpha * current + (1 - alpha) * previous;
}
