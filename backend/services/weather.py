# weather.py - Script to fetch current weather and 3-day forecast for Ghanaian cities
import os
import sys
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API key from environment variables
API_KEY = os.getenv('WEATHER_API')

# Base URL for the Weather API
BASE_URL = 'http://api.weatherapi.com/v1'

# Available cities
CITIES = ['Accra', 'Kumasi', 'Takoradi', 'Cape Coast', 'Tamale', 'Ho', 'Koforidua']

def get_current_weather(city):
    """
    Fetch current weather for a specific city
    
    Args:
        city (str): The name of the city
        
    Returns:
        dict: Weather data
    """
    try:
        response = requests.get(f"{BASE_URL}/current.json", 
                               params={
                                   'key': API_KEY,
                                   'q': city
                               })
        response.raise_for_status()  # Raise exception for HTTP errors
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching current weather for {city}: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"API Error: {e.response.text}")
        sys.exit(1)

def get_forecast(city):
    """
    Fetch 3-day forecast for a specific city
    
    Args:
        city (str): The name of the city
        
    Returns:
        dict: Forecast data
    """
    try:
        response = requests.get(f"{BASE_URL}/forecast.json", 
                               params={
                                   'key': API_KEY,
                                   'q': city,
                                   'days': 4
                               })
        response.raise_for_status()  # Raise exception for HTTP errors
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching forecast for {city}: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"API Error: {e.response.text}")
        sys.exit(1)

def display_current_weather(data):
    """
    Display current weather information
    
    Args:
        data (dict): Weather data
    """
    location = data['location']
    current = data['current']
    
    print("\n========== CURRENT WEATHER ==========")
    print(f"Location: {location['name']}, {location['region']}, {location['country']}")
    print(f"Local Time: {location['localtime']}")
    print(f"Temperature: {current['temp_c']}°C / {current['temp_f']}°F")
    print(f"Condition: {current['condition']['text']}")
    print(f"Wind: {current['wind_kph']} km/h, {current['wind_dir']}")
    print(f"Humidity: {current['humidity']}%")
    print(f"Feels Like: {current['feelslike_c']}°C / {current['feelslike_f']}°F")
    print(f"Visibility: {current['vis_km']} km")
    print(f"UV Index: {current['uv']}")
    print("=======================================\n")

def display_forecast(data):
    """
    Display forecast information
    
    Args:
        data (dict): Forecast data
    """
    location = data['location']
    forecast = data['forecast']
    
    print("\n========== 3-DAY FORECAST ==========")
    print(f"Location: {location['name']}, {location['region']}, {location['country']}")
    
    for day in forecast['forecastday']:
        date_obj = datetime.strptime(day['date'], '%Y-%m-%d')
        formatted_date = date_obj.strftime('%A, %B %d, %Y')
        
        print(f"\n--- {formatted_date} ---")
        print(f"Max Temperature: {day['day']['maxtemp_c']}°C / {day['day']['maxtemp_f']}°F")
        print(f"Min Temperature: {day['day']['mintemp_c']}°C / {day['day']['mintemp_f']}°F")
        print(f"Condition: {day['day']['condition']['text']}")
        print(f"Chance of Rain: {day['day']['daily_chance_of_rain']}%")
        print(f"Humidity: {day['day']['avghumidity']}%")
        print(f"Wind: {day['day']['maxwind_kph']} km/h")
        print(f"UV Index: {day['day']['uv']}")
    
    print("====================================\n")

def main():
    """
    Main function to handle city selection and data fetching
    """
    if not API_KEY:
        print("Error: Weather API key not found in environment variables.")
        print("Please create a .env file with WEATHER_API_KEY=your_api_key")
        sys.exit(1)
    
    # Parse command line arguments
    args = sys.argv[1:]
    
    # Show usage if no arguments provided
    if not args:
        print("Usage: python weather.py [city] [--forecast]")
        print(f"Available cities: {', '.join(CITIES)}")
        print("Add --forecast flag to show 3-day forecast")
        sys.exit(0)
    
    # Get city from arguments
    city_arg = args[0]
    show_forecast = "--forecast" in args
    
    # Check if city is valid
    if city_arg not in CITIES:
        print(f"Error: \"{city_arg}\" is not a valid city. Available cities: {', '.join(CITIES)}")
        sys.exit(1)
    
    # Always get current weather
    current_weather_data = get_current_weather(city_arg)
    display_current_weather(current_weather_data)
    
    # Get forecast if requested
    if show_forecast:
        forecast_data = get_forecast(city_arg)
        display_forecast(forecast_data)

if __name__ == "__main__":
    main()