import { NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"
const API_KEY = process.env.API_KEY || ""

// GET /api/health → Check backend health
export async function GET() {
  try {
    if (!BACKEND_URL || !API_KEY) {
      return NextResponse.json(
        { status: "unhealthy", reason: "missing config" },
        { status: 503 }
      )
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    const response = await fetch(`${BACKEND_URL}/health`, {
      method: "GET",
      headers: { "x-api-key": API_KEY },
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return NextResponse.json(
        { status: "unhealthy" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { status: "unhealthy", reason: "backend unreachable" },
      { status: 503 }
    )
  }
}
