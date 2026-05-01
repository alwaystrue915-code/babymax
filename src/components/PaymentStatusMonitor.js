'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, CheckCircle2, Download, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PaymentStatusMonitor() {
  const pathname = usePathname();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRejected, setShowRejected] = useState(false);
  const [status, setStatus] = useState('none');
  const [reason, setReason] = useState('');
  const [activationKey, setActivationKey] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [appSettings, setAppSettings] = useState({});
  const [hasShownThisSession, setHasShownThisSession] = useState(false);

  // Don't show on login/register pages
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname.startsWith('/admin');

  useEffect(() => {
    if (isAuthPage) return;

    const fetchStatus = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;

      try {
        const user = JSON.parse(storedUser);
        if (!user.email) return;
        setUserEmail(user.email);

        const token = localStorage.getItem('token');
        const res = await fetch(`/api/users/me`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'x-api-key': 'sailent_secure_v1_key',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ email: user.email })
        });
        const data = await res.json();
        
        if (data.success && data.user) {
          setStatus(data.user.paymentStatus);
          setReason(data.user.rejectionReason);
          setActivationKey(data.user.activationKey || '');
          
          if (data.user.paymentStatus === 'approved') {
            const downloaded = localStorage.getItem('appDownloaded') === 'true';
            const views = parseInt(localStorage.getItem('successPopupViews') || '0');
            
            if (!downloaded && views < 2 && !hasShownThisSession) {
              setShowSuccess(true);
              setHasShownThisSession(true);
              localStorage.setItem('successPopupViews', (views + 1).toString());
            }
          } else if (data.user.paymentStatus === 'rejected') {
            if (data.user.hasSeenStatusUpdate === false) {
              setShowRejected(true);
            }
          }
        }
      } catch (err) {
        console.error('Error monitoring payment status:', err);
      }
    };

    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings', {
          headers: { 'x-api-key': 'sailent_secure_v1_key' }
        });
        const data = await res.json();
        if (data.success) setAppSettings(data.settings);
      } catch (e) {}
    };

    fetchStatus();
    fetchSettings();
    
    // Check every 30 seconds for status updates
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [pathname, isAuthPage]);

  const acknowledge = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/users/me', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': 'sailent_secure_v1_key',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: userEmail })
      });
      setShowSuccess(false);
      setShowRejected(false);
    } catch (err) {
      setShowSuccess(false);
      setShowRejected(false);
    }
  };

  if (isAuthPage) return null;

  return (
    <AnimatePresence>
      {/* Success Popup */}
      {showSuccess && (
        <div style={overlayStyle}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={cardStyle}
          >
            <div style={{ ...iconBoxStyle, background: '#dcfce7', color: '#10b981' }}>
              <CheckCircle2 size={40} />
            </div>
            <h2 style={titleStyle}>Payment Approved!</h2>
            <p style={subtitleStyle}>Congratulations! Your payment has been verified. You now have full access to Sailent Predictor Pro.</p>
            
            <div style={infoBoxStyle}>
              <div style={infoItemStyle}>
                <span style={infoLabelStyle}>App Version</span>
                <span style={infoValueStyle}>{appSettings.appVersion || 'v1.0.2'}</span>
              </div>
              <div style={{ ...infoBoxStyle, background: '#f0fdf4', border: '1.5px dashed #86efac', marginTop: '12px', padding: '15px' }}>
                 <span style={{ color: '#166534', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>Activation Key</span>
                 <div style={{ color: '#15803d', fontSize: '1.2rem', fontWeight: '900', fontFamily: 'monospace' }}>{activationKey || 'N/A'}</div>
              </div>
            </div>

            <a 
              href={appSettings.appDownloadLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={buttonStyle} 
              className="btn-shine"
              onClick={() => {
                localStorage.setItem('appDownloaded', 'true');
                setShowSuccess(false);
              }}
            >
              <Download size={20} /> Download Application
            </a>
            
            <button onClick={acknowledge} style={closeButtonStyle}>Close & Start Prediction</button>
          </motion.div>
        </div>
      )}

      {/* Rejected Popup */}
      {showRejected && (
        <div style={overlayStyle}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={cardStyle}
          >
            <div style={{ ...iconBoxStyle, background: '#fee2e2', color: '#ef4444' }}>
              <XCircle size={40} />
            </div>
            <h2 style={titleStyle}>Payment Rejected</h2>
            <p style={subtitleStyle}>Your recent payment request was rejected for the following reason:</p>
            
            <div style={{ ...infoBoxStyle, background: '#fef2f2', border: '1px solid #fecaca', padding: '15px', color: '#b91c1c', fontWeight: '600' }}>
              {reason || 'Invalid Transaction Details'}
            </div>

            <Link href="/checkout" onClick={acknowledge} style={{ ...buttonStyle, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }} className="btn-shine">
              Try Again
            </Link>
            
            <button onClick={acknowledge} style={closeButtonStyle}>Dismiss</button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(15, 23, 42, 0.4)',
  backdropFilter: 'blur(12px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 3000,
  padding: '20px'
};

const cardStyle = {
  background: 'white',
  borderRadius: '32px',
  width: '100%',
  maxWidth: '400px',
  padding: '32px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  textAlign: 'center'
};

const iconBoxStyle = {
  width: '80px', height: '80px', borderRadius: '24px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  margin: '0 auto 24px'
};

const titleStyle = { fontSize: '1.75rem', fontWeight: '800', color: '#1e293b', marginBottom: '12px' };
const subtitleStyle = { fontSize: '1rem', color: '#64748b', lineHeight: '1.6', marginBottom: '24px' };
const infoBoxStyle = { background: '#f8fafc', borderRadius: '20px', padding: '12px', marginBottom: '24px' };
const infoItemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const infoLabelStyle = { fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' };
const infoValueStyle = { fontSize: '0.9rem', color: '#1e293b', fontWeight: '700' };

const buttonStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
  width: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  color: 'white', padding: '16px', borderRadius: '16px', textDecoration: 'none',
  fontWeight: '700', fontSize: '1rem', marginBottom: '16px',
  boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)'
};

const closeButtonStyle = {
  width: '100%', background: 'transparent', border: 'none',
  color: '#94a3b8', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer'
};
