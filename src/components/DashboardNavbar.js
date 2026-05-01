'use client';

import { Bell, Home, Send, User, LogOut, Mail } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function DashboardNavbar({ onMenuToggle, settings }) {
  const [user] = useState(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  });

  const [showUserPopup, setShowUserPopup] = useState(false);
  const popupRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowUserPopup(false);
      }
    };

    if (showUserPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserPopup]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <header
      className="dashboard-navbar"
      style={{
        background: 'white',
        borderBottom: '1px solid var(--border)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        height: '70px',
        minHeight: '70px',
        overflow: 'visible',
        position: 'relative'
      }}
    >
      {/* Left side - Navigation Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Mobile menu button - only show on mobile */}
        <button
          onClick={onMenuToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          className="mobile-menu-btn"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"></path>
          </svg>
        </button>

        {/* Nav Links - Desktop only */}
        <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <a
            href="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              color: 'var(--accent)',
              background: 'var(--accent-light)',
              fontWeight: '600',
              fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Home size={16} />
            <span>Home</span>
          </a>
          <a
            href={settings?.telegramLink || '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              fontWeight: '500',
              fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <Send size={16} />
            <span>Telegram</span>
          </a>
          <a
            href={settings?.instagramLink || '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              fontWeight: '500',
              fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
            <span>Instagram</span>
          </a>
        </div>
      </div>

      {/* Center - App Logo */}
      <div 
        style={{ 
          position: 'absolute', 
          left: '50%', 
          top: '50%', 
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}
      >
        <img 
          src="https://cdn.nexapk.in/image34.webp" 
          alt="Sailent Predictor Logo" 
          loading="lazy"
          style={{ 
            height: '42px', 
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            WebkitUserDrag: 'none',
            imageRendering: '-webkit-optimize-contrast'
          }} 
        />
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* User Icon with Popup - User Icon Style */}
        <div style={{ position: 'relative' }} ref={popupRef}>
          <button
            onClick={() => setShowUserPopup(!showUserPopup)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            <User size={20} />
            {/* Online indicator dot */}
            <span
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                background: '#10b981',
                borderRadius: '50%',
                border: '2px solid white',
              }}
            />
          </button>

          {/* User Info Popup */}
          {showUserPopup && (
            <div
              style={{
                position: 'fixed',
                top: '70px',
                right: '16px',
                width: '280px',
                textAlign: 'center',
                padding: '20px 16px',
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                zIndex: 9999,
                animation: 'slideDown 0.3s ease-out'
              }}
            >
              {/* Overlay circle effect */}
              <div
                style={{
                  position: 'absolute',
                  top: '-30px',
                  right: '-30px',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.082)',
                  pointerEvents: 'none'
                }}
              />

              {/* User Avatar */}
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.125)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: '#10b981',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>

              {/* User Name */}
              <div style={{ fontSize: '1.375rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', position: 'relative', zIndex: 1 }}>
                {user?.fullName || 'User'}
              </div>

              {/* User Email */}
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
                {user?.email || 'user@example.com'}
              </div>

              {/* Email Info Box */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  background: 'rgba(16, 185, 129, 0.05)',
                  borderRadius: '14px',
                  marginBottom: '12px',
                  border: '1px solid rgba(16, 185, 129, 0.1)',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                  <Mail size={18} color="#10b981" />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '2px' }}>
                      Email
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                      {user?.email || 'user@example.com'}
                    </div>
                  </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px',
                  background: 'rgba(239, 68, 68, 0.05)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.1)',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  zIndex: 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
