// ---------------------------------------------
// SLA Risk Classification Utilities
// ---------------------------------------------

// Base risk classification (probability only)
export function getRiskState(probability) {
  if (probability >= 0.7) {
    return { label: "CRITICAL", color: "red" };
  } else if (probability >= 0.4) {
    return { label: "WARNING", color: "orange" };
  } else {
    return { label: "HEALTHY", color: "green" };
  }
}

// Trend-aware risk classification (MVP UX logic)
export function getRiskStateWithTrend(probability, previous) {
  // Hard critical
  if (probability >= 0.7) {
    return { label: "CRITICAL", color: "red" };
  }

  // Warning if risk is rising meaningfully
  if (
    previous !== null &&
    probability >= 0.15 &&
    probability > previous
  ) {
    return { label: "WARNING", color: "orange" };
  }

  // Otherwise healthy
  return { label: "HEALTHY", color: "green" };
}

// Exponential Moving Average smoothing
export function smoothRisk(previous, current, alpha = 0.6) {
  if (previous === null) return current;
  return alpha * current + (1 - alpha) * previous;
}
