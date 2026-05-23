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

// GET /api/folders → Fetch all folders from backend
export async function GET(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "Server Configuration Error: API_KEY missing" }, { status: 500 })
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/folders`, {
      method: "GET",
      headers: getBackendHeaders(),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend error: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Proxy GET /api/folders error:", error)
    return NextResponse.json(
      { error: "Failed to fetch folders from backend" },
      { status: 502 }
    )
  }
}

// POST /api/folders → Create a new folder in backend
export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "Server Configuration Error: API_KEY missing" }, { status: 500 })
  }

  try {
    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/api/folders`, {
      method: "POST",
      headers: getBackendHeaders(true),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Proxy POST /api/folders error:", error)
    return NextResponse.json(
      { error: "Failed to create folder in backend" },
      { status: 502 }
    )
  }
}
