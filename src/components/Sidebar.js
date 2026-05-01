'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Settings, BarChart3, LogOut, ChevronLeft, ChevronRight, Send, HelpCircle, FileText, Users, Clock, Shield } from 'lucide-react';
import CarvedBackground from './CarvedBackground';

export default function Sidebar({ isOpen, onToggle, settings }) {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarSize, setSidebarSize] = useState({ width: 260, height: 800 });
  const sidebarRef = useRef(null);
  const pathname = usePathname();

  // Track sidebar size for canvas
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSidebarSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    observer.observe(sidebar);
    return () => observer.disconnect();
  }, []);

  const menuItems = [
    { icon: Home, label: 'Home', active: pathname === '/dashboard', href: '/dashboard', color: '#10b981' },
    { icon: Clock, label: 'History', active: pathname === '/dashboard/history', href: '/dashboard/history', color: '#3b82f6' },
    { icon: HelpCircle, label: 'FAQ', active: pathname === '/faq', href: '/faq', color: '#f59e0b' },
    { icon: FileText, label: 'Privacy', active: pathname === '/privacy', href: '/privacy', color: '#8b5cf6' },
    { icon: Shield, label: 'Terms', active: pathname === '/terms', href: '/terms', color: '#10b981' },
    { icon: Send, label: 'Telegram', active: false, href: settings?.telegramLink || '#', external: true, color: '#0088cc' },
    { 
      icon: (props) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      ), 
      label: 'Instagram', 
      active: false, 
      href: settings?.instagramLink || '#',
      external: true,
      color: '#e1306c'
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onToggle}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar - Desktop: always visible, Mobile: overlay */}
      <aside
        ref={sidebarRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: collapsed ? '80px' : '260px',
          background: 'transparent',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease, transform 0.3s ease',
          zIndex: 50,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          overflow: 'hidden',
        }}
        className="sidebar"
      >
        {/* Carved Background */}
        <CarvedBackground width={sidebarSize.width} height={sidebarSize.height} />
        
        {/* Content wrapper to sit above the background */}
        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Logo */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {!collapsed && (
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <img 
                src="https://cdn.nexapk.in/image34.webp" 
                alt="Logo" 
                loading="lazy"
                style={{ 
                  height: '32px', 
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  WebkitUserDrag: 'none'
                }} 
              />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: '#8b5cf6', // Purple color
              position: collapsed ? 'relative' : 'absolute',
              right: collapsed ? 'auto' : '12px',
              top: collapsed ? 'auto' : '50%',
              transform: collapsed ? 'none' : 'translateY(-50%)',
              margin: collapsed ? '0 auto' : '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              background: collapsed ? 'rgba(139, 92, 246, 0.1)' : 'none'
            }}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '12px' : '12px 16px',
                marginBottom: '8px',
                borderRadius: '12px',
                background: item.active ? `${item.color}15` : 'transparent',
                color: '#0f172a',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                justifyContent: collapsed ? 'center' : 'flex-start',
                fontWeight: item.active ? '600' : '500',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                if (!item.active) {
                  e.currentTarget.style.background = `${item.color}08`;
                }
              }}
              onMouseLeave={(e) => {
                if (!item.active) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <item.icon size={20} style={{ color: item.color }} />
              {!collapsed && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: collapsed ? '12px' : '12px 16px',
              borderRadius: '12px',
              background: 'transparent',
              color: '#ef4444',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              justifyContent: collapsed ? 'center' : 'flex-start',
              fontWeight: '500',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
        </div>
      </aside>
    </>
  );
}
