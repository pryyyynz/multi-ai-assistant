import requests
from bs4 import BeautifulSoup
import csv
import time
from datetime import datetime

def scrape_ghanajob(url):
    """Scrape job listings from GhanaJob website."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    print(f"Sending request to {url}")
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise exception for 4XX/5XX responses
    except requests.exceptions.RequestException as e:
        print(f"Error fetching the page: {e}")
        return []
    
    print("Parsing HTML content...")
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Find job listings based on the screenshot
    # Each job appears to be in a container with company info and job details
    job_listings = soup.find_all('div', class_=lambda c: c and 'light-grey-bg' in c)
    
    if not job_listings:
        print("No job listings found with expected class. Trying alternative approach...")
        # Try to find job listings by their titles/headers
        job_titles = soup.find_all(['h2', 'h3', 'div'], string=lambda s: s and ('Manager' in s or 'Supervisor' in s or 'Worker' in s or 'Officer' in s or 'Sales' in s or 'Consultant' in s or 'Frontdesk' in s or 'Receptionist' in s or 'Developer' in s or 'Software' in s or 'Marketing' in s or 'Remote' in s or 'Assistant' in s))
        if job_titles:
            print(f"Found {len(job_titles)} job titles. Extracting parent elements...")
            job_listings = [title.find_parent('div') for title in job_titles]
    
    print(f"Found {len(job_listings)} potential job listings")
    
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
                'url': job_url
            }
            
            print(f"Extracted job: {title}")
            jobs.append(job_data)
            
        except Exception as e:
            print(f"Error extracting job details: {e}")
    
    if not jobs:
        print("No jobs could be extracted.")
    
    return jobs

def save_to_csv(jobs, filename="ghanajob_listings.csv"):
    """Save the extracted job information to a CSV file."""
    if not jobs:
        print("No jobs to save.")
        return
    
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = jobs[0].keys()
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for job in jobs:
                writer.writerow(job)
                
        print(f"Successfully saved {len(jobs)} jobs to {filename}")
    except Exception as e:
        print(f"Error saving to CSV: {e}")

if __name__ == "__main__":
    base_url = "https://www.ghanajob.com/job-vacancies-search-ghana"
    all_jobs = []
    
    # Loop through pages 1 to 5
    for page in range(1, 6):
        page_url = f"{base_url}?page={page}"
        print(f"\n{'='*50}")
        print(f"Scraping page {page} of 5: {page_url}")
        print(f"{'='*50}")
        
        jobs = scrape_ghanajob(page_url)
        print(f"Found {len(jobs)} job listings on page {page}.")
        all_jobs.extend(jobs)
        
        # Add a delay between requests to avoid overwhelming the server
        if page < 5:
            delay = 3  # 3-second delay between pages
            print(f"Waiting {delay} seconds before next page...")
            time.sleep(delay)
    
    print(f"\nTotal jobs collected: {len(all_jobs)}")
    
    # Save all collected jobs to CSV
    filename = f"ghanajob_listings.csv"
    save_to_csv(all_jobs, filename)