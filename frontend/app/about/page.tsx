import NavBar from "@/components/nav-bar"

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NavBar />

      <div className="max-w-3xl mx-auto mt-8">
        <h1 className="text-4xl font-bold mb-6">About Multi AI Assistant</h1>

        <div className="prose prose-lg max-w-none">
          <p>
            Multi AI Assistant is your smart Ghanaian AI Hub, designed to provide valuable information and tools related
            to Ghana. Our platform combines multiple AI capabilities to offer a comprehensive suite of services tailored
            to the Ghanaian context.
          </p>

          <h2>Our Mission</h2>
          <p>
            Our mission is to make information about Ghana more accessible and to provide useful tools that leverage
            artificial intelligence to solve everyday problems for Ghanaians and those interested in Ghana.
          </p>

          <h2>Our Tools</h2>
          <ul>
            <li>
              <strong>Ghana Chat</strong> - Ask questions about Ghana's history, culture, and more
            </li>
            <li>
              <strong>PDF Q&A</strong> - Upload PDFs and ask questions about their content
            </li>
            <li>
              <strong>Resume Analyzer</strong> - Get feedback on your resume and job suggestions
            </li>
            <li>
              <strong>CSV Explorer</strong> - Upload CSV files for data analysis and visualization
            </li>
            <li>
              <strong>Weather Updates</strong> - Check weather forecasts for cities across Ghana
            </li>
            <li>
              <strong>News</strong> - Stay updated with the latest news from Ghana
            </li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            If you have any questions, feedback, or suggestions, please don't hesitate to reach out to us at
            contact@multiai-ghana.com.
          </p>
        </div>
      </div>
    </div>
  )
}
