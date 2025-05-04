import { type NextRequest, NextResponse } from "next/server"

const PDF_QA_API_URL = "https://api.example.com/pdf-qa" // Replace with your actual PDF QA API URL

export async function POST(request: NextRequest) {
  console.log("[SERVER] Received PDF upload request")

  try {
    // Get the actual form data
    const formData = await request.formData()

    // Check if files exists in the form data
    const files = formData.getAll("files")
    if (!files || files.length === 0) {
      console.error("[SERVER] No files found in upload request")
      return NextResponse.json({ error: true, message: "No files found in request" }, { status: 400 })
    }

    const file = files[0]
    console.log(`[SERVER] Processing file: ${file.name}, size: ${file instanceof File ? file.size : "unknown"} bytes`)

    // Create a new FormData for the forwarded request
    const forwardFormData = new FormData()

    // Make sure to use the same field name as expected by the server
    forwardFormData.append("files", file)

    // Forward the request to the actual API
    console.log(`[SERVER] Forwarding upload to: ${PDF_QA_API_URL}/upload-qa`)
    const apiResponse = await fetch(`${PDF_QA_API_URL}/upload-qa`, {
      method: "POST",
      body: forwardFormData,
    })

    console.log(`[SERVER] Backend upload response status: ${apiResponse.status}`)

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text()
      console.error(`[SERVER] Backend upload failed: ${errorText}`)
      return NextResponse.json(
        { error: true, message: `Backend API returned ${apiResponse.status}: ${errorText}` },
        { status: apiResponse.status },
      )
    }

    // Parse and return the response
    const responseData = await apiResponse.json()
    console.log(`[SERVER] Backend upload response:`, JSON.stringify(responseData, null, 2))

    // Extract and verify session ID
    let extractedSessionId = null
    if (responseData.session_id) {
      extractedSessionId = responseData.session_id
      console.log(`[SERVER] Found session_id directly: ${extractedSessionId}`)
    } else if (responseData.session_info && responseData.session_info.session_id) {
      extractedSessionId = responseData.session_info.session_id
      console.log(`[SERVER] Found session_id in session_info: ${extractedSessionId}`)
    } else if (responseData.session_info && responseData.session_info.session_token) {
      extractedSessionId = responseData.session_info.session_token
      console.log(`[SERVER] Found session_token in session_info: ${extractedSessionId}`)
    }

    // Return the response with extracted session ID
    return NextResponse.json({
      ...responseData,
      extractedSessionId,
    })
  } catch (error) {
    console.error("[SERVER] Error processing PDF upload:", error)
    return NextResponse.json(
      { error: true, message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
