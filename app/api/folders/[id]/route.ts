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

// DELETE /api/folders/[id] → Delete a folder in backend
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!API_KEY) {
    return NextResponse.json({ error: "Server Configuration Error: API_KEY missing" }, { status: 500 })
  }

  try {
    const { id } = await params;
    const response = await fetch(`${BACKEND_URL}/api/folders/${id}`, {
      method: "DELETE",
      headers: getBackendHeaders(),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return new NextResponse(null, { status: 404 })
      }
      return NextResponse.json(
        { error: `Backend error: ${response.statusText}` },
        { status: response.status }
      )
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Proxy DELETE /api/folders/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete folder from backend" },
      { status: 502 }
    )
  }
}

// PUT /api/folders/[id] → Update folder in backend
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!API_KEY) {
    return NextResponse.json({ error: "Server Configuration Error: API_KEY missing" }, { status: 500 })
  }

  try {
    const { id } = await params;
    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/api/folders/${id}`, {
      method: "PUT",
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
    console.error("Proxy PUT /api/folders/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update folder in backend" },
      { status: 502 }
    )
  }
}
