import React from "react";
import { useEffect, useRef } from "react";

export default function RiskHistoryChart({ data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const W = canvas.width;
    const H = canvas.height;
    const padding = 35;

    ctx.clearRect(0, 0, W, H);

    // ---- Axes ----
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 1;

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, H - padding);
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, H - padding);
    ctx.lineTo(W - padding, H - padding);
    ctx.stroke();

    // ---- Y-axis labels (0, 50, 100) ----
    ctx.fillStyle = "#6b7280";
    ctx.font = "12px Segoe UI";

    [0, 50, 100].forEach((val) => {
      const y =
        padding +
        (1 - val / 100) * (H - padding * 2);

      ctx.fillText(`${val}%`, 5, y + 4);

      ctx.strokeStyle = "#e5e7eb";
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(W - padding, y);
      ctx.stroke();
    });

    // ---- Plot risk line ----
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((point, i) => {
      const x =
        padding +
        (i / (data.length - 1)) *
          (W - padding * 2);

      const y =
        padding +
        (1 - point.risk_probability) *
          (H - padding * 2);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // ---- Points ----
    data.forEach((point, i) => {
      const x =
        padding +
        (i / (data.length - 1)) *
          (W - padding * 2);

      const y =
        padding +
        (1 - point.risk_probability) *
          (H - padding * 2);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#2563eb";
      ctx.fill();
    });
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={180}
      style={{ width: "100%", marginTop: "12px" }}
    />
  );
}
