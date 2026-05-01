'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export default function ScreenshotLoop({ screenshots = [] }) {
  const [isPaused, setIsPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const speed = 0.5; // pixels per frame

  const duplicatedScreenshots = [...screenshots, ...screenshots];

  const animate = useCallback((time) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const delta = time - lastTimeRef.current;

    if (!isPaused) {
      setOffset((prevOffset) => {
        const containerWidth = containerRef.current?.offsetWidth || 0;
        const totalWidth = containerWidth / 2;
        const newOffset = (prevOffset + speed * (delta / 16)) % totalWidth;
        return newOffset;
      });
    }

    lastTimeRef.current = time;
    animationRef.current = requestAnimationFrame(animate);
  }, [isPaused, speed]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  if (!screenshots || screenshots.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        background: 'transparent',
        padding: '20px 0',
        minHeight: '240px', // Reserve space for 200px image + 40px padding
        display: 'flex',
        alignItems: 'center'
      }}
    >
      {/* Left fade effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '150px',
          height: '100%',
          background: 'linear-gradient(to right, var(--bg-primary) 0%, transparent 100%)',
          zIndex: 10,
          pointerEvents: 'none'
        }}
      />

      {/* Right fade effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '150px',
          height: '100%',
          background: 'linear-gradient(to left, var(--bg-primary) 0%, transparent 100%)',
          zIndex: 10,
          pointerEvents: 'none'
        }}
      />

      {/* Screenshot container */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        style={{
          display: 'flex',
          gap: '40px',
          transform: `translateX(-${offset}px)`,
          willChange: 'transform',
          cursor: isPaused ? 'pointer' : 'grab'
        }}
      >
        {duplicatedScreenshots.map((screenshot, index) => (
          <div
            key={`${screenshot.src}-${index}`}
            style={{
              flexShrink: 0,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
              border: '1px solid var(--border)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)';
            }}
          >
            <img
              src={screenshot.src}
              alt={screenshot.alt || `Screenshot ${index + 1}`}
              loading="lazy"
              style={{
                display: 'block',
                height: '200px',
                width: 'auto',
                objectFit: 'cover',
                borderRadius: '16px'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
