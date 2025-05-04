// API service for backend integration

// Base URL for all API requests - use relative URL for proxied endpoints
const BASE_URL = "https://multi-ai-assistant-production.up.railway.app"
const USE_PROXY = false // Set to false to bypass proxy and use direct API calls

// Function to handle API errors
const handleApiError = (error: any) => {
  console.error("API Error:", error)

  // If it's a fetch error or network error
  if (error instanceof Error) {
    return {
      error: true,
      message: error.message || "Network error occurred",
      status: 0,
    }
  }

  // Default error
  return {
    error: true,
    message: "An unknown error occurred",
    status: 0,
  }
}

// Retry function for API calls
const retryFetch = async (
  fetchFn: () => Promise<Response>,
  maxRetries = 3,
  delay = 1000,
  backoff = 2,
): Promise<Response> => {
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${maxRetries}...`)
      const response = await fetchFn()

      // If successful, return the response
      if (response.ok) {
        if (attempt > 1) {
          console.log(`Success after ${attempt} attempts`)
        }
        return response
      }

      // If we get a 4xx error (client error), don't retry
      if (response.status >= 400 && response.status < 500) {
        console.log(`Client error (${response.status}), not retrying`)
        return response
      }

      // For other errors, prepare to retry
      const errorText = await response.text().catch(() => "No error details available")
      lastError = new Error(`Server responded with ${response.status}: ${errorText}`)
      console.warn(`Attempt ${attempt} failed: ${lastError.message}`)
    } catch (error) {
      lastError = error
      console.warn(`Attempt ${attempt} failed with exception:`, error)
    }

    // Wait before retrying, with exponential backoff
    if (attempt < maxRetries) {
      const waitTime = delay * Math.pow(backoff, attempt - 1)
      console.log(`Waiting ${waitTime}ms before retry...`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError
}

// Ghana Chat API functions
export const ghanaChatApi = {
  sendMessage: async (message: string) => {
    try {
      console.log("Sending message to Ghana Chat API:", message)

      const response = await fetch(`${BASE_URL}/ghana/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      })

      console.log("Ghana Chat response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text().catch(() => "No error details available")
        console.error("Ghana Chat error response:", errorText)
        throw new Error(`Server responded with ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Ghana Chat response data:", data)

      return {
        response: data.message,
        source: data.source,
        isFactChecked: data.isFactChecked,
      }
    } catch (error) {
      console.error("Ghana Chat API error:", error)
      return handleApiError(error)
    }
  },

  // Simulate a response for testing or when the API is unavailable
  simulateResponse: async (message: string) => {
    console.log("Simulating Ghana Chat response for:", message)

    // Wait for a realistic delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Sample responses based on common questions
    if (message.toLowerCase().includes("proverb")) {
      return {
        response:
          'Here are some Ghanaian proverbs:\n\n1. "Knowledge is like a garden; if it is not cultivated, it cannot be harvested." - This means education and wisdom require effort and nurturing.\n\n2. "The ruin of a nation begins in the homes of its people." - This emphasizes that societal problems start at the individual level.\n\n3. "It is the calm and silent water that drowns a man." - This warns against underestimating quiet threats.',
        source: "Ghanaian Cultural Heritage",
        isFactChecked: true,
      }
    } else if (message.toLowerCase().includes("dey go on") || message.toLowerCase().includes("what's up")) {
      return {
        response:
          "Things dey happen o! In Ghana now, people are preparing for the upcoming elections, the Black Stars are training for their next match, and the cedi is trying to stabilize against the dollar. How about you, how you dey?",
        source: "Current Events in Ghana",
        isFactChecked: true,
      }
    } else if (
      message.toLowerCase().includes("place") ||
      message.toLowerCase().includes("visit") ||
      message.toLowerCase().includes("explore")
    ) {
      return {
        response:
          "Ghana has many beautiful places to explore! Here are some recommendations:\n\n1. Cape Coast Castle - A historic site with powerful history\n2. Kakum National Park - Famous for its canopy walkway\n3. Mole National Park - Ghana's largest wildlife sanctuary\n4. Wli Waterfalls - The highest waterfall in West Africa\n5. Labadi Beach - Popular beach in Accra\n6. Lake Volta - The largest artificial lake in the world by surface area",
        source: "Ghana Tourism Authority",
        isFactChecked: true,
      }
    } else if (
      message.toLowerCase().includes("food") ||
      message.toLowerCase().includes("dish") ||
      message.toLowerCase().includes("eat")
    ) {
      return {
        response:
          "Ghana has delicious traditional foods! Some popular dishes include:\n\n1. Jollof Rice - A spicy rice dish cooked with tomatoes and spices\n\n2. Waakye - Rice and beans with a special leaf that gives it color\n\n3. Banku and Tilapia - Fermented corn dough with grilled fish\n\n4. Fufu and Light Soup - Pounded cassava and plantain with spicy soup\n\n5. Kelewele - Spicy fried plantains",
        source: "Ghanaian Cuisine",
        isFactChecked: true,
      }
    } else {
      return {
        response:
          "Thank you for your question about Ghana. I'm currently in simulation mode and may not have the most up-to-date information. For the most accurate information, please check when the API connection is restored.",
        source: "Simulation",
        isFactChecked: false,
      }
    }
  },
}

// PDF Q&A API functions
// Update the PDF_QA_API_URL to use the same base URL as other services
// Updated PDF Q&A API functions
const PDF_QA_API_URL = `${BASE_URL}`

export const pdfQaApi = {
  uploadPdf: async (file: File) => {
    try {
      console.log(`Uploading PDF: ${file.name}, size: ${file.size} bytes`)

      const formData = new FormData()
      formData.append("files", file) // Keep "files" as the field name
      
      // Also try with "file" as an alternative field name (some servers expect this)
      formData.append("file", file)

      const url = `${PDF_QA_API_URL}/upload-qa`
      console.log(`Sending upload to: ${url}`)

      const response = await retryFetch(
        () =>
          fetch(url, {
            method: "POST",
            body: formData,
            // No Content-Type header for FormData, browser sets it automatically
          }),
        3, // max retries
      )

      console.log(`Upload response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text().catch(() => "No error details available")
        console.error(`Upload failed with status ${response.status}: ${errorText}`)
        return { error: true, message: `Server returned ${response.status}: ${errorText}` }
      }

      // Try to parse as JSON first
      let data: any = {}
      try {
        data = await response.json()
        console.log(`Upload successful, response:`, data)
      } catch (err) {
        // If JSON parsing fails, try text extraction
        console.error("Failed to parse JSON response:", err)
        const textContent = await response.text().catch(() => "")
        console.log("Raw response text:", textContent)
        
        // Attempt to extract session ID using more flexible regex patterns
        let extractedSessionId = null
        
        // Try several common patterns for session IDs
        const patterns = [
          /["']session_(?:id|token)["']\s*:\s*["']([^"']+)["']/i,
          /["']token["']\s*:\s*["']([^"']+)["']/i,
          /["']id["']\s*:\s*["']([^"']+)["']/i,
          /session[_-]?(?:id|token)['":\s]*([a-zA-Z0-9_\-\.]+)/i,
        ]
        
        for (const pattern of patterns) {
          const match = textContent.match(pattern)
          if (match && match[1]) {
            extractedSessionId = match[1]
            console.log(`Extracted session ID using pattern: ${extractedSessionId}`)
            break
          }
        }
        
        // If we found a session ID, return success
        if (extractedSessionId) {
          return {
            success: true,
            message: "PDF uploaded successfully (session ID extracted from text)",
            extractedSessionId,
          }
        }
        
        // If we couldn't extract a session ID, generate a fallback
        extractedSessionId = crypto.randomUUID ? 
          crypto.randomUUID() : 
          "fallback-" + Math.random().toString(36).substring(2, 15)
        
        console.warn("Could not parse response or extract session ID, using generated ID:", extractedSessionId)
        
        return {
          success: true,
          warning: "Could not parse server response, using generated session ID",
          extractedSessionId,
          rawResponse: textContent.substring(0, 500) // First 500 chars for debugging
        }
      }

      // Try to extract session ID from common locations in JSON responses
      let extractedSessionId = null
      
      // Check all possible locations where the session ID might be
      if (data.session_id) {
        extractedSessionId = data.session_id
      } else if (data.sessionId) {
        extractedSessionId = data.sessionId
      } else if (data.session_token) {
        extractedSessionId = data.session_token
      } else if (data.sessionToken) {
        extractedSessionId = data.sessionToken
      } else if (data.token) {
        extractedSessionId = data.token
      } else if (data.id) {
        extractedSessionId = data.id
      } else if (data.session_info) {
        // Try nested locations
        const sessionInfo = data.session_info
        extractedSessionId = sessionInfo.session_id || sessionInfo.sessionId || 
                             sessionInfo.session_token || sessionInfo.sessionToken || 
                             sessionInfo.token || sessionInfo.id
      }
      
      // If we found a session ID, add it to the response
      if (extractedSessionId) {
        console.log("Extracted session ID:", extractedSessionId)
        return { ...data, extractedSessionId }
      }
      
      // If we couldn't find a session ID, generate a fallback
      extractedSessionId = crypto.randomUUID ? 
        crypto.randomUUID() : 
        "fallback-" + Math.random().toString(36).substring(2, 15)
      
      console.warn("Could not extract session ID from response, using generated ID:", extractedSessionId)
      
      return { 
        ...data, 
        extractedSessionId,
        warning: "Could not find session ID in response, using generated ID" 
      }
    } catch (error) {
      console.error(`Upload error:`, error)
      return { error: true, message: error instanceof Error ? error.message : String(error) }
    }
  },

  askQuestion: async (question: string, sessionId: string) => {
    try {
      console.log(`Sending question to API: ${question}`)
      console.log(`Using session ID: ${sessionId}`)

      const url = `${PDF_QA_API_URL}/ask-qa`
      console.log(`Sending question to: ${url}`)

      // Try multiple request formats to increase compatibility
      let response = null
      let errorMessage = ""
      
      // Format 1: Try with x-www-form-urlencoded first
      try {
        const formData = new URLSearchParams()
        formData.append("question", question)
        formData.append("session_id", sessionId)
        // Try alternate field names too
        formData.append("sessionId", sessionId)
        formData.append("session_token", sessionId)

        console.log("Sending form data:", formData.toString())

        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        })

        console.log(`Form data response status: ${response.status}`)
        
        if (response.ok) {
          const data = await response.json()
          console.log("Form data request successful:", data)
          return data
        } else {
          errorMessage = `Form data request failed with status ${response.status}`
          console.log(errorMessage)
        }
      } catch (error) {
        console.error("Form data request failed:", error)
        errorMessage = `Form data request error: ${error instanceof Error ? error.message : String(error)}`
      }
      
      // Format 2: Try with JSON if form data failed
      try {
        console.log("Trying JSON format")
        
        // Try multiple field name conventions for the session ID
        const jsonBody = {
          question,
          session_id: sessionId,
          sessionId: sessionId,
          session_token: sessionId,
          sessionToken: sessionId,
          token: sessionId,
        }
        
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(jsonBody),
        })

        console.log(`JSON format response status: ${response.status}`)
        
        if (response.ok) {
          const data = await response.json()
          console.log("JSON request successful:", data)
          return data
        } else {
          const errorText = await response.text().catch(() => "No error details available")
          errorMessage = `JSON request failed with status ${response.status}: ${errorText}`
          console.error(errorMessage)
        }
      } catch (error) {
        console.error("JSON request failed:", error)
        errorMessage += `\nJSON request error: ${error instanceof Error ? error.message : String(error)}`
      }
      
      // Format 3: Try with multipart/form-data as last resort
      try {
        console.log("Trying multipart/form-data format")
        
        const multipartData = new FormData()
        multipartData.append("question", question)
        multipartData.append("session_id", sessionId)
        multipartData.append("sessionId", sessionId)
        multipartData.append("session_token", sessionId)
        
        response = await fetch(url, {
          method: "POST",
          body: multipartData,
          // Don't set Content-Type for multipart/form-data
        })

        console.log(`Multipart form data response status: ${response.status}`)
        
        if (response.ok) {
          const data = await response.json()
          console.log("Multipart request successful:", data)
          return data
        } else {
          const errorText = await response.text().catch(() => "No error details available")
          errorMessage += `\nMultipart request failed with status ${response.status}: ${errorText}`
          console.error(errorMessage)
        }
      } catch (error) {
        console.error("Multipart request failed:", error)
        errorMessage += `\nMultipart request error: ${error instanceof Error ? error.message : String(error)}`
      }

      // If all formats failed, return a comprehensive error
      return { 
        error: true, 
        message: `All request formats failed. ${errorMessage}`,
        has_documents: false,
      }
    } catch (error) {
      console.error(`Question error:`, error)
      return { error: true, message: error instanceof Error ? error.message : String(error) }
    }
  },
}

// Cover Letter Generator API
export const coverLetterApi = {
  generateCoverLetter: async (
    cvFile: File,
    applyingRole: string,
    companyName: string,
    tone = "professional",
    additionalInstructions = "",
  ) => {
    try {
      // Create multipart/form-data
      const formData = new FormData()
      formData.append("cv_file", cvFile)
      formData.append("applying_role", applyingRole)
      formData.append("company_name", companyName)

      // Only append optional fields if they have values
      if (tone) {
        formData.append("tone", tone)
      }

      if (additionalInstructions) {
        formData.append("additional_instructions", additionalInstructions)
      }

      console.log("Generating cover letter:", `${BASE_URL}/generate-cover-letter`)
      console.log(
        "FormData contents:",
        [...formData.entries()].map((entry) =>
          entry[0] === "cv_file" ? `${entry[0]}: [File: ${(entry[1] as File).name}]` : `${entry[0]}: ${entry[1]}`,
        ),
      )

      const response = await fetch(`${BASE_URL}/generate-cover-letter`, {
        method: "POST",
        body: formData,
      })

      console.log("Cover letter response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text().catch(() => "No error details available")
        console.error("Cover letter error response:", errorText)
        throw new Error(`Server responded with ${response.status}: ${errorText}`)
      }

      const data = await response.json().catch(() => {
        console.error("Failed to parse JSON response")
        throw new Error("Invalid response format from server")
      })

      console.log("Cover letter generated successfully, response:", data)
      return data
    } catch (error) {
      console.error("Cover letter generation failed:", error)
      return handleApiError(error)
    }
  },
}

// CV Analyzer API
export const cvAnalyzerApi = {
  analyzeCV: async (cvFile: File, topN = 5) => {
    try {
      // Create multipart/form-data
      const formData = new FormData()
      formData.append("file", cvFile)
      formData.append("top_n", topN.toString())

      console.log("Analyzing CV:", `${BASE_URL}/analyze-cv`)
      console.log(
        "FormData contents:",
        [...formData.entries()].map((entry) =>
          entry[0] === "file" ? `${entry[0]}: [File: ${(entry[1] as File).name}]` : `${entry[0]}: ${entry[1]}`,
        ),
      )

      const response = await fetch(`${BASE_URL}/analyze-cv`, {
        method: "POST",
        body: formData,
      })

      console.log("CV analysis response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text().catch(() => "No error details available")
        console.error("CV analysis error response:", errorText)
        throw new Error(`Server responded with ${response.status}: ${errorText}`)
      }

      const data = await response.json().catch(() => {
        console.error("Failed to parse JSON response")
        throw new Error("Invalid response format from server")
      })

      console.log("CV analysis successful, response:", data)
      return data
    } catch (error) {
      console.error("CV analysis failed:", error)
      return handleApiError(error)
    }
  },
}

// Export other API services as needed
export const api = {
  pdfQa: pdfQaApi,
  coverLetter: coverLetterApi,
  cvAnalyzer: cvAnalyzerApi,
  ghanaChat: ghanaChatApi,
  // Add other API services here
}
