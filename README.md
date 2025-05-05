# Multi AI Assistant

<p align="center">
  <img src="/api/placeholder/200/200" alt="Multi AI Assistant Logo" />
</p>

## Your Smart Ghanaian AI Hub

Multi AI Assistant is a comprehensive platform that democratizes access to AI-powered tools and information about Ghana. We aim to bridge the technology gap by providing intuitive, accessible tools that leverage artificial intelligence to solve everyday problems for Ghanaians and those interested in Ghana.

**Live Demo:** [Visit the App](https://kzmgu6rhihxnassgfkoq.lite.vusercontent.net)

## 🚀 Features

- **Ghana Chat** - Ask questions about Ghana's history, culture, and more
- **CSV Explorer** - Upload CSV files for data analysis and visualization
- **Resume Analyzer** - Get feedback on your resume and job suggestions
- **PDF Q&A** - Upload PDF documents and ask questions about the content
- **Resume Builder** - Create and download professional resumes with customizable templates
- **Weather Updates** - Check weather forecasts for cities across Ghana
- **Ghana News** - Stay updated with the latest news from Ghana
- **Cover Letter Generator** - Generate tailored cover letters for job applications

## 💻 Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- TailwindCSS

### Backend
- FastAPI
- LangChain
- Groq
- NewsAPI
- Unstructured (for document processing)
- PyMuPDF
- Scikit-learn
- Sentence-transformers
- APScheduler
- BeautifulSoup4 (BS4)
- DuckDuckGo Search
- FAISS (for vector search)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or later)
- Python (v3.8 or later)
- npm or yarn
- pip

## 🔧 Installation

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/pryyyynz/multi-ai-assistant.git
cd multi-ai-assistant/backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload
```

### Frontend Setup

```bash
# Navigate to the frontend directory
cd ../frontend

# Install dependencies
npm install
# or
yarn install

# Run the development server
npm run dev
# or
yarn dev
```

### Project Structure

```
multi-ai-assistant/
├── backend/
│   ├── data/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   ├── styles/
│   ├── .dockerignore
│   ├── .gitignore
│   ├── Dockerfile
│   ├── LICENSE
│   ├── README.md
│   ├── next.config.mjs
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── yarn.lock
```

## 🔌 Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_database_url
NEWS_API_KEY=your_news_api_key
```

Create a `.env.local` file in the frontend directory:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Required API Keys

- [Groq API](https://console.groq.com/) - For AI models
- [NewsAPI](https://newsapi.org/) - For Ghana news updates
- [OpenAI API](https://platform.openai.com/) - Optional backup AI provider

## 📝 Usage Examples

### Ghana Chat
```
Q: "What are the main cultural festivals in Ghana?"
Q: "Tell me about Ghana's economy and major industries."
```

### CSV Explorer
Upload financial data, sales reports, or research data for instant analysis and visualization.

### Weather Updates
Check current weather conditions and forecasts for cities like Accra, Kumasi, Tamale, and more.

### PDF Q&A
Upload documents like research papers, reports, or books and ask specific questions about their content.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request with descriptions of your changes.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and structure
- Write tests for new features when applicable
- Update documentation for any changes
- Ensure all tests pass before submitting PRs
- Keep PRs focused on a single feature or bug fix

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🛣️ Roadmap

- Mobile app development
- Add more Ghana-specific AI tools
- Support for additional local languages
- Improved data visualization options
- API access for developers

## ⚠️ Troubleshooting

### Common Issues

- **API Key Issues**: Ensure all API keys are correctly set in your environment variables
- **Installation Problems**: Make sure you have compatible versions of Node.js and Python
- **CORS Errors**: If experiencing CORS issues during development, check that your backend is properly configured to accept requests from your frontend origin

## 📞 Contact

Prince Dugborye - dugboryeleprince@gmail.com

Project Link: [https://github.com/pryyyynz/multi-ai-assistant](https://github.com/pryyyynz/multi-ai-assistant)

---

<p align="center">Made with ❤️ in Ghana</p>
