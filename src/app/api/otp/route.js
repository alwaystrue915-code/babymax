// Server-side OTP handler with rate limiting and API key security
import { validateApiKey } from '@/lib/auth';

const OTP_API_URL = process.env.OTP_API_URL || 'https://app.nexapk.in/mail/api.php';
const OTP_API_KEY = process.env.OTP_API_KEY;

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map();

// Rate limit configuration
const RATE_LIMIT = {
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxAttempts: 5,           // 5 attempts per window
};

/**
 * Check rate limit for an email
 */
function checkRateLimit(email) {
  const now = Date.now();
  const key = `otp_${email}`;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, startTime: now });
    return { allowed: true, remaining: RATE_LIMIT.maxAttempts - 1 };
  }
  
  const record = rateLimitStore.get(key);
  
  // Reset if window expired
  if (now - record.startTime > RATE_LIMIT.windowMs) {
    rateLimitStore.set(key, { count: 1, startTime: now });
    return { allowed: true, remaining: RATE_LIMIT.maxAttempts - 1 };
  }
  
  // Check if limit exceeded
  if (record.count >= RATE_LIMIT.maxAttempts) {
    const timeLeft = Math.ceil((RATE_LIMIT.windowMs - (now - record.startTime)) / 1000);
    return { 
      allowed: false, 
      remaining: 0,
      retryAfter: timeLeft 
    };
  }
  
  // Increment count
  record.count++;
  return { 
    allowed: true, 
    remaining: RATE_LIMIT.maxAttempts - record.count 
  };
}

/**
 * Send OTP with rate limiting and API key
 */
export async function POST(req) {
  try {
    const isValid = await validateApiKey(req);
    if (!isValid) {
      return Response.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
    }

    const { email } = await req.json();
    
    if (!email) {
      return Response.json(
        { status: 'error', message: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Check rate limit
    const rateLimit = checkRateLimit(email);
    
    if (!rateLimit.allowed) {
      return Response.json(
        { 
          status: 'error', 
          message: `Too many attempts. Please try again in ${rateLimit.retryAfter} seconds`,
          retryAfter: rateLimit.retryAfter
        },
        { status: 429 }
      );
    }
    
    // Call OTP API with API key
    const apiUrl = `${OTP_API_URL}?action=send_otp&email=${encodeURIComponent(email)}&api_key=${encodeURIComponent(OTP_API_KEY)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': OTP_API_KEY,
      },
    });
    
    const data = await response.json();
    
    return Response.json({
      ...data,
      remaining: rateLimit.remaining
    });
    
  } catch (error) {
    console.error('Send OTP error:', error);
    return Response.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

