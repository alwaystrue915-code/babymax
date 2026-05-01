import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

export async function POST(req) {
  try {
    const userPayload = await verifyAuth(req);
    if (!userPayload) {
      return Response.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();
    const { utr } = await req.json();
    const email = userPayload.email;

    if (!utr) {
      return Response.json({ success: false, message: 'UTR is required' }, { status: 400 });
    }

    // Find and update the user
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        $set: { 
          utr: utr, 
          paymentStatus: 'pending',
          rejectionReason: '',
          hasSeenStatusUpdate: false
        } 
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return Response.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Return the user object, ensuring the new fields are included in the response
    const userObj = user.toObject();

    // Trigger Admin Notification (Background)
    const OTP_API_URL = process.env.OTP_API_URL || 'https://app.nexapk.in/mail/api.php';
    const OTP_API_KEY = process.env.OTP_API_KEY;
    
    if (OTP_API_KEY) {
      const notifyUrl = `${OTP_API_URL}?action=send_admin_notification&email=${encodeURIComponent(email)}&utr=${encodeURIComponent(utr)}&api_key=${encodeURIComponent(OTP_API_KEY)}`;
      fetch(notifyUrl, {
        method: 'GET',
        headers: {
          'X-API-Key': OTP_API_KEY,
        },
      }).catch(err => console.error('Admin notification error:', err));
    }
    
    return Response.json({ 
      success: true, 
      message: 'Payment request submitted successfully', 
      user: {
        ...userObj,
        utr: user.utr,
        paymentStatus: user.paymentStatus
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Payment submission error:', error);
    return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
