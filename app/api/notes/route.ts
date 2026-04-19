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

// GET /api/notes → Fetch all notes from backend
export async function GET(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "Server Configuration Error: API_KEY missing" }, { status: 500 })
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/notes`, {
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
    console.error("Proxy GET /api/notes error:", error)
    return NextResponse.json(
      { error: "Failed to fetch notes from backend" },
      { status: 502 }
    )
  }
}

// POST /api/notes → Create a new note in backend
export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "Server Configuration Error: API_KEY missing" }, { status: 500 })
  }

  try {
    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/api/notes`, {
      method: "POST",
      headers: getBackendHeaders(true),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      // Forward the status code (e.g. 409 Conflict)
      const errorData = await response.json().catch(() => ({ error: response.statusText }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Proxy POST /api/notes error:", error)
    return NextResponse.json(
      { error: "Failed to create note in backend" },
      { status: 502 }
    )
  }
}
