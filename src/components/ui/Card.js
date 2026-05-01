'use client';

import { useState } from 'react';

export default function Card({ 
  children, 
  className = '', 
  padding = '24px',
  hover = false,
  onClick,
  style = {}
}) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles = {
    background: 'white',
    borderRadius: '20px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    padding: padding === 'none' ? '0' : padding,
    transition: 'all 0.3s ease',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  const hoverStyles = hover ? {
    ...(isHovered && {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
      borderColor: 'var(--accent)',
    }),
  } : {};

  return (
    <div
      className={className}
      style={{
        ...baseStyles,
        ...hoverStyles,
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
}
