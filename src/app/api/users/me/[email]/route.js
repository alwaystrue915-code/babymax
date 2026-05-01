import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { validateApiKey } from '@/lib/auth';

// GET /api/users/me/[email]
export async function GET(req, { params }) {
  try {
    const isValid = await validateApiKey(req);
    if (!isValid) {
      return Response.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();
    const email = decodeURIComponent(params.email);

    if (!email) {
      return Response.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return Response.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return Response.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error('Fetch user error:', error);
    return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
