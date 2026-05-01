// POST /api/otp/verify — Verify OTP
import { validateApiKey } from '@/lib/auth';

const OTP_API_URL = process.env.OTP_API_URL || 'https://app.nexapk.in/mail/api.php';
const OTP_API_KEY = process.env.OTP_API_KEY;

export async function POST(req) {
  try {
    const isValid = await validateApiKey(req);
    if (!isValid) {
      return Response.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
    }

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return Response.json(
        { status: 'error', message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const apiUrl = `${OTP_API_URL}?action=verify_otp&email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&api_key=${encodeURIComponent(OTP_API_KEY)}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'X-API-Key': OTP_API_KEY },
    });

    const data = await response.json();
    return Response.json(data);

  } catch (error) {
    console.error('Verify OTP error:', error);
    return Response.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
