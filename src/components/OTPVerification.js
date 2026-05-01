'use client';

import { useState, useRef, useEffect } from 'react';

export default function OTPVerification({ email, onVerify, onCancel }) {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const inputRefs = useRef([]);

  // Start countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 4; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus on the next empty input or last input
    const nextIndex = Math.min(pastedData.length, 3);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 4) {
      setError('Please enter complete 4-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'sailent_secure_v1_key'
        },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const data = await response.json();

      if (data.status === 'success') {
        onVerify(otpCode);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
        // Clear OTP inputs
        setOtp(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setResendLoading(true);
    setError('');

    try {
      const response = await fetch('/api/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'sailent_secure_v1_key'
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (data.status === 'success') {
        setCountdown(30);
        setCanResend(false);
        setRateLimitInfo(data.remaining ? { remaining: data.remaining } : null);
        setError('');
      } else {
        // Handle rate limiting
        if (response.status === 429) {
          setCountdown(data.retryAfter || 30);
          setCanResend(false);
          setError(data.message || 'Too many attempts. Please wait.');
        } else {
          setError(data.message || 'Failed to resend OTP');
        }
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div className="auth-card" style={{
        maxWidth: '450px',
        width: '100%',
        animation: 'scaleIn 0.3s ease-out',
      }}>
        <div className="auth-header">
          <h1 className="auth-title" style={{ fontSize: '1.75rem' }}>
            Verify OTP
          </h1>
          <p className="auth-subtitle">
            Enter the 4-digit code sent to
          </p>
          <p style={{ 
            color: 'var(--accent)', 
            fontWeight: '600',
            marginTop: '8px',
            fontSize: '0.95rem'
          }}>
            {email}
          </p>
        </div>

        {/* OTP Input Boxes */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              style={{
                width: '60px',
                height: '70px',
                textAlign: 'center',
                fontSize: '2rem',
                fontWeight: '700',
                border: '2px solid var(--border)',
                borderRadius: '12px',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent)';
                e.target.style.boxShadow = '0 0 0 4px var(--accent-light)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message" style={{ 
            marginBottom: '20px',
            justifyContent: 'center'
          }}>
            <span>{error}</span>
          </div>
        )}

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading || otp.join('').length !== 4}
          className="btn btn-primary btn-block btn-lg btn-shine"
          style={{
            marginBottom: '20px',
            opacity: loading || otp.join('').length !== 4 ? 0.6 : 1,
            cursor: loading || otp.join('').length !== 4 ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                style={{ animation: 'spin 1s linear infinite' }}
              >
                <circle 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  fill="none" 
                  strokeDasharray="31.4 31.4"
                />
              </svg>
              Verifying...
            </span>
          ) : (
            'Verify OTP'
          )}
        </button>

        {/* Resend OTP */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ 
            fontSize: '0.875rem', 
            color: 'var(--text-secondary)',
            marginBottom: '12px'
          }}>
            Didn't receive the code?
          </p>
          {canResend ? (
            <button
              onClick={handleResendOTP}
              disabled={resendLoading}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                fontWeight: '600',
                cursor: resendLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!resendLoading) e.target.style.background = 'var(--accent-light)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none';
              }}
            >
              {resendLoading ? 'Sending...' : 'Resend OTP'}
            </button>
          ) : (
            <p style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-tertiary)',
              fontWeight: '500'
            }}>
              Resend available in {countdown}s
            </p>
          )}
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          style={{
            width: '100%',
            marginTop: '20px',
            padding: '12px',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'var(--border)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'var(--bg-tertiary)';
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
