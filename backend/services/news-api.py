import os
from dotenv import load_dotenv
from newsapi import NewsApiClient
from datetime import datetime, timedelta

# Load environment variables from .env file
load_dotenv()

# Get API key from environment variables
api_key = os.environ.get('NEWS_API_KEY')

# Initialize News API client
newsapi = NewsApiClient(api_key=api_key)

# Calculate dates for the last 5 days
today = datetime.now()
five_days_ago = today - timedelta(days=5)

# Format dates as strings in the required format (YYYY-MM-DD)
from_date = five_days_ago.strftime('%Y-%m-%d')
to_date = today.strftime('%Y-%m-%d')

# Fetch articles about AI from the last 5 days
all_articles = newsapi.get_everything(q='AI, Artificial Intelligence',
                                      sources='wired,techcrunch,the-verge,ars-technica,engadget,mit-technology-review',
                                      domains='bbc.co.uk,techcrunch.com,venturebeat.com,thenextweb.com,artificialintelligence-news.com,aitrends.com',
                                      from_param=from_date,
                                      to=to_date,
                                      language='en',
                                      sort_by='publishedAt',
                                      page=1)

print(all_articles)
