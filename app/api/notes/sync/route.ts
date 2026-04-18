import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"
const API_KEY = process.env.API_KEY || ""

function getBackendHeaders(includeContentType = false): Record<string, string> {
  const headers: Record<string, string> = {
    "x-api-key": API_KEY,
  }
  if (includeContentType) {
    headers["Content-Type"] = "application/json"
  }
  return headers
}

// POST /api/notes/sync → Sync notes to backend
export async function POST(request: NextRequest) {
  if (!API_KEY || request.headers.get("x-api-key") !== API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/api/notes/sync`, {
      method: "POST",
      headers: getBackendHeaders(true),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Proxy POST /api/notes/sync error:", error)
    return NextResponse.json(
      { error: "Failed to sync notes to backend" },
      { status: 502 }
    )
  }
}
