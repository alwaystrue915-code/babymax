'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const user = searchParams.get('user');

    if (token && user) {
      try {
        localStorage.setItem('token', token);
        localStorage.setItem('user', decodeURIComponent(user));
        router.push('/dashboard');
      } catch (error) {
        console.error('Failed to save auth info:', error);
        router.push('/login?error=StorageError');
      }
    } else {
      router.push('/login?error=InvalidAuthData');
    }
  }, [router, searchParams]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8faff' }}>
      <p style={{ color: '#000', fontSize: '1.2rem' }}>Completing login...</p>
    </div>
  );
}
