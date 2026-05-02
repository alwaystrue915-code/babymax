'use client';

import { useState, useCallback, useMemo, memo, useEffect } from 'react';
import Link from 'next/link';
import { UserIcon, EmailIcon, LockIcon, AlertCircle } from '@/components/Icons';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Sidebar from '@/components/Sidebar';
import dynamic from 'next/dynamic';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import OTPVerification from '@/components/OTPVerification';

// Performance Optimization: Lazy load heavy animation components with no SSR
const GradientBackground = memo(dynamic(() => import('@/components/GradientBackground'), {
  ssr: false,
}));

// Memoized Background Layer to prevent re-renders during form typing
const BackgroundLayer = memo(() => (
  <div className="animate-fade-in" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
    <GradientBackground />
  </div>
));

BackgroundLayer.displayName = 'BackgroundLayer';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [settings, setSettings] = useState({ 
    appName: "Wingo Tool", 
    appLogoUrl: "https://cdn.nexapk.in/image34.webp",
    instagramLink: "",
    telegramLink: ""
  });

  // Performance Optimization: Stable password strength calculation
  const passwordStrength = useMemo(() => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }, [formData.password]);

  const strengthLabels = useMemo(() => ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'], []);
  const strengthColors = useMemo(() => ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#059669'], []);

  // Performance Optimization: Stable change handler
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => (prev[name] ? { ...prev, [name]: '' } : prev));
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings", { 
          headers: { 'x-api-key': 'sailent_secure_v1_key' }
        });
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@gmail\.com$/i.test(formData.email)) {
      newErrors.email = 'Only Gmail addresses are allowed (e.g., username@gmail.com)';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!acceptTerms) newErrors.terms = 'You must accept the terms and conditions';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, acceptTerms]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const otpResponse = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'sailent_secure_v1_key' },
        body: JSON.stringify({ email: formData.email }),
      });
      const otpData = await otpResponse.json();

      if (otpData.status === 'success') {
        setShowOTP(true);
      } else {
        setErrors(prev => ({ ...prev, submit: otpData.message || 'Failed to send OTP.' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: 'An error occurred. Please try again.' }));
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm]);

  const handleOTPVerify = useCallback(async (otpCode) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'sailent_secure_v1_key' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': 'sailent_secure_v1_key' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });

        const loginData = await loginResponse.json();
        if (loginData.success) {
          localStorage.setItem('user', JSON.stringify(loginData.user));
          localStorage.setItem('token', loginData.token);
          sessionStorage.setItem('registered', 'true');
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/login?registered=true';
        }
      } else {
        setErrors(prev => ({ ...prev, submit: data.message || 'Registration failed' }));
        setShowOTP(false);
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: error.message || 'An error occurred.' }));
      setShowOTP(false);
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const handleOTPCancel = useCallback(() => {
    setShowOTP(false);
    setErrors({});
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrors({});
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedUser = result.user;

      const response = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'sailent_secure_v1_key'
        },
        body: JSON.stringify({
          fullName: loggedUser.displayName,
          email: loggedUser.email,
          provider: 'google'
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      } else {
        setErrors(prev => ({ ...prev, submit: data.message || 'Google login failed' }));
      }
    } catch (error) {
      console.error('Google login error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setErrors(prev => ({ ...prev, submit: 'Login cancelled.' }));
      } else {
        setErrors(prev => ({ ...prev, submit: 'An error occurred with Google login.' }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout" style={{ background: '#f8faff' }}>
      <Sidebar 
        isOpen={false} 
        onToggle={() => {}} 
        settings={settings}
        collapsed={true}
      />

      <div className="dashboard-content" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background is now a separate memoized layer */}
        <BackgroundLayer />

        <div 
          className="auth-page-content" 
          style={{ 
            position: 'relative', 
            zIndex: 10, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh',
            padding: '20px'
          }}
        >
          <div className="auth-card effect-float animate-scale-in" style={{ maxWidth: '480px', padding: '30px 40px' }}>
            <div className="auth-header animate-slide-up" style={{ marginBottom: '1.5rem' }}>
              <h1 className="auth-title">Create Account</h1>
              <p className="auth-subtitle">Join Wingo Tool today</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="animate-slide-up delay-100">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  icon={UserIcon}
                  error={errors.fullName}
                  required
                />
              </div>

              <div className="animate-slide-up delay-200">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="username@gmail.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  icon={EmailIcon}
                  error={errors.email}
                  required
                />
              </div>

              <div className="animate-slide-up delay-300">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Create password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  icon={LockIcon}
                  error={errors.password}
                  required
                />
              </div>

              {formData.password && (
                <div style={{ marginBottom: '12px' }}>
                  <div className="password-strength">
                    <div 
                      className="password-strength-bar"
                      style={{ 
                        width: `${(passwordStrength / 5) * 100}%`,
                        background: strengthColors[passwordStrength]
                      }}
                    />
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginTop: '6px',
                    fontSize: '0.75rem',
                    color: 'var(--text-tertiary)'
                  }}>
                    <span>Password strength</span>
                    <span style={{ color: strengthColors[passwordStrength], fontWeight: '600' }}>
                      {strengthLabels[passwordStrength]}
                    </span>
                  </div>
                </div>
              )}

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon={LockIcon}
                error={errors.confirmPassword}
                required
              />

              <div style={{ marginBottom: '16px' }}>
                <label className="checkbox-wrapper">
                  <input 
                    type="checkbox" 
                    checked={acceptTerms}
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked);
                      if (errors.terms) setErrors(prev => ({ ...prev, terms: '' }));
                    }}
                  />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    I accept the <Link href="/terms" style={{ color: 'var(--accent)', fontWeight: '600' }}>Terms</Link> and <Link href="/privacy" style={{ color: 'var(--accent)', fontWeight: '600' }}>Privacy Policy</Link>
                  </span>
                </label>
                {errors.terms && (
                  <div className="error-message" style={{ marginTop: '8px' }}>
                    <AlertCircle size={14} />
                    <span>{errors.terms}</span>
                  </div>
                )}
              </div>

              <div className="animate-slide-up delay-400">
                <Button type="submit" fullWidth loading={loading} size="lg" className="btn-shine">
                  Create Account
                </Button>
              </div>

              {errors.submit && (
                <div className="error-message" style={{ marginTop: '16px', justifyContent: 'center' }}>
                  <AlertCircle size={14} />
                  <span>{errors.submit}</span>
                </div>
              )}
            </form>

            <div className="auth-divider" style={{ margin: '16px 0' }}>or continue with</div>

            <button 
              type="button" 
              className="social-button" 
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>

            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--accent)', fontWeight: '600' }} className="effect-rainbow-text">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOTP && (
        <OTPVerification
          email={formData.email}
          onVerify={handleOTPVerify}
          onCancel={handleOTPCancel}
        />
      )}
    </div>
  );
}
