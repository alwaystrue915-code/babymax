'use client';

import { useState, useEffect } from 'react';
import { SendIcon } from './Icons';

export default function FloatingTelegram() {
  const [telegramLink, setTelegramLink] = useState('https://t.me/sailent_support');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings', {
          headers: { 'x-api-key': 'sailent_secure_v1_key' }
        });
        const data = await res.json();
        if (data.success && data.settings?.telegramLink) {
          setTelegramLink(data.settings.telegramLink);
        }
      } catch (err) {
        console.error('Error fetching telegram link:', err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <a
      href={telegramLink}
      target="_blank"
      rel="noopener noreferrer"
      className="floating-tg-btn animate-float"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #0088cc 0%, #00a2ed 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        boxShadow: '0 8px 24px rgba(0, 136, 204, 0.4)',
        zIndex: 1000,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        textDecoration: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 136, 204, 0.6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 136, 204, 0.4)';
      }}
    >
      <SendIcon size={28} />
      
      {/* Tooltip / Label */}
      <div className="tg-tooltip" style={{
        position: 'absolute',
        right: '70px',
        background: '#1e293b',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '12px',
        fontSize: '0.85rem',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        opacity: 0,
        visibility: 'hidden',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        Support Chat
      </div>

      <style jsx>{`
        .floating-tg-btn:hover .tg-tooltip {
          opacity: 1;
          visibility: visible;
          right: 64px;
        }

        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </a>
  );
}
