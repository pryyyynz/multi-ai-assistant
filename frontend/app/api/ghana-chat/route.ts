import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    console.log(`Sending message to Ghana Chat API: ${message}`)

    const response = await fetch("https://multi-ai-assistant-production.up.railway.app/ghana/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    })

    console.log(`Ghana Chat response status: ${response.status}`)

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Ghana Chat response data:`, data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in Ghana Chat API:", error)
    return NextResponse.json(
      {
        error: "Failed to process request",
        answer: "Sorry, I encountered an error while processing your request. Please try again later.",
      },
      { status: 500 },
    )
  }
}
