"use client"

import type React from "react"

import { useState } from "react"
import NavBar from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Newspaper,
  CloudRain,
  FileText,
  MessageSquare,
  FileSpreadsheet,
  FileQuestion,
  Code,
  Briefcase,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { sendFeedbackEmail } from "./actions"

export default function AboutPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Feedback",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await sendFeedbackEmail(formData)

      if (result.success) {
        toast({
          title: "Feedback Sent",
          description: result.message,
        })

        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "Feedback",
          message: "",
        })
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      console.error("Email sending error:", error)

      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send feedback. Please try again.",
      })

      // Fallback to mailto link if EmailJS fails
      try {
        const subject = encodeURIComponent(formData.subject)
        const body = encodeURIComponent(
          `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`,
        )
        window.location.href = `mailto:dugboryeleprince@gmail.com?subject=${subject}&body=${body}`
      } catch (mailtoError) {
        console.error("Mailto fallback error:", mailtoError)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NavBar />

      <div className="max-w-4xl mx-auto mt-8">
        <h1 className="text-4xl font-bold mb-6">About Multi AI Assistant</h1>

        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-xl text-gray-700 mb-8">
            Multi AI Assistant is your comprehensive Ghanaian AI Hub, designed to provide valuable information and tools
            tailored to the Ghanaian context. Our platform combines multiple AI capabilities to offer a suite of
            services that address everyday needs and challenges.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="mb-8">
            Our mission is to democratize access to AI-powered tools and information about Ghana. We aim to bridge the
            technology gap by providing intuitive, accessible tools that leverage artificial intelligence to solve
            everyday problems for Ghanaians and those interested in Ghana.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Our Tools</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Ghana Chat</CardTitle>
                <CardDescription>AI-powered conversations about Ghana</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p>
                Ask questions about Ghana's history, culture, economy, politics, and more. Our AI assistant is trained
                on a wide range of Ghana-specific information to provide accurate and helpful responses.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <FileQuestion className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>PDF Q&A</CardTitle>
                <CardDescription>Extract insights from documents</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p>
                Upload PDF documents and ask specific questions about their content. Our AI will analyze the document
                and provide accurate answers, saving you time from having to read through lengthy documents.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Resume Analyzer</CardTitle>
                <CardDescription>Optimize your job applications</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p>
                Get professional feedback on your resume and personalized job suggestions based on your skills and
                experience. Our AI analyzes your resume against industry standards and provides actionable
                recommendations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Cover Letter Generator</CardTitle>
                <CardDescription>Create tailored cover letters</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p>
                Generate professional cover letters tailored to specific job descriptions and your unique
                qualifications. Save time while creating personalized applications that highlight your relevant skills
                and experiences.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Data Explorer</CardTitle>
                <CardDescription>Analyze and visualize data</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p>
                Upload CSV files for instant data analysis and visualization. Get insights from your data through
                interactive charts and summaries, making it easier to understand complex information without specialized
                knowledge.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <CloudRain className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Weather Updates</CardTitle>
                <CardDescription>Real-time weather information</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p>
                Check current weather conditions and forecasts for cities across Ghana. Get accurate, up-to-date
                information to plan your day or week, including temperature, precipitation, and other important weather
                metrics.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Newspaper className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>News</CardTitle>
                <CardDescription>Stay informed with latest updates</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p>
                Access the latest news from Ghana and technology sectors. Stay informed about current events, breaking
                news, and important developments with our curated news feeds from reliable sources.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Code className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Future Tools</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p>
                We're constantly developing new AI-powered tools to meet the needs of our users. Stay tuned for upcoming
                features including language translation, educational resources, and more Ghana-specific services.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
          <p className="mb-4">
            We envision a future where AI technology is accessible to everyone in Ghana, helping to solve everyday
            problems, improve education, enhance business operations, and contribute to the overall development of the
            country. Multi AI Assistant is just the beginning of our journey to make this vision a reality.
          </p>
          <p>
            As we grow, we plan to expand our offerings to include more specialized tools for different sectors,
            including education, healthcare, agriculture, and business, all tailored to the unique needs and context of
            Ghana.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Feedback & Support</h2>
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Your Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="Feedback">Feedback</option>
                    <option value="Complaint">Complaint</option>
                    <option value="Suggestion">Suggestion</option>
                    <option value="Question">Question</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Your Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please share your thoughts, suggestions, or report any issues you've encountered..."
                    rows={5}
                    required
                  />
                </div>
                <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" /> Send Feedback
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            We value your feedback and suggestions. If you have any questions, ideas for new features, or encounter any
            issues while using our platform, please don't hesitate to reach out to us.
          </p>
          <p>
            Email:{" "}
            <a href="mailto:dugboryeleprince@gmail.com" className="text-primary hover:underline">
              dugboryeleprince@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
