# Project 1 - Backend

Flask REST API for FSU Computer Science research network visualization.

## Overview

This backend provides data processing and API endpoints for visualizing FSU CS research networks:
1. **Data Collection**: Fetches papers from OpenAlex API (FSU CS, 2019-2024)
2. **Data Processing**: Builds network graphs and statistical aggregations
3. **API Service**: Serves processed data via REST endpoints

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Fetch Data from OpenAlex

```bash
python data_fetcher.py
```

Fetches papers and saves to `fsu_cs_papers.json` (~50 KB, takes ~5-10 seconds)

### 3. Preprocess Data

```bash
python preprocess.py
```

Generates:
- `citation_network.json` - Paper citation relationships
- `collaboration_network.json` - Author co-authorship network
- `timeline_data.json` - Publication counts by year
- `histogram_data.json` - Citation distributions

### 4. Start API Server

```bash
python app.py
```

Server runs at `http://localhost:5000`

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | API information and endpoint list |
| `GET /api/citation-network` | Citation network data (nodes + edges) |
| `GET /api/collaboration-network` | Collaboration network data (nodes + edges) |
| `GET /api/timeline` | Publication timeline (papers by year) |
| `GET /api/histogram/<year>` | Citation distribution for specific year |

## File Structure

```
project1-backend/
├── data_fetcher.py          # OpenAlex API integration
├── preprocess.py            # Network and chart data generation
├── app.py                   # Flask REST API server
├── requirements.txt         # Python dependencies
└── README.md               # Documentation

# Generated data files:
├── fsu_cs_papers.json       # Raw paper data from OpenAlex
├── citation_network.json    # Citation network graph
├── collaboration_network.json  # Collaboration network graph
├── timeline_data.json       # Timeline visualization data
└── histogram_data.json      # Citation distribution data
```

## Technical Details

### data_fetcher.py
- API requests using `requests` library
- Pagination handling for large datasets
- Error handling and retry logic
- JSON data persistence

### preprocess.py
- Graph construction (nodes and edges)
- Data aggregation and filtering
- Network analysis computations
- Statistical distributions

### app.py
- Flask routing and request handling
- JSON response formatting
- CORS configuration for frontend integration
- URL parameter processing

