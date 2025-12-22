import React from "react";
export default function IncidentTimeline({ events }) {
  if (!events || events.length === 0) {
    return <p style={{ fontSize: "14px", color: "#6b7280" }}>
      No incidents recorded
    </p>;
  }

  return (
    <ul style={{ paddingLeft: "16px" }}>
      {events.map((e, i) => (
        <li key={i} style={{ marginBottom: "8px" }}>
          <b>{e.event_type.replace("_", " ")}</b>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            {new Date(e.created_at).toLocaleString()}
          </div>
        </li>
      ))}
    </ul>
  );
}
