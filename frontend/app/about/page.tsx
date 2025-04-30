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
} from "lucide-react"

export default function AboutPage() {
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

        <div className="bg-gray-50 p-6 rounded-lg mb-12">
          <h2 className="text-2xl font-semibold mb-4">Technology Stack</h2>
          <p className="mb-4">
            Multi AI Assistant is built using cutting-edge technologies to ensure reliability, speed, and security:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Next.js for server-side rendering and optimal performance</li>
            <li>React for building interactive user interfaces</li>
            <li>Tailwind CSS for responsive and customizable styling</li>
            <li>AI models fine-tuned for Ghana-specific knowledge</li>
            <li>RESTful APIs for weather, news, and other data sources</li>
            <li>Secure authentication and data handling practices</li>
          </ul>
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

        <div>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            We value your feedback and suggestions. If you have any questions, ideas for new features, or encounter any
            issues while using our platform, please don't hesitate to reach out to us.
          </p>
          <p>
            Email:{" "}
            <a href="mailto:contact@multiai-ghana.com" className="text-primary hover:underline">
              contact@multiai-ghana.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
