'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

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
        if (totalWidth === 0) return 0;
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
        minHeight: '240px',
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
          background: 'linear-gradient(to right, #f8faff 0%, transparent 100%)',
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
          background: 'linear-gradient(to left, #f8faff 0%, transparent 100%)',
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
              transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0,0,0,0.05)',
              background: '#f1f5f9',
              position: 'relative',
              width: '120px',
              height: '240px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.08) translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';
            }}
          >
            <Image
              src={screenshot.src}
              alt={screenshot.alt || `Screenshot ${index + 1}`}
              fill
              style={{
                objectFit: 'cover',
                transition: 'opacity 0.5s ease'
              }}
              sizes="120px"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
