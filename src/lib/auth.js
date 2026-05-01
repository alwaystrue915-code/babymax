import dbConnect from './mongodb';
import Settings from '@/models/Settings';
import { verifyToken } from './jwt';

export async function validateApiKey(req) {
  try {
    await dbConnect();
    const apiKey = req.headers.get('x-api-key');
    
    // Fetch settings to get the valid key
    const settings = await Settings.findOne({});
    const validKey = settings?.apiSecretKey || 'sailent_secure_v1_key';

    if (!apiKey || apiKey !== validKey) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('API Key validation error:', error);
    return false;
  }
}

export async function verifyAuth(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}
