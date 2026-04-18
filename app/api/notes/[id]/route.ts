import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const API_KEY = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || ""

function getBackendHeaders(includeContentType = false): Record<string, string> {
  const headers: Record<string, string> = {
    "x-api-key": API_KEY,
  }
  if (includeContentType) {
    headers["Content-Type"] = "application/json"
  }
  return headers
}

// PUT /api/notes/[id] → Update a note
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/api/notes/${id}`, {
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
    console.error("Proxy PUT /api/notes/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update note in backend" },
      { status: 502 }
    )
  }
}

// DELETE /api/notes/[id] → Delete a note
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const response = await fetch(`${BACKEND_URL}/api/notes/${id}`, {
      method: "DELETE",
      headers: getBackendHeaders(),
    })

    if (!response.ok && response.status !== 404) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }))
      return NextResponse.json(errorData, { status: response.status })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Proxy DELETE /api/notes/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete note from backend" },
      { status: 502 }
    )
  }
}
