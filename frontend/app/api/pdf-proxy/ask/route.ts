import { type NextRequest, NextResponse } from "next/server"

const PDF_QA_API_URL = "https://api.example.com/pdf-qa" // Replace with your actual PDF QA API URL

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming JSON
    const body = await request.json()
    const { question, session_id } = body

    // Validate required fields
    if (!question) {
      return NextResponse.json({ error: true, message: "Question is required" }, { status: 400 })
    }

    if (!session_id) {
      return NextResponse.json({ error: true, message: "Session ID is required" }, { status: 400 })
    }

    console.log("[SERVER] Proxying question:", question)
    console.log("[SERVER] Using session ID:", session_id)

    // Forward the request to the actual API
    const apiResponse = await fetch(`${PDF_QA_API_URL}/ask-qa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, session_id }),
    })

    console.log(`[SERVER] Backend question response status: ${apiResponse.status}`)

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text()
      console.error(`[SERVER] Backend question failed: ${errorText}`)
      return NextResponse.json(
        { error: true, message: `Backend API returned ${apiResponse.status}: ${errorText}` },
        { status: apiResponse.status },
      )
    }

    // Parse and return the response
    const responseData = await apiResponse.json()
    console.log("[SERVER] Backend question response data:", JSON.stringify(responseData, null, 2))

    // Check if we need to update the session ID format
    if (responseData.session_info && responseData.session_info.session_token && !responseData.session_id) {
      // Add session_id for backward compatibility if needed
      responseData.session_id = responseData.session_info.session_token
      console.log("[SERVER] Added session_id from session_token for compatibility")
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[SERVER] Error processing question:", error)
    return NextResponse.json(
      { error: true, message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
