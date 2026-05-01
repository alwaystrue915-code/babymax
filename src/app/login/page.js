'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { EmailIcon, LockIcon, AlertCircle } from '@/components/Icons';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Sidebar from '@/components/Sidebar';
import dynamic from 'next/dynamic';

// Performance Optimization: Lazy load heavy animation components with no SSR
const GradientBackground = memo(dynamic(() => import('@/components/GradientBackground'), {
  ssr: false,
}));

const Plasma = memo(dynamic(() => import('@/components/Plasma'), {
  ssr: false,
  loading: () => <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, background: 'linear-gradient(135deg, #f8faff 0%, #f1f5f9 100%)' }} />,
}));

// Memoized Background Component to prevent re-renders during form typing
const AuthBackground = memo(({ color = "#6366f1" }) => (
  <>
    <Sidebar 
      isOpen={false} 
      onToggle={() => {}} 
      settings={{ appName: "Sailent Predictor", appLogoUrl: "https://cdn.nexapk.in/image34.webp" }}
      collapsed={true}
    />
    <div className="dashboard-content" style={{ position: 'relative', overflow: 'hidden', contain: 'strict' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <GradientBackground />
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, opacity: 0.3, pointerEvents: 'none' }}>
        <Plasma 
          color={color}
          speed={0.4}
          direction="forward"
          scale={1.5}
          opacity={0.6}
          mouseInteractive={false} 
        />
      </div>
    </div>
  </>
));

AuthBackground.displayName = 'AuthBackground';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Performance Optimization: Stable mount logic
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberEmail');
    const savedPassword = localStorage.getItem('rememberPassword');
    const savedRememberMe = localStorage.getItem('rememberMe');

    if (savedRememberMe === 'true' && savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  // Performance Optimization: Stable change handlers
  const handleEmailChange = useCallback((e) => setEmail(e.target.value), []);
  const handlePasswordChange = useCallback((e) => setPassword(e.target.value), []);
  const handleRememberChange = useCallback((e) => setRememberMe(e.target.checked), []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
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
          setError('Admins must use the dedicated Admin Login portal.');
          setLoading(false);
          return;
        }
        
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        if (rememberMe) {
          localStorage.setItem('rememberEmail', email);
          localStorage.setItem('rememberPassword', password);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberEmail');
          localStorage.removeItem('rememberPassword');
          localStorage.removeItem('rememberMe');
        }
        
        window.location.href = data.user.role === 'admin' ? '/admin' : '/dashboard';
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, rememberMe]);

  return (
    <div className="dashboard-layout" style={{ background: '#f8faff' }}>
      <AuthBackground color="#6366f1" />

      <div 
        className="auth-page-content" 
        style={{ 
          position: 'relative', 
          zIndex: 10, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          padding: '20px',
          willChange: 'transform' // GPU Acceleration
        }}
      >
        <div className="auth-card effect-float">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={handleEmailChange}
              icon={EmailIcon}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              icon={LockIcon}
              required
            />

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '24px',
              fontSize: '0.875rem'
            }}>
              <label className="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={handleRememberChange}
                />
                <span style={{ color: 'var(--text-secondary)' }}>Remember me</span>
              </label>
              <Link href="#" style={{ color: 'var(--accent)', fontWeight: '600' }}>
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg" className="btn-shine">
              Sign In
            </Button>

            {error && (
              <div className="error-message" style={{ marginTop: '16px', justifyContent: 'center' }}>
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
          </form>

          <div className="auth-divider">or continue with</div>

          <button type="button" className="social-button">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link href="/register" style={{ color: 'var(--accent)', fontWeight: '600' }} className="effect-rainbow-text">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
