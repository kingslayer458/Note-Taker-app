import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");
  
  const correctPassword = process.env.FRONTEND_PASSWORD || process.env.API_KEY;
  if (token && correctPassword && token.value === correctPassword) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}
