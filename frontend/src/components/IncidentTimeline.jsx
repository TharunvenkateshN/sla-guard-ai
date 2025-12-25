import React, { useMemo, useState } from "react";

const PAGE_SIZE = 5;

// ---------------------------------------------
// Helpers
// ---------------------------------------------
function getIncidentTime(incident) {
  return (
    incident.timestamp ||
    incident.created_at ||
    incident.time ||
    null
  );
}

function getEventColor(incident) {
  const type = incident.event_type || incident.severity;

  switch (type) {
    case "CRITICAL_STARTED":
    case "CRITICAL":
      return "#dc2626";
    case "WARNING_STARTED":
    case "WARNING":
      return "#f59e0b";
    case "RECOVERED":
      return "#16a34a";
    default:
      return "#6b7280";
  }
}

function getEventDescription(incident) {
  const type = incident.event_type || incident.severity;

  switch (type) {
    case "WARNING_STARTED":
      return "SLA risk entered warning threshold";
    case "CRITICAL_STARTED":
      return "High probability of SLA breach detected";
    case "RECOVERED":
      return "Service metrics returned to healthy state";
    default:
      return "Incident state updated";
  }
}

// ---------------------------------------------
// Component
// ---------------------------------------------
export default function IncidentTimeline({ incidents = [] }) {
  const [page, setPage] = useState(0);

  const sortedIncidents = useMemo(() => {
    if (!Array.isArray(incidents)) return [];
    return [...incidents].sort((a, b) => {
      const t1 = new Date(getIncidentTime(b)).getTime();
      const t2 = new Date(getIncidentTime(a)).getTime();
      return t1 - t2;
    });
  }, [incidents]);

  const start = page * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const visibleIncidents = sortedIncidents.slice(start, end);

  const hasOlder = end < sortedIncidents.length;
  const hasNewer = page > 0;

  return (
    <div className="incident-timeline-container">
      <div
        className="incident-list"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxHeight: "320px",
          overflowY: "auto",
          paddingRight: "6px"
        }}
      >
        {visibleIncidents.length === 0 ? (
          <p style={{ fontSize: "13px", color: "#9ca3af" }}>
            No incidents recorded
          </p>
        ) : (
          visibleIncidents.map((inc, index) => {
            const type = inc.event_type || inc.severity;
            const isCritical =
              type === "CRITICAL_STARTED" || type === "CRITICAL";
            const color = getEventColor(inc);
            const timeValue = getIncidentTime(inc);

            return (
              <div
                key={inc.id || index}
                style={{
                  display: "flex",
                  gap: "10px",
                  padding: "12px",
                  borderLeft: `4px solid ${color}`,
                  background: "#0f172a",
                  borderRadius: "8px"
                }}
              >
                {/* Dot */}
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: color,
                    marginTop: "6px"
                  }}
                />

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: "14px",
                      color: color
                    }}
                  >
                    {(type || "UNKNOWN").replaceAll("_", " ")}
                  </div>

                  {/* ✅ TIME NOW ALWAYS WORKS */}
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      marginTop: "2px"
                    }}
                  >
                    {timeValue
                      ? new Date(timeValue).toLocaleString()
                      : "--"}
                  </div>

                  <div
                    style={{
                      fontSize: "13px",
                      marginTop: "6px",
                      color: "#e5e7eb"
                    }}
                  >
                    {getEventDescription(inc)}
                  </div>

                  {isCritical && (
                    <div style={{ marginTop: "6px" }}>
                      {inc.acknowledged ? (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#2563eb",
                            fontWeight: "500"
                          }}
                        >
                          Acknowledged
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#dc2626",
                            fontWeight: "600"
                          }}
                        >
                          Unacknowledged
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div
        className="timeline-controls"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "12px"
        }}
      >
        <button onClick={() => setPage((p) => p + 1)} disabled={!hasOlder}>
          ← Older
        </button>
        <button onClick={() => setPage((p) => p - 1)} disabled={!hasNewer}>
          Newer →
        </button>
      </div>
    </div>
  );
}
