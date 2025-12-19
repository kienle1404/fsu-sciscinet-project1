"""
OpenAlex Data Fetcher
---------------------
This script fetches papers from the OpenAlex API for FSU Computer Science research.

Features:
1. Makes API requests with pagination support
2. Handles rate limiting and error recovery
3. Saves structured data to JSON files
4. Filters by institution and research field
"""

import requests
import json
import time
from typing import List, Dict

# OpenAlex API configuration
BASE_URL = "https://api.openalex.org"
EMAIL = "your-email@example.com"  # Replace with your email for "polite pool" access

def fetch_fsu_cs_papers(max_papers: int = 200) -> List[Dict]:
    """
    Fetch papers from Florida State University's Computer Science department.

    Args:
        max_papers: Maximum number of papers to fetch (default 200)

    Returns:
        List of paper dictionaries

    How this works:
    1. We filter papers by institution (FSU) and concept (Computer Science)
    2. We use pagination to get papers in batches of 50
    3. We respect rate limits by adding a small delay between requests
    """

    print(f"Fetching up to {max_papers} papers from OpenAlex...")

    all_papers = []
    page = 1
    per_page = 50  # OpenAlex allows up to 200, but 50 is safer

    # Build the filter string
    # I103163165 = Florida State University
    # C41008148 = Computer Science concept
    filter_string = "institutions.id:I103163165,concepts.id:C41008148,publication_year:2019-2024"

    while len(all_papers) < max_papers:
        # Build the request URL
        url = f"{BASE_URL}/works"
        params = {
            "filter": filter_string,
            "per_page": per_page,
            "page": page,
            "mailto": EMAIL  # This gets us into the "polite pool" for faster access
        }

        print(f"  Fetching page {page}...")

        try:
            # Make the API request
            response = requests.get(url, params=params)
            response.raise_for_status()  # Raise error if request failed

            data = response.json()
            papers = data.get("results", [])

            if not papers:
                print("  No more papers found.")
                break

            # Extract the fields we need for network analysis
            for paper in papers:
                paper_data = {
                    "id": paper.get("id", ""),
                    "title": paper.get("title", "Untitled"),
                    "publication_year": paper.get("publication_year", 0),
                    "doi": paper.get("doi", ""),
                    "cited_by_count": paper.get("cited_by_count", 0),
                    "authorships": paper.get("authorships", []),
                    "referenced_works": paper.get("referenced_works", [])
                }
                all_papers.append(paper_data)

                if len(all_papers) >= max_papers:
                    break

            page += 1

            # Be polite: wait a bit between requests (10 requests/second limit)
            time.sleep(0.1)

        except requests.exceptions.RequestException as e:
            print(f"  Error fetching data: {e}")
            break

    print(f"Successfully fetched {len(all_papers)} papers!")
    return all_papers


def save_to_json(data: List[Dict], filename: str):
    """
    Save data to a JSON file.

    Args:
        data: List of dictionaries to save
        filename: Output filename
    """
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved data to {filename}")


if __name__ == "__main__":
    # Fetch 200 papers (small enough to be manageable)
    papers = fetch_fsu_cs_papers(max_papers=200)

    # Save to JSON file
    save_to_json(papers, "fsu_cs_papers.json")

    # Print some statistics
    print("\n=== Statistics ===")
    print(f"Total papers: {len(papers)}")

    if papers:
        years = [p["publication_year"] for p in papers]
        print(f"Year range: {min(years)} - {max(years)}")

        total_citations = sum(p["cited_by_count"] for p in papers)
        print(f"Total citations: {total_citations}")
        print(f"Average citations per paper: {total_citations / len(papers):.1f}")
