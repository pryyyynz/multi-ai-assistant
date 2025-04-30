"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import NavBar from "@/components/nav-bar"
import { FileText, Download, Copy, Check, Upload, File, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@/lib/api"

export default function CoverLetterGeneratorPage() {
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    additionalInfo: "",
    tone: "professional",
  })

  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [fileError, setFileError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [coverLetter, setCoverLetter] = useState("")
  const [extractedInfo, setExtractedInfo] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("form")
  const [copied, setCopied] = useState(false)
  const [apiError, setApiError] = useState<string>("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file type
      const fileType = selectedFile.type
      const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase()

      if (
        fileType === "application/pdf" ||
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileExtension === "pdf" ||
        fileExtension === "docx"
      ) {
        setFile(selectedFile)
        setFileName(selectedFile.name)
        setFileError("")
      } else {
        setFile(null)
        setFileName("")
        setFileError("Please upload a PDF or DOCX file")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError("")

    if (!file) {
      setFileError("Please upload your CV/resume")
      return
    }

    if (!formData.jobTitle.trim()) {
      return
    }

    if (!formData.company.trim()) {
      return
    }

    setIsGenerating(true)

    try {
      const result = await api.coverLetter.generateCoverLetter(
        file,
        formData.jobTitle,
        formData.company,
        formData.tone,
        formData.additionalInfo,
      )

      if (result.error) {
        setApiError(result.message || "Failed to generate cover letter. Please try again.")
        setIsGenerating(false)
        return
      }

      // Handle successful response
      if (result.cover_letter || result.text) {
        setCoverLetter(result.cover_letter || result.text)

        if (result.extracted_info) {
          setExtractedInfo(result.extracted_info)
        }

        setActiveTab("preview")
      } else {
        setApiError("Received an invalid response from the server. Please try again.")
      }
    } catch (error) {
      console.error("Error generating cover letter:", error)
      setApiError("An error occurred while generating your cover letter. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const element = document.createElement("a")
    const file = new Blob([coverLetter], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `Cover_Letter_${formData.company.replace(/\s+/g, "_")}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NavBar />

      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-8">
          <div className="flex items-center mb-8">
            <FileText className="h-12 w-12 mr-4 text-blue-600" />
            <h1 className="text-3xl font-bold">Cover Letter Generator</h1>
          </div>

          {apiError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="form" className="text-lg py-3">
                Input Details
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-lg py-3" disabled={!coverLetter}>
                Preview Cover Letter
              </TabsTrigger>
            </TabsList>

            <TabsContent value="form">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Upload Your CV/Resume</h2>

                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors ${
                      fileError ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    onClick={triggerFileInput}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                    />

                    {fileName ? (
                      <div className="flex flex-col items-center">
                        <File className="h-12 w-12 text-blue-500 mb-4" />
                        <p className="text-lg font-medium text-blue-600">{fileName}</p>
                        <p className="text-sm text-gray-500 mt-1">Click to change file</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium">Click to upload your CV/Resume</p>
                        <p className="text-sm text-gray-500 mt-1">PDF or DOCX files accepted</p>
                      </div>
                    )}
                  </div>

                  {fileError && (
                    <Alert variant="destructive">
                      <AlertDescription>{fileError}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Job Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Role Applying To</Label>
                      <Input
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        placeholder="Software Developer"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Applying To</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="ABC Tech"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Input
                    id="tone"
                    name="tone"
                    value={formData.tone}
                    onChange={handleInputChange}
                    placeholder="professional"
                  />
                  <p className="text-sm text-gray-500">Default: professional</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">
                    Additional Instructions (Skills, achievements, or specific points you want to highlight)
                  </Label>
                  <Textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    placeholder="I'd like to highlight my project management skills and experience with AI technologies..."
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Cover Letter...
                    </>
                  ) : (
                    "Generate Cover Letter"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="preview">
              {coverLetter && (
                <div className="space-y-6">
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleCopyToClipboard}>
                      {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    <Button variant="outline" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <div className="border rounded-md p-6 bg-white min-h-[500px] whitespace-pre-line">{coverLetter}</div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("form")}>
                      Back to Edit
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Cover Letter
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
