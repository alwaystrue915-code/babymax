import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { validateApiKey, verifyAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    const isValidKey = await validateApiKey(req);
    const userPayload = await verifyAuth(req);

    if (!isValidKey && !userPayload) {
      return Response.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    
    return Response.json(
      { success: true, settings },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const adminPayload = await verifyAuth(req);
    if (!adminPayload || adminPayload.role !== 'admin') {
      return Response.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();
    
    const { 
      instagramLink, 
      telegramLink, 
      appName, 
      appDownloadLink, 
      appLogoUrl,
      appVersion,
      appSize,
      upiId, 
      upiName, 
      upiAmount,
      noticeText,
      showNotice
    } = await req.json();
    
    const updateData = {};
    if (instagramLink !== undefined) updateData.instagramLink = instagramLink;
    if (telegramLink !== undefined) updateData.telegramLink = telegramLink;
    if (appName !== undefined) updateData.appName = appName;
    if (appDownloadLink !== undefined) updateData.appDownloadLink = appDownloadLink;
    if (appLogoUrl !== undefined) updateData.appLogoUrl = appLogoUrl;
    if (appVersion !== undefined) updateData.appVersion = appVersion;
    if (appSize !== undefined) updateData.appSize = appSize;
    if (upiId !== undefined) updateData.upiId = upiId;
    if (upiName !== undefined) updateData.upiName = upiName;
    if (upiAmount !== undefined) updateData.upiAmount = upiAmount;
    if (noticeText !== undefined) updateData.noticeText = noticeText;
    if (showNotice !== undefined) updateData.showNotice = showNotice;
    
    
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    
    return Response.json(
      { success: true, message: 'Settings updated successfully', settings },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
