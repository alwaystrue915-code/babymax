import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

const RATE_LIMIT_MINUTES = 5; // Cooldown between UTR submissions

export async function POST(req) {
  try {
    const userPayload = await verifyAuth(req);
    if (!userPayload) {
      return Response.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();
    const { utr } = await req.json();
    const email = userPayload.email;

    if (!utr || !utr.trim() || utr.trim().length < 12) {
      return Response.json({ success: false, message: 'Valid 12-digit UTR is required' }, { status: 400 });
    }

    const cleanUtr = utr.trim();

    // Find user first to run checks before update
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (!existingUser) {
      return Response.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Block if already approved
    if (existingUser.paymentStatus === 'approved') {
      return Response.json(
        { success: false, message: 'Your payment is already approved. No need to resubmit.' },
        { status: 400 }
      );
    }

    // Block if already pending (wait for admin to process) - Rate Limit "Bar Bar Submit"
    if (existingUser.paymentStatus === 'pending') {
      return Response.json(
        { success: false, message: 'Your request is already pending. Please wait for admin review.' },
        { status: 429 }
      );
    }

    // Rate limit: prevent rapid resubmissions after rejection
    if (existingUser.utrLastSubmitAt) {
      const minutesSinceLast = (Date.now() - new Date(existingUser.utrLastSubmitAt).getTime()) / 60000;
      if (minutesSinceLast < RATE_LIMIT_MINUTES) {
        const waitMins = Math.ceil(RATE_LIMIT_MINUTES - minutesSinceLast);
        return Response.json(
          { success: false, message: `Please wait ${waitMins} minute(s) before submitting again.` },
          { status: 429 }
        );
      }
    }

    // All checks passed — update the user
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        $set: {
          utr: cleanUtr,
          paymentStatus: 'pending',
          rejectionReason: '',
          hasSeenStatusUpdate: false,
          utrLastSubmitAt: new Date(),
        }
      },
      { new: true, runValidators: true }
    );

    // Trigger Admin Email Notification (fire & forget)
    // Using fallback API key from db_config.php if env is missing
    const OTP_API_URL = process.env.OTP_API_URL || 'https://app.nexapk.in/mail/api.php';
    const OTP_API_KEY = process.env.OTP_API_KEY || 'silent_store_by_enzosrs';

    const notifyUrl = `${OTP_API_URL}?action=send_admin_notification&email=${encodeURIComponent(email)}&utr=${encodeURIComponent(cleanUtr)}&api_key=${encodeURIComponent(OTP_API_KEY)}`;
    
    fetch(notifyUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': OTP_API_KEY
      },
    }).catch(err => console.error('Admin notification error:', err));

    const userObj = user.toObject();

    return Response.json({
      success: true,
      message: 'Payment request submitted successfully',
      user: {
        ...userObj,
        utr: user.utr,
        paymentStatus: user.paymentStatus,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Payment submission error:', error);
    return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
