import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { validateApiKey } from '@/lib/auth';
import { signToken } from '@/lib/jwt';

export async function POST(req) {
  try {
    const isValid = await validateApiKey(req);
    if (!isValid) {
      return Response.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();

    const { email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return Response.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }


    // Find user with password field (select: false by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    // Check if user exists
    if (!user) {
      return Response.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    
    if (!isPasswordCorrect) {
      return Response.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create token
    const token = await signToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    // Return user without password
    return Response.json(
      {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          paymentStatus: user.paymentStatus,
          utr: user.utr,
          activationKey: user.activationKey,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
