import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { hashToken } from "@/lib/auth-utils";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");
  
  const correctPassword = process.env.FRONTEND_PASSWORD || process.env.API_KEY || "";
  const hashedCorrectPassword = await hashToken(correctPassword);
  
  if (token && hashedCorrectPassword && token.value === hashedCorrectPassword) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}
