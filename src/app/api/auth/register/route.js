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

    const { fullName, email, password, confirmPassword } = await req.json();

    // Validation
    if (!fullName || !email || !password) {
      return Response.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Gmail validation
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return Response.json(
        { success: false, message: 'Only Gmail addresses are allowed' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return Response.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { success: false, message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return Response.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user (password will be hashed by model pre-save hook)
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
    });

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
        message: 'Account created successfully',
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.code === 11000) {
      return Response.json(
        { success: false, message: 'Email already exists' },
        { status: 409 }
      );
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return Response.json(
        { success: false, message: error.message || 'Validation failed' },
        { status: 400 }
      );
    }

    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
