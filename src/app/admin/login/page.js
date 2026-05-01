'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EmailIcon, LockIcon, AlertCircle, ShieldIcon } from '@/components/Icons';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import dynamic from 'next/dynamic';

const GradientBackground = dynamic(() => import('@/components/GradientBackground'), { ssr: false });

const SplitText = dynamic(() => import('@/components/SplitText'), {
  ssr: false,
  loading: () => null,
});

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (adminToken && adminUser) {
      try {
        const user = JSON.parse(adminUser);
        if (user.role === 'admin') {
          window.location.href = '/admin';
        }
      } catch (e) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': 'sailent_secure_v1_key'
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.user && data.user.role === 'admin') {
          localStorage.setItem('adminUser', JSON.stringify(data.user));
          localStorage.setItem('adminToken', data.token);
          window.location.href = '/admin';
        } else {
          setError('Access Denied: You do not have administrator privileges.');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated Gradient Background */}
      <div className="animate-fade-in" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <GradientBackground />
      </div>
      
      <div className="auth-card effect-float animate-scale-in">

        <div className="auth-header">
          <div style={{ 
            width: '60px', 
            height: '60px', 
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 20px',
            boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)'
          }}>
            <ShieldIcon size={32} color="white" />
          </div>
          
          <SplitText
            text="Admin Portal"
            tag="h1"
            className="auth-title"
            delay={80}
            duration={0.8}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40, rotateX: -90 }}
            to={{ opacity: 1, y: 0, rotateX: 0 }}
            textAlign="center"
          />
          <SplitText
            text="Secure access to Sailent Management Console"
            tag="p"
            className="auth-subtitle"
            delay={40}
            duration={0.5}
            ease="power2.out"
            splitType="chars"
            from={{ opacity: 0, y: 15 }}
            to={{ opacity: 1, y: 0 }}
            textAlign="center"
          />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="animate-slide-up delay-100">
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={EmailIcon}
              required
            />
          </div>

          <div className="animate-slide-up delay-200">
            <Input
              label="Secret Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={LockIcon}
              required
            />
          </div>

          <div className="animate-slide-up delay-300">
            <Button type="submit" fullWidth loading={loading} size="lg" className="btn-shine" style={{ marginTop: '12px' }}>
              Login to Admin
            </Button>
          </div>

          {error && (
            <div className="error-message" style={{ marginTop: '16px', justifyContent: 'center' }}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Not an admin?{' '}
          <a href="/login" style={{ color: 'var(--accent)', fontWeight: '600' }}>
            User Login
          </a>
        </div>
      </div>
    </div>
  );
}

