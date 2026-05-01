'use client';

import { useEffect, useRef } from 'react';

export default function GradientBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Blob configurations with iOS-style colors
    const blobs = [
      { x: 0.2, y: 0.3, radius: 0.4, color: 'rgba(255, 105, 180, 0.6)', speedX: 0.3, speedY: 0.2 }, // Pink
      { x: 0.7, y: 0.6, radius: 0.35, color: 'rgba(255, 69, 58, 0.5)', speedX: -0.25, speedY: 0.3 }, // Red
      { x: 0.5, y: 0.8, radius: 0.3, color: 'rgba(255, 149, 0, 0.5)', speedX: 0.2, speedY: -0.25 }, // Orange
      { x: 0.8, y: 0.2, radius: 0.25, color: 'rgba(255, 45, 85, 0.4)', speedX: -0.3, speedY: 0.35 }, // Coral
      { x: 0.3, y: 0.7, radius: 0.28, color: 'rgba(255, 130, 150, 0.5)', speedX: 0.35, speedY: -0.2 }, // Light Pink
      { x: 0.6, y: 0.4, radius: 0.32, color: 'rgba(255, 90, 95, 0.45)', speedX: -0.2, speedY: 0.4 }, // Soft Red
    ];

    const draw = () => {
      time += 0.005;

      // Clear canvas
      ctx.fillStyle = '#f8faff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw each blob
      blobs.forEach((blob, index) => {
        const x = (blob.x + Math.sin(time * blob.speedX + index) * 0.15) * canvas.width;
        const y = (blob.y + Math.cos(time * blob.speedY + index) * 0.15) * canvas.height;
        const radius = blob.radius * Math.min(canvas.width, canvas.height);

        // Create radial gradient
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(0.5, blob.color.replace(/[\d.]+\)/, '0.2)'));
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
