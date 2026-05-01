'use client';

import { useState, useCallback, useMemo, memo, useEffect } from 'react';
import Link from 'next/link';
import { UserIcon, EmailIcon, LockIcon, AlertCircle } from '@/components/Icons';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Sidebar from '@/components/Sidebar';
import dynamic from 'next/dynamic';
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
    appName: "Sailent Predictor", 
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
          <div className="auth-card effect-float animate-scale-in" style={{ maxWidth: '520px' }}>
            <div className="auth-header animate-slide-up">
              <h1 className="auth-title">Create Account</h1>
              <p className="auth-subtitle">Join Sailent Predictor Pro today</p>
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
                <div style={{ marginBottom: '20px' }}>
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

              <div style={{ marginBottom: '24px' }}>
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

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
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
