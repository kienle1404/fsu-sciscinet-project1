"""
Network Preprocessing
---------------------
This script processes raw paper data and creates network structures for visualization.

Features:
1. Builds citation networks (papers citing papers)
2. Builds collaboration networks (authors working together)
3. Generates timeline and histogram data for dashboards
4. Optimizes data structures for efficient visualization
"""

import json
from typing import List, Dict, Set
from collections import defaultdict

def load_papers(filename: str) -> List[Dict]:
    """Load papers from JSON file."""
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)


def build_citation_network(papers: List[Dict]) -> Dict:
    """
    Build a citation network where edges represent citations between papers.

    How it works:
    - Each paper has a list of "referenced_works" (papers it cites)
    - We create edges only if BOTH papers are in our dataset
    - This keeps the network connected and manageable

    Returns:
        Dictionary with "nodes" (papers) and "links" (citations)
    """
    print("Building citation network...")

    # Get all paper IDs in our dataset
    paper_ids = {paper["id"] for paper in papers}

    # Build nodes (just the papers)
    nodes = []
    for paper in papers:
        nodes.append({
            "id": paper["id"],
            "title": paper["title"],
            "year": paper["publication_year"],
            "citations": paper["cited_by_count"]
        })

    # Build links (citations between papers)
    links = []
    for paper in papers:
        source_id = paper["id"]

        # Check each paper this one references
        for ref_id in paper.get("referenced_works", []):
            # Only create link if the referenced paper is in our dataset
            if ref_id in paper_ids:
                links.append({
                    "source": source_id,
                    "target": ref_id
                })

    print(f"  Created {len(nodes)} nodes and {len(links)} links")

    return {
        "nodes": nodes,
        "links": links
    }


def build_collaboration_network(papers: List[Dict]) -> Dict:
    """
    Build a collaboration network where edges represent co-authorship.

    How it works:
    - For each paper, we look at all authors
    - If two authors wrote a paper together, we create an edge
    - Edge "weight" = number of papers they co-authored

    Returns:
        Dictionary with "nodes" (authors) and "links" (collaborations)
    """
    print("Building collaboration network...")

    # Track author information
    author_info = defaultdict(lambda: {"papers": 0, "name": ""})
    # Track co-authorship (collaboration edges)
    collaborations = defaultdict(int)

    for paper in papers:
        authors = []

        # Extract author information
        for authorship in paper.get("authorships", []):
            author_data = authorship.get("author", {})
            author_id = author_data.get("id", "")
            author_name = author_data.get("display_name", "Unknown")

            if author_id:
                authors.append(author_id)
                author_info[author_id]["name"] = author_name
                author_info[author_id]["papers"] += 1

        # Create collaboration edges between all pairs of authors on this paper
        for i, author1 in enumerate(authors):
            for author2 in authors[i+1:]:
                # Sort IDs to avoid duplicate edges (A-B and B-A)
                edge = tuple(sorted([author1, author2]))
                collaborations[edge] += 1

    # Build nodes (authors)
    nodes = []
    for author_id, info in author_info.items():
        nodes.append({
            "id": author_id,
            "name": info["name"],
            "papers": info["papers"]
        })

    # Build links (only keep collaborations with 2+ papers together)
    # This reduces noise and keeps the network readable
    links = []
    for (author1, author2), weight in collaborations.items():
        if weight >= 2:  # Filter: only show if they worked together 2+ times
            links.append({
                "source": author1,
                "target": author2,
                "weight": weight
            })

    print(f"  Created {len(nodes)} nodes and {len(links)} links")

    return {
        "nodes": nodes,
        "links": links
    }


def build_timeline_data(papers: List[Dict]) -> List[Dict]:
    """
    Count papers by year for the timeline chart.

    Returns:
        List of {year, count} dictionaries
    """
    print("Building timeline data...")

    year_counts = defaultdict(int)
    for paper in papers:
        year = paper["publication_year"]
        year_counts[year] += 1

    # Sort by year
    timeline = [{"year": year, "count": count}
                for year, count in sorted(year_counts.items())]

    print(f"  Created timeline data for {len(timeline)} years")
    return timeline


def build_histogram_data(papers: List[Dict]) -> Dict[int, List[Dict]]:
    """
    Build citation distribution histograms for each year.

    Returns:
        Dictionary mapping year -> histogram bins
    """
    print("Building histogram data...")

    # Define citation bins
    bins = [
        {"label": "0", "min": 0, "max": 0},
        {"label": "1-4", "min": 1, "max": 4},
        {"label": "5-9", "min": 5, "max": 9},
        {"label": "10-24", "min": 10, "max": 24},
        {"label": "25-49", "min": 25, "max": 49},
        {"label": "50+", "min": 50, "max": 999999}
    ]

    histograms = {}

    # Group papers by year
    papers_by_year = defaultdict(list)
    for paper in papers:
        year = paper["publication_year"]
        papers_by_year[year].append(paper)

    # For each year, count papers in each bin
    for year, year_papers in papers_by_year.items():
        histogram = []

        for bin_info in bins:
            count = sum(1 for p in year_papers
                       if bin_info["min"] <= p["cited_by_count"] <= bin_info["max"])
            histogram.append({
                "label": bin_info["label"],
                "count": count
            })

        histograms[year] = histogram

    print(f"  Created histogram data for {len(histograms)} years")
    return histograms


def save_json(data, filename):
    """Save data to JSON file."""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print(f"Saved {filename}")


if __name__ == "__main__":
    # Load the papers data
    papers = load_papers("fsu_cs_papers.json")

    # Build all the networks and charts
    citation_network = build_citation_network(papers)
    collaboration_network = build_collaboration_network(papers)
    timeline_data = build_timeline_data(papers)
    histogram_data = build_histogram_data(papers)

    # Save everything
    save_json(citation_network, "citation_network.json")
    save_json(collaboration_network, "collaboration_network.json")
    save_json(timeline_data, "timeline_data.json")
    save_json(histogram_data, "histogram_data.json")

    print("\n✓ All preprocessing complete!")
