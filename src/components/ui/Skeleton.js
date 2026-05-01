'use client';

export default function Skeleton({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '8px',
  style = {}
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '1000px 100%',
        animation: 'shimmer 2s infinite',
        ...style,
      }}
    />
  );
}
