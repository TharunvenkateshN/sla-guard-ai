import React from "react";

export default function ServiceSelector({ service, setService }) {
  const services = [
    "payment-service",
    "auth-service",
    "order-service",
    "notification-service",
  ];

  return (
    <select
      value={service}
      onChange={(e) => setService(e.target.value)}
      className="border rounded px-3 py-2"
    >
      {services.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
