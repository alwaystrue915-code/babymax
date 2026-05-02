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

    const { fullName, email, provider } = await req.json();

    if (!email || provider !== 'google') {
      return Response.json(
        { success: false, message: 'Invalid Google login data' },
        { status: 400 }
      );
    }

    // Gmail validation (optional, but consistent with regular registration)
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return Response.json(
        { success: false, message: 'Only Gmail addresses are allowed' },
        { status: 400 }
      );
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Update last login
      user.lastLogin = new Date();
      // If user existed but via credentials, we could either link them or just update provider
      // For now, let's just update last login
      await user.save();
    } else {
      // Create new user for Google login
      user = await User.create({
        fullName: fullName || email.split('@')[0],
        email: email.toLowerCase(),
        provider: 'google',
        lastLogin: new Date(),
        role: 'user', // Default role
      });
    }

    // Create token
    const token = await signToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

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
          createdAt: user.createdAt,
          provider: user.provider,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Google login error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
