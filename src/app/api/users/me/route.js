import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/users/me — fetch current user via JWT
export async function GET(req) {
  try {
    const userPayload = await verifyAuth(req);
    if (!userPayload) {
      return Response.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: userPayload.email.toLowerCase() });

    if (!user) {
      return Response.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return Response.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error('Fetch user GET error:', error);
    return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users/me — same as GET (for backward compatibility)
export async function POST(req) {
  try {
    const userPayload = await verifyAuth(req);
    if (!userPayload) {
      return Response.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: userPayload.email.toLowerCase() });

    if (!user) {
      return Response.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return Response.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error('Fetch user POST error:', error);
    return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/users/me — acknowledge status update
export async function PATCH(req) {
  try {
    const userPayload = await verifyAuth(req);
    if (!userPayload) {
      return Response.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();
    const email = userPayload.email;

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { hasSeenStatusUpdate: true } },
      { new: true }
    );

    if (!user) {
      return Response.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'Status acknowledged' }, { status: 200 });
  } catch (error) {
    console.error('Update seen status error:', error);
    return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
