import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET all pending or all payment requests
export async function GET(req) {
  try {
    const adminPayload = await verifyAuth(req);
    if (!adminPayload || adminPayload.role !== 'admin') {
      return Response.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();
    // Find users who have submitted a UTR (status is not 'none')
    const requests = await User.find({ paymentStatus: { $ne: 'none' } }).sort({ updatedAt: -1 });
    return Response.json(
      { success: true, requests }, 
      { 
        status: 200,
        headers: { 'Cache-Control': 'no-store' }
      }
    );
  } catch (error) {
    console.error('Fetch requests error:', error);
    return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST to update payment status (Approve/Reject)
export async function POST(req) {
  try {
    const adminPayload = await verifyAuth(req);
    if (!adminPayload || adminPayload.role !== 'admin') {
      return Response.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();
    const { userId, status, rejectionReason, activationKey } = await req.json();

    if (!userId || !status) {
      return Response.json({ success: false, message: 'User ID and Status are required' }, { status: 400 });
    }

    const updateData = { 
      paymentStatus: status,
      hasSeenStatusUpdate: false
    };
    if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason || 'Invalid Transaction Details';
      updateData.activationKey = ''; // Clear if rejected
    } else if (status === 'approved') {
      updateData.rejectionReason = ''; // Clear if approved
      updateData.activationKey = activationKey || ''; // Save user-specific key
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return Response.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return Response.json({ success: true, message: `Payment ${status} successfully`, user }, { status: 200 });
  } catch (error) {
    console.error('Update request error:', error);
    return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
