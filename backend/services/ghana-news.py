import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

api_key = os.environ.get('GHANA_NEWS')

# Base URL for the NewsData.io API
base_url = "https://newsdata.io/api/1/latest"

# Parameters for the API request
params = {
    'apikey': api_key,
    'language': 'en',
    'country': 'gh',
    'category': 'business, domestic, education, entertainment, politics',
}

# Make the GET request
response = requests.get(base_url, params=params)

