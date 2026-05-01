import { validateApiKey } from '@/lib/auth';
import { signToken } from '@/lib/jwt';

export async function POST(req) {
  try {
    const isValid = await validateApiKey(req);
    if (!isValid) {
      return Response.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    // Hardcoded Admin Credentials
    const ADMIN_EMAIL = 'wingoxtool@mail.com';
    const ADMIN_PASS = 'wingoxtoolxmod';

    if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASS) {
      const adminData = {
        id: 'admin-hardcoded-id',
        fullName: 'Main Administrator',
        email: ADMIN_EMAIL,
        role: 'admin',
      };
      
      const token = await signToken(adminData);

      return Response.json({
        success: true,
        message: 'Admin login successful',
        user: adminData,
        token
      }, { status: 200 });
    }

    return Response.json({ success: false, message: 'Invalid Admin Credentials' }, { status: 401 });

  } catch (error) {
    console.error('Admin login error:', error);
    return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
