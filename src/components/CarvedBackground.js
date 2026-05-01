"use client";

import { useEffect, useRef } from "react";

export default function CarvedBackground({ width, height }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      const w = (canvas.width = width || window.innerWidth);
      const h = (canvas.height = height || window.innerHeight);

      ctx.clearRect(0, 0, w, h);

      // ===== ✅ FIXED BACKGROUND =====
      const bg = ctx.createLinearGradient(0, 0, 0, h);

      bg.addColorStop(0, "#FFFFFF"); // top pure white
      bg.addColorStop(0.7, "#FFFFFF"); // center still white
      bg.addColorStop(1, "#EAF7EF"); // bottom soft green

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // ===== BLOB SHAPES =====
      const drawBlob = (cx, cy, radius, color, irregularity = 0.3) => {
        const points = 8;
        const angleStep = (Math.PI * 2) / points;

        ctx.beginPath();

        for (let i = 0; i <= points; i++) {
          const angle = i * angleStep;
          const noise = 1 + (Math.random() - 0.5) * irregularity;
          const r = radius * noise;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevAngle = (i - 1) * angleStep;
            const prevNoise = 1 + (Math.random() - 0.5) * irregularity;
            const prevR = radius * prevNoise;
            const prevX = cx + Math.cos(prevAngle) * prevR;
            const prevY = cy + Math.sin(prevAngle) * prevR;

            const cpX = (prevX + x) / 2 + (Math.random() - 0.5) * radius * 0.3;
            const cpY = (prevY + y) / 2 + (Math.random() - 0.5) * radius * 0.3;

            ctx.quadraticCurveTo(cpX, cpY, x, y);
          }
        }

        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      };

      // ===== BLOBS =====
      drawBlob(w * 0.15, h * 0.2, w * 0.12, "rgba(0,122,255,0.08)");
      drawBlob(w * 0.8, h * 0.15, w * 0.1, "rgba(52,199,89,0.08)");
      drawBlob(w * 0.2, h * 0.75, w * 0.15, "rgba(175,82,222,0.08)");
      drawBlob(w * 0.85, h * 0.8, w * 0.08, "rgba(0,122,255,0.08)");
      drawBlob(w * 0.5, h * 0.5, w * 0.18, "rgba(255,149,0,0.06)");
      drawBlob(w * 0.7, h * 0.6, w * 0.1, "rgba(255,45,85,0.06)");
    };

    draw();

    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
}
