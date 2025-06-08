import requests
from bs4 import BeautifulSoup
import csv
import time
import os
import hashlib
from datetime import datetime, timedelta
import threading
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('ghanajob_scraper')

# Global variable to track next run time
next_run_time = None
is_running = False

def scrape_ghanajob(url):
    """Scrape job listings from GhanaJob website."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    logger.info(f"Sending request to {url}")
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise exception for 4XX/5XX responses
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching the page: {e}")
        return []
    
    logger.info("Parsing HTML content...")
    soup = BeautifulSoup(response.content, 'html.parser')
    
    job_listings = soup.find_all('div', class_=lambda c: c and 'light-grey-bg' in c)
    
    if not job_listings:
        logger.info("No job listings found with expected class. Trying alternative approach...")
        # Try to find job listings by their titles/headers
        job_titles = soup.find_all(['h2', 'h3', 'div'], string=lambda s: s and ('Manager' in s or 'Supervisor' in s or 'Worker' in s or 'Officer' in s or 'Sales' in s or 'Consultant' in s or 'Frontdesk' in s or 'Receptionist' in s or 'Developer' in s or 'Software' in s or 'Marketing' in s or 'Remote' in s or 'Assistant' in s))
        if job_titles:
            logger.info(f"Found {len(job_titles)} job titles. Extracting parent elements...")
            job_listings = [title.find_parent('div') for title in job_titles]
    
    logger.info(f"Found {len(job_listings)} potential job listings")
    
    jobs = []
    
    for job in job_listings:
        try:
            # Extract job title - looking for h2/h3 elements
            title_element = job.find(['h2', 'h3', 'div'], class_=None)
            title = title_element.text.strip() if title_element else "N/A"
            
            # Extract company name - based on the screenshot, companies appear as links
            company_element = job.find('a', string=lambda s: s and 'RECRUITMENT' in s)
            company = company_element.text.strip() if company_element else "N/A"
            
            # Extract URL if available
            job_url = "N/A"
            if title_element and title_element.name == 'a':
                job_url = title_element.get('href', "N/A")
            elif title_element:
                url_element = title_element.find('a')
                if url_element:
                    job_url = url_element.get('href', "N/A")
            
            # Make URL absolute if it's relative
            if job_url != "N/A" and not job_url.startswith(('http://', 'https://')):
                job_url = f"https://www.ghanajob.com{job_url}"
            
            # Extract location information
            location_text = None
            for elem in job.find_all(['div', 'p', 'span']):
                text = elem.text.strip()
                if any(region in text for region in ['Accra', 'Ashanti', 'Volta', 'Central', 'Eastern', 'Greater']):
                    location_text = text
                    if 'Region of :' in text:
                        location_text = text.split('Region of :')[1].strip()
                    break
            location = location_text if location_text else "N/A"
            
            # Extract education requirements
            education_text = None
            for elem in job.find_all(['div', 'p', 'span']):
                text = elem.text.strip()
                if 'Education level :' in text:
                    education_text = text.split('Education level :')[1].strip()
                    break
            education = education_text if education_text else "N/A"
            
            # Extract experience requirements
            experience_text = None
            for elem in job.find_all(['div', 'p', 'span']):
                text = elem.text.strip()
                if 'Experience level :' in text:
                    experience_text = text.split('Experience level :')[1].strip()
                    break
            experience = experience_text if experience_text else "N/A"
            
            # Extract contract type
            contract_text = None
            for elem in job.find_all(['div', 'p', 'span']):
                text = elem.text.strip()
                if 'Proposed contract :' in text:
                    contract_text = text.split('Proposed contract :')[1].strip()
                    break
            contract = contract_text if contract_text else "N/A"
            
            # Extract skills
            skills_text = None
            for elem in job.find_all(['div', 'p', 'span']):
                text = elem.text.strip()
                if 'Key Skills :' in text:
                    skills_text = text.split('Key Skills :')[1].strip()
                    break
            skills = skills_text if skills_text else "N/A"
            
            # Extract date
            date_element = job.find(string=lambda text: text and text.strip().count('.') == 2 and len(text.strip()) == 10)
            date_posted = date_element.strip() if date_element else "N/A"
            
            # Extract job description snippet
            description_text = None
            for elem in job.find_all(['div', 'p']):
                text = elem.text.strip()
                if text.startswith('We are') and len(text) > 15:
                    description_text = text
                    break
            description = description_text if description_text else "N/A"
            
            # Add scrape date
            scrape_date = datetime.now().strftime("%Y-%m-%d")
            
            job_data = {
                'title': title,
                'company': company,
                'location': location,
                'education': education,
                'experience': experience,
                'contract_type': contract,
                'skills': skills,
                'date_posted': date_posted,
                'description': description,
                'url': job_url,
                'scrape_date': scrape_date,
                # Generate a unique hash for deduplication
                'job_hash': generate_job_hash(title, company, job_url)
            }
            
            logger.info(f"Extracted job: {title}")
            jobs.append(job_data)
            
        except Exception as e:
            logger.error(f"Error extracting job details: {e}")
    
    if not jobs:
        logger.warning("No jobs could be extracted.")
    
    return jobs

def generate_job_hash(title, company, url):
    """Generate a unique hash for a job to help with deduplication."""
    # Create a string combining job title, company and URL
    job_string = f"{title}|{company}|{url}"
    # Generate an MD5 hash
    return hashlib.md5(job_string.encode()).hexdigest()

def get_existing_job_hashes(filename):
    """Read existing CSV file and return a set of job hashes."""
    existing_hashes = set()
    
    if not os.path.exists(filename):
        logger.info(f"File {filename} does not exist yet. Will create it.")
        return existing_hashes
    
    try:
        with open(filename, 'r', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            # Check if job_hash is in the headers
            if 'job_hash' in reader.fieldnames:
                for row in reader:
                    existing_hashes.add(row['job_hash'])
            else:
                logger.warning("Existing CSV doesn't have job_hash column. Will treat all new jobs as unique.")
    except Exception as e:
        logger.error(f"Error reading existing CSV: {e}")
    
    return existing_hashes

def save_to_csv(jobs, filename="ghanajob_listings.csv"):
    """Save the extracted job information to a CSV file, appending to existing data."""
    if not jobs:
        logger.info("No jobs to save.")
        return
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    # Get existing job hashes
    existing_hashes = get_existing_job_hashes(filename)
    logger.info(f"Found {len(existing_hashes)} existing job entries.")
    
    # Filter out duplicates
    new_jobs = [job for job in jobs if job['job_hash'] not in existing_hashes]
    logger.info(f"Adding {len(new_jobs)} new job entries (filtered out {len(jobs) - len(new_jobs)} duplicates).")
    
    if not new_jobs:
        logger.info("No new jobs to add.")
        return
    
    try:
        file_exists = os.path.exists(filename)
        
        with open(filename, 'a', newline='', encoding='utf-8') as csvfile:
            fieldnames = new_jobs[0].keys()
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            # Only write header if file is new
            if not file_exists:
                writer.writeheader()
                
            for job in new_jobs:
                writer.writerow(job)
                
        logger.info(f"Successfully appended {len(new_jobs)} new jobs to {filename}")
    except Exception as e:
        logger.error(f"Error saving to CSV: {e}")

def job_scraper():
    """Main function to scrape jobs and save them."""
    global is_running, next_run_time
    
    if is_running:
        logger.info("Scraper is already running. Skipping this execution.")
        return
    
    is_running = True
    
    try:
        logger.info(f"{'='*50}")
        logger.info(f"Starting job scraper at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"{'='*50}")
        
        base_url = "https://www.ghanajob.com/job-vacancies-search-ghana"
        all_jobs = []
        
        # Loop through pages 1 to 5
        for page in range(1, 6):
            page_url = f"{base_url}?page={page}"
            logger.info(f"{'='*50}")
            logger.info(f"Scraping page {page} of 5: {page_url}")
            logger.info(f"{'='*50}")
            
            jobs = scrape_ghanajob(page_url)
            logger.info(f"Found {len(jobs)} job listings on page {page}.")
            all_jobs.extend(jobs)
            
            # Add a delay between requests to avoid overwhelming the server
            if page < 5:
                delay = 3  # 3-second delay between pages
                logger.info(f"Waiting {delay} seconds before next page...")
                time.sleep(delay)
        
        logger.info(f"Total jobs collected: {len(all_jobs)}")
        
        # Save all collected jobs to CSV
        # Use an absolute path for Railway
        data_dir = os.environ.get('DATA_DIR', os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data"))
        filename = os.path.join(data_dir, "ghanajob_listings.csv")
        save_to_csv(all_jobs, filename)
        
        # Schedule next run
        next_run_time = datetime.now() + timedelta(days=3)
        logger.info(f"Job scraper completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"Next run scheduled for {next_run_time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    except Exception as e:
        logger.error(f"Error in job scraper: {e}")
    
    finally:
        is_running = False

def check_schedule():
    """Check if it's time to run the scraper."""
    global next_run_time
    
    current_time = datetime.now()
    
    # If next run time is not set or current time has passed the next run time
    if next_run_time is None or current_time >= next_run_time:
        # Run in a separate thread to not block
        thread = threading.Thread(target=job_scraper)
        thread.daemon = True  # This makes the thread exit when the main program exits
        thread.start()

def init_scraper():
    """Initialize the scraper with first run and setup checking mechanism."""
    global next_run_time
    
    # Run immediately when started
    thread = threading.Thread(target=job_scraper)
    thread.daemon = True
    thread.start()
    
    # Set next run time if not already set by job_scraper
    if next_run_time is None:
        next_run_time = datetime.now() + timedelta(days=3)

def get_scraper_status():
    """Return the current status of the scraper."""
    global is_running, next_run_time
    
    if is_running:
        status = "running"
    else:
        status = "idle"
    
    next_run = next_run_time.strftime('%Y-%m-%d %H:%M:%S') if next_run_time else "Not scheduled"
    
    return {
        "status": status,
        "next_run": next_run
    }

# This function is what you'll call from your main.py
def setup_scraper_in_main_app():
    """Setup the scraper to run within a main application."""
    # Initialize the scraper
    init_scraper()
    
    # Return the status endpoint function that can be used in a web framework
    return {
        "check_schedule": check_schedule,
        "get_status": get_scraper_status,
        "run_now": job_scraper
    }