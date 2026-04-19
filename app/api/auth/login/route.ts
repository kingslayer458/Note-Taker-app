import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hashToken } from "@/lib/auth-utils";

// In-memory rate limiter
const failedAttempts = new Map<string, { count: number, resetAt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Check
    const ip = request.headers.get("x-forwarded-for") || "unknown_ip";
    const now = Date.now();
    const attemptInfo = failedAttempts.get(ip);

    if (attemptInfo && attemptInfo.count >= MAX_ATTEMPTS) {
      if (now < attemptInfo.resetAt) {
        const minutesLeft = Math.ceil((attemptInfo.resetAt - now) / 60000);
        return NextResponse.json(
          { success: false, error: `Too many failed attempts. Try again in ${minutesLeft} minutes.` },
          { status: 429 }
        );
      } else {
        // Lockout expired, reset attempts
        failedAttempts.delete(ip);
      }
    }

    // 2. Authentication Check
    const { password } = await request.json();
    const correctPassword = process.env.FRONTEND_PASSWORD || process.env.API_KEY || "";

    if (password === correctPassword) {
      // Success! Reset failed attempts for this IP
      failedAttempts.delete(ip);

      // 3. Hash the password before storing it in the cookie
      const hashedPassword = await hashToken(password);
      
      const cookieStore = await cookies();
      cookieStore.set("auth_token", hashedPassword, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      return NextResponse.json({ success: true });
    }

    // 4. Record Failed Attempt
    const currentCount = attemptInfo ? attemptInfo.count : 0;
    failedAttempts.set(ip, {
      count: currentCount + 1,
      resetAt: now + LOCKOUT_MS
    });

    return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
  }
}
