'use client';

export default function LoadingSkeleton() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          {/* Title skeleton */}
          <div 
            className="skeleton"
            style={{ 
              height: '48px', 
              width: '70%', 
              margin: '0 auto 12px',
              borderRadius: '8px'
            }}
          />
          {/* Subtitle skeleton */}
          <div 
            className="skeleton"
            style={{ 
              height: '20px', 
              width: '85%', 
              margin: '0 auto',
              borderRadius: '6px'
            }}
          />
        </div>

        {/* Form skeleton */}
        <div style={{ marginTop: '32px' }}>
          <div className="skeleton" style={{ height: '60px', marginBottom: '20px', borderRadius: '12px' }} />
          <div className="skeleton" style={{ height: '60px', marginBottom: '20px', borderRadius: '12px' }} />
          <div className="skeleton" style={{ height: '56px', borderRadius: '12px' }} />
        </div>
      </div>
    </div>
  );
}
