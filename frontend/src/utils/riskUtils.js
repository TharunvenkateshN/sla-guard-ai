// Classify SLA risk into human-readable state
export function getRiskState(probability) {
  if (probability >= 0.7) {
    return { label: "CRITICAL", color: "red" };
  } else if (probability >= 0.4) {
    return { label: "WARNING", color: "orange" };
  } else {
    return { label: "HEALTHY", color: "green" };
  }
}

// Smooth risk values using Exponential Moving Average (EMA)
export function smoothRisk(previous, current, alpha = 0.6) {
  if (previous === null) return current;
  return alpha * current + (1 - alpha) * previous;
}

// Detect trend direction
export function getTrend(current, previous) {
  if (previous === null) return "→";
  if (current > previous) return "↑";
  if (current < previous) return "↓";
  return "→";
}
