# Project 1 - Frontend

Interactive React application for visualizing FSU Computer Science research networks.

## Overview

This frontend provides interactive visualizations for exploring research publication data:
- **Citation Network**: Force-directed graph of paper citations
- **Collaboration Network**: Force-directed graph of author collaborations
- **Timeline Dashboard**: Interactive timeline with coordinated histogram views

## Features

- D3.js force-directed layouts with draggable nodes
- Zoom and pan capabilities
- Rich tooltips displaying paper/author details
- Coordinated visualizations (click timeline → update histogram)
- Responsive design with FSU branding

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Application runs at `http://localhost:5173`

### 3. Start Backend Server

The frontend requires the backend API to be running:

```bash
cd ../project1-backend
python app.py
```

Backend should be accessible at `http://localhost:5000`

## Build for Production

```bash
npm run build
```

Production files will be in the `dist/` directory.

## Technology Stack

- **React 18** - UI framework
- **D3.js 7** - Data visualization
- **Vite 4** - Build tool and dev server

## Project Structure

```
project1-frontend/
├── src/
│   ├── App.jsx                      # Main application component
│   ├── App.css                      # Global styles
│   ├── main.jsx                     # Application entry point
│   └── components/
│       ├── CitationNetwork.jsx      # Citation network visualization
│       ├── CollaborationNetwork.jsx # Collaboration network visualization
│       ├── Dashboard.jsx            # Timeline + histogram dashboard
│       └── ErrorBoundary.jsx        # Error handling component
├── index.html                       # HTML entry point
├── vite.config.js                   # Vite configuration
├── package.json                     # Dependencies and scripts
└── README.md                        # Documentation
```

## Component Details

### CitationNetwork.jsx
- Force-directed graph showing paper citation relationships
- Node size represents citation count
- Color coding by publication year
- Draggable nodes with physics simulation
- Tooltips show paper title, year, citations, and authors

### CollaborationNetwork.jsx
- Force-directed graph showing author collaborations
- Node size represents number of papers
- Edge thickness represents collaboration strength
- Tooltips show author details and collaboration counts

### Dashboard.jsx
- Timeline bar chart showing papers by year
- Citation distribution histogram
- Coordinated interaction: click timeline bar → histogram updates
- D3.js scales and axes for professional charts

## Scalability Approach

The application handles large datasets through:
- Data filtering (limiting to recent papers)
- Network pruning (reducing edge count)
- Optimized D3 force parameters
- Backend preprocessing
- Responsive rendering

## Troubleshooting

**Error: "Backend not available"**
- Solution: Start the backend server (`cd ../project1-backend && python app.py`)

**Error: "npm install" fails**
- Solution: Ensure Node.js 16+ is installed

**Visualizations not rendering**
- Solution: Check browser console for errors
- Verify backend is returning data at http://localhost:5000/api/citation-network

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari

Requires modern browser with ES6+ support.
