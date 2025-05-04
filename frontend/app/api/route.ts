import { NextResponse } from "next/server"

// Simple API route to test if the API is working
export async function GET() {
  return NextResponse.json({ status: "ok", message: "API is working" })
}
