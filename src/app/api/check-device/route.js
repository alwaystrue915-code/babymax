import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  const headersList = headers();
  const userAgent = headersList.get("user-agent") || "";
  
  // Basic mobile detection regex
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);
  
  return NextResponse.json({
    success: true,
    isMobile,
    userAgent,
    message: isMobile 
      ? "Access granted: Mobile device detected." 
      : "Access denied: Desktop device detected."
  });
}
