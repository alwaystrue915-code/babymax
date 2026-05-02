import { OAuth2Client } from 'google-auth-library';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=GoogleLoginFailed', req.url));
    }

    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`
    );

    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get user info
    const oauth2 = client.request({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    });
    const userInfoResponse = await oauth2;
    const { email, name: fullName } = userInfoResponse.data;

    if (!email) {
      return NextResponse.redirect(new URL('/login?error=GoogleLoginFailed', req.url));
    }

    // Gmail validation
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return NextResponse.redirect(new URL('/login?error=OnlyGmailAllowed', req.url));
    }

    await dbConnect();

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      user.lastLogin = new Date();
      await user.save();
    } else {
      user = await User.create({
        fullName: fullName || email.split('@')[0],
        email: email.toLowerCase(),
        provider: 'google',
        lastLogin: new Date(),
        role: 'user',
      });
    }

    // Create token
    const token = await signToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    // Pass token and user info back to the client securely
    const userData = encodeURIComponent(JSON.stringify({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      provider: user.provider,
    }));

    // Redirect to a frontend handler to store in localStorage
    return NextResponse.redirect(new URL(`/auth/success?token=${token}&user=${userData}`, req.url));
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=GoogleLoginFailed', req.url));
  }
}
