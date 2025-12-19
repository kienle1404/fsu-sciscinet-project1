/**
 * Main App Component
 * ==================
 * Root component that displays all visualizations.
 * Uses conditional rendering to switch between views.
 */

import React, { useState, useEffect } from 'react';
import CitationNetwork from './components/CitationNetwork';
import CollaborationNetwork from './components/CollaborationNetwork';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  // State to track which view to show
  const [currentView, setCurrentView] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState('checking');

  // Check if backend is available
  useEffect(() => {
    fetch('http://localhost:5000/')
      .then(res => res.json())
      .then(() => {
        setBackendStatus('connected');
      })
      .catch(error => {
        console.error('Backend connection error:', error);
        setBackendStatus('error');
      });
  }, []);

  return (
    <div className="App">
      <header>
        <h1>FSU Computer Science Research Network</h1>
        <p>Visualization of research papers and collaborations (2019-2024)</p>
        {backendStatus === 'checking' && (
          <p style={{ color: '#ffeb3b', fontSize: '14px', margin: '10px 0' }}>Connecting to backend...</p>
        )}
        {backendStatus === 'error' && (
          <div style={{ color: '#ff5252', fontSize: '14px', margin: '10px 0', padding: '10px', backgroundColor: 'rgba(255, 82, 82, 0.1)', borderRadius: '4px' }}>
            ⚠️ Backend not available. Please start the Flask server:<br/>
            <code>cd project1-backend && python app.py</code>
          </div>
        )}
        {backendStatus === 'connected' && (
          <p style={{ color: '#4caf50', fontSize: '14px', margin: '10px 0' }}>✓ Backend connected</p>
        )}
      </header>

      {/* Navigation buttons */}
      <nav style={{ margin: '20px 0', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <button
          onClick={() => setCurrentView('dashboard')}
          style={{
            padding: '10px 20px',
            margin: '0 10px',
            backgroundColor: currentView === 'dashboard' ? '#1f77b4' : '#fff',
            color: currentView === 'dashboard' ? '#fff' : '#000',
            border: '1px solid #ccc',
            cursor: 'pointer'
          }}
        >
          Timeline & Histogram
        </button>

        <button
          onClick={() => setCurrentView('citation')}
          style={{
            padding: '10px 20px',
            margin: '0 10px',
            backgroundColor: currentView === 'citation' ? '#1f77b4' : '#fff',
            color: currentView === 'citation' ? '#fff' : '#000',
            border: '1px solid #ccc',
            cursor: 'pointer'
          }}
        >
          Citation Network
        </button>

        <button
          onClick={() => setCurrentView('collaboration')}
          style={{
            padding: '10px 20px',
            margin: '0 10px',
            backgroundColor: currentView === 'collaboration' ? '#1f77b4' : '#fff',
            color: currentView === 'collaboration' ? '#fff' : '#000',
            border: '1px solid #ccc',
            cursor: 'pointer'
          }}
        >
          Collaboration Network
        </button>
      </nav>

      {/* Main content area - shows the selected view */}
      <main style={{ padding: '20px' }}>
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'citation' && <CitationNetwork />}
        {currentView === 'collaboration' && <CollaborationNetwork />}
      </main>

      <footer style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f0f0f0' }}>
        <h3>About This Project</h3>
        <p>
          Interactive visualization of FSU Computer Science research publications.
          Data fetched from OpenAlex API and processed using Python.
        </p>
        <p>
          <strong>Technologies:</strong> React, D3.js, Flask, Python
        </p>
        <p>
          <strong>Dataset:</strong> ~200 papers from FSU CS (2019-2024)
        </p>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff', borderLeft: '4px solid #782f40' }}>
          <h4 style={{ marginTop: 0 }}>Scalability Solution</h4>
          <p style={{ textAlign: 'left', color: '#333' }}>
            <strong>Challenge:</strong> The full SciSciNet dataset contains thousands of papers and authors, which can cause
            performance issues with force-directed layouts (slow simulation, cluttered visualization, browser lag).
          </p>
          <p style={{ textAlign: 'left', color: '#333' }}>
            <strong>Our Solution:</strong> We implemented several optimization strategies:
          </p>
          <ul style={{ textAlign: 'left', color: '#333' }}>
            <li><strong>Data Filtering:</strong> Limited to 200 most recent FSU CS papers (2019-2024) instead of the full dataset</li>
            <li><strong>Network Pruning:</strong> Only include citation links between papers in our filtered set, reducing edge count by ~80%</li>
            <li><strong>Collaboration Threshold:</strong> Authors must have 2+ papers to appear in the collaboration network, focusing on active researchers</li>
            <li><strong>Force Simulation Tuning:</strong> Optimized D3 force parameters (charge: -100, link distance: 50) for faster convergence</li>
            <li><strong>Backend Preprocessing:</strong> All network calculations done server-side in Python, frontend only renders pre-computed graphs</li>
          </ul>
          <p style={{ textAlign: 'left', color: '#333' }}>
            <strong>Alternative Approaches:</strong> For larger datasets, we could implement: (1) WebGL rendering using deck.gl
            for hardware acceleration, (2) hierarchical clustering with expand/collapse functionality, (3) server-side rendering
            to pre-compute layout positions, or (4) virtual scrolling and viewport culling to only render visible nodes.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
