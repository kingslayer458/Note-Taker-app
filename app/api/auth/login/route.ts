import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.FRONTEND_PASSWORD || process.env.API_KEY;

    if (password === correctPassword) {
      const cookieStore = await cookies();
      cookieStore.set("auth_token", password, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
  }
}
