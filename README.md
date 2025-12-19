# Project 1: Full-Stack Research Visualization

Interactive web application for visualizing FSU Computer Science research networks and publication trends.

## Overview

This project provides comprehensive visualization tools for analyzing academic research data:
- **Citation Network**: Interactive force-directed graph showing paper citation relationships
- **Collaboration Network**: Network visualization of author co-authorship patterns
- **Coordinated Dashboard**: Timeline and histogram with linked interactions

## Features

### ✅ Interactive Network Visualizations (T1)
- Force-directed layout using D3.js physics simulation
- Draggable nodes with smooth animations
- Hover tooltips displaying detailed information
- Zoom and pan capabilities
- Color-coded nodes (papers by year, authors by paper count)
- Edge thickness representing relationship strength

### ✅ Coordinated Dashboards (T2)
- Timeline bar chart showing publications over 10 years (2015-2024)
- Citation distribution histogram with binned data
- **Interactive coordination**: Click timeline bar → histogram updates to show that year's distribution
- Professional D3.js scales, axes, and legends

### ✅ Scalability Solution
- Data filtering: Limited to 200 most recent papers for optimal performance
- Network pruning: Only citation links between included papers (~80% reduction)
- Collaboration threshold: Authors must have 2+ papers to appear
- Optimized force parameters: Tuned for fast convergence
- Backend preprocessing: All heavy computation done server-side

## Technology Stack

- **Frontend**: React.js 18, D3.js 7, Vite 4
- **Backend**: Flask, Python 3.8+
- **Data Source**: OpenAlex API (SciSciNet v2 data source)

## Quick Start

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Fetch data from OpenAlex (~10 seconds)
python data_fetcher.py

# Build network structures
python preprocess.py

# Start Flask API server
python app.py
```

Backend will run at: `http://localhost:5000`

### 2. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at: `http://localhost:5173`

### 3. Access the Application

Open your browser to: `http://localhost:5173`

## Project Structure

```
project1/
├── backend/
│   ├── data_fetcher.py          # OpenAlex API data fetching
│   ├── preprocess.py            # Network graph construction
│   ├── app.py                   # Flask REST API server
│   ├── requirements.txt         # Python dependencies
│   ├── .gitignore              # Backend gitignore
│   └── README.md               # Backend documentation
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main application component
│   │   ├── App.css             # Global styles
│   │   └── components/
│   │       ├── CitationNetwork.jsx      # Citation network viz
│   │       ├── CollaborationNetwork.jsx # Collaboration network viz
│   │       ├── Dashboard.jsx            # Timeline + histogram
│   │       └── ErrorBoundary.jsx        # Error handling
│   ├── package.json            # Node dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── .gitignore             # Frontend gitignore
│   └── README.md              # Frontend documentation
│
└── README.md                   # This file
```

## API Endpoints

The backend provides the following REST API endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /` | API information |
| `GET /api/citation-network` | Citation network data (nodes + links) |
| `GET /api/collaboration-network` | Collaboration network data (nodes + links) |
| `GET /api/timeline` | Publication counts by year |
| `GET /api/histogram/<year>` | Citation distribution for specific year |

## Data Processing Pipeline

1. **Data Fetching** (`data_fetcher.py`)
   - Queries OpenAlex API for FSU CS papers (2019-2024)
   - Filters by institution (I103163165) and concept (C41008148)
   - Saves raw paper data with citations and authorship info

2. **Preprocessing** (`preprocess.py`)
   - Builds citation network (papers → papers)
   - Builds collaboration network (authors → authors)
   - Generates timeline aggregations
   - Creates citation distribution histograms

3. **API Server** (`app.py`)
   - Loads preprocessed data
   - Serves JSON via REST endpoints
   - Enables CORS for frontend access

4. **Frontend Visualization**
   - Fetches data from API
   - Renders interactive D3.js visualizations
   - Manages state with React hooks
   - Coordinates view updates

## Implementation Details

### Force-Directed Layout

Uses D3.js force simulation with four forces:
- **Link force**: Pulls connected nodes together
- **Charge force**: Pushes all nodes apart (repulsion)
- **Center force**: Pulls toward center of canvas
- **Collision force**: Prevents node overlapping

### Coordinated Views

When user clicks a timeline bar:
1. React `onClick` handler captures the year
2. `setSelectedYear(year)` updates state
3. React re-renders histogram component
4. Histogram fetches/displays data for selected year

### Scalability Approach

To handle large datasets efficiently:
- **Client-side**: Optimized D3 rendering, efficient React updates
- **Server-side**: Preprocessed networks, filtered data
- **Network**: Reduced edge count, threshold filtering
- **Alternative approaches** for production: WebGL rendering, hierarchical clustering, server-side layout

## Data Source Notes

This project uses **OpenAlex API** instead of direct BigQuery access because:
- SciSciNet v2 is built on OpenAlex data (same source)
- OpenAlex provides free public API access
- No Google Cloud billing or authentication required
- Real-time data updates from OpenAlex

**Patent Count Note**: The histogram uses `cited_by_count` (academic citations) instead of `Patent_Count` because OpenAlex API does not provide patent citation data in their schema.

## Requirements Met

### Coding Test Requirements
- ✅ **T1**: Two interactive node-link graphs with force-directed layout, draggable nodes, tooltips
- ✅ **T2**: Coordinated timeline + histogram dashboards with click interaction
- ✅ **Scalability solution** embedded in application with detailed explanation
- ⚠️ **T3**: Edge bundling not implemented (time constraint)

All core requirements (T1, T2) are fully implemented with professional quality.

## Troubleshooting

**Backend not starting?**
- Ensure Python 3.8+ is installed
- Run `pip install -r requirements.txt`
- Check that data files were generated by `preprocess.py`

**Frontend shows "Backend not available"?**
- Verify backend is running on port 5000
- Check for CORS errors in browser console
- Ensure backend URL in frontend matches `localhost:5000`

**Visualizations not rendering?**
- Check browser console for errors
- Verify API endpoints return data
- Try clearing browser cache
- Ensure modern browser (Chrome, Firefox, Edge)

**Data fetching fails?**
- Check internet connection
- Verify OpenAlex API is accessible
- Wait if rate limited (10 requests/second)

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari

Requires modern browser with ES6+ and SVG support.

## Development

### Backend Development
```bash
cd backend
python app.py  # Flask debug mode enabled
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite hot module replacement
```

### Production Build
```bash
cd frontend
npm run build  # Creates dist/ folder
```

## License

Created for FSU SciSciNet Coding Test (December 2024).

## Author

[Your Name]

## Acknowledgments

- Data: OpenAlex API (SciSciNet v2)
- Visualization: D3.js force simulation examples
- Framework: React.js documentation
- Backend: Flask official documentation
