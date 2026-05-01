import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const adminPayload = await verifyAuth(req);
    if (!adminPayload || adminPayload.role !== 'admin') {
      return Response.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();
    // Fetch all users, sorted by creation date descending
    const users = await User.find({}).sort({ createdAt: -1 });
    
    return Response.json(
      { success: true, users },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
