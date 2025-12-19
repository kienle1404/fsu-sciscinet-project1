/**
 * Coordinated Dashboard: Timeline + Histogram
 * ============================================
 * Interactive dashboard with two coordinated visualizations:
 * 1. Timeline: Publication count by year (bar chart)
 * 2. Histogram: Citation distribution for selected year
 *
 * Features:
 * - D3.js bar charts with custom scales and axes
 * - Coordinated views (click timeline → update histogram)
 * - State management for interactive filtering
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function Dashboard() {
  const [timelineData, setTimelineData] = useState([]);
  const [histogramData, setHistogramData] = useState({});
  const [selectedYear, setSelectedYear] = useState(2024);
  const [loading, setLoading] = useState(true);

  const timelineRef = useRef();
  const histogramRef = useRef();

  // Fetch data when component loads
  useEffect(() => {
    // Helper function to fetch histogram data for all years
    const fetchAllHistogramData = (years) => {
      const histogramPromises = years.map(year =>
        fetch(`http://localhost:5000/api/histogram/${year}`)
          .then(res => res.json())
          .then(response => {
            // Extract histogram array from response and map to expected format
            const histogramArray = response.histogram || [];
            const formattedData = histogramArray.map(item => ({
              label: item.bin,
              count: item.count
            }));
            return { year, data: formattedData };
          })
          .catch(error => {
            console.error(`Error fetching histogram for ${year}:`, error);
            return { year, data: [] };
          })
      );

      Promise.all(histogramPromises).then(results => {
        const histogramMap = {};
        results.forEach(({ year, data }) => {
          histogramMap[year] = data;
        });
        setHistogramData(histogramMap);
      });
    };

    // Fetch timeline data
    fetch('http://localhost:5000/api/timeline')
      .then(res => res.json())
      .then(data => {
        setTimelineData(data);
        if (data.length > 0) {
          const latestYear = data[data.length - 1].year;
          setSelectedYear(latestYear);
          // Fetch histogram data for all years
          fetchAllHistogramData(data.map(d => d.year));
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching timeline:', error);
        setLoading(false);
      });
  }, []);

  // Draw timeline when data changes
  useEffect(() => {
    if (timelineData.length > 0 && timelineRef.current) {
      try {
        drawTimeline();
      } catch (error) {
        console.error('Error drawing timeline:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timelineData, selectedYear]);

  // Draw histogram when selected year changes
  useEffect(() => {
    if (histogramData[selectedYear] && histogramRef.current) {
      try {
        drawHistogram();
      } catch (error) {
        console.error('Error drawing histogram:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, histogramData]);

  /**
   * Draw the timeline bar chart.
   * Shows papers published each year.
   */
  function drawTimeline() {
    const width = 700;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous chart
    const svg = d3.select(timelineRef.current);
    svg.selectAll('*').remove();

    // Create scales
    const x = d3.scaleBand()
      .domain(timelineData.map(d => d.year))
      .range([0, innerWidth])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(timelineData, d => d.count)])
      .range([innerHeight, 0])
      .nice();

    // Create SVG group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Draw bars
    g.selectAll('.bar')
      .data(timelineData)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.year))
      .attr('y', d => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.count))
      .attr('fill', d => d.year === selectedYear ? '#ff7f0e' : '#1f77b4')
      .attr('cursor', 'pointer')
      .on('click', function(event, d) {
        // When a bar is clicked, update the selected year
        setSelectedYear(d.year);
      })
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 0.7);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
      });

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 40)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .text('Year');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .text('Number of Papers');
  }

  /**
   * Draw the histogram chart.
   * Shows citation distribution for the selected year.
   */
  function drawHistogram() {
    const data = histogramData[selectedYear];
    if (!data) return;

    const width = 700;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous chart
    const svg = d3.select(histogramRef.current);
    svg.selectAll('*').remove();

    // Create scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .range([innerHeight, 0])
      .nice();

    // Create SVG group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Draw bars
    g.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.label))
      .attr('y', d => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.count))
      .attr('fill', '#2ca02c');

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 40)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .text('Citation Count Range');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .text('Number of Papers');
  }

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (!timelineData || timelineData.length === 0) {
    return (
      <div>
        <h2>Publication Timeline & Citation Distribution</h2>
        <p style={{ color: 'red' }}>No timeline data available. Please check backend connection.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Publication Timeline & Citation Distribution</h2>
      <p style={{ fontSize: '12px', color: '#666' }}>
        Loaded {timelineData.length} years of data. Selected year: {selectedYear}
      </p>

      <div style={{ marginBottom: '40px' }}>
        <h3>Timeline: Papers by Year</h3>
        <p>Click a bar to see citation distribution for that year.</p>
        <svg
          ref={timelineRef}
          width={700}
          height={300}
          style={{ border: '1px solid #ccc', display: 'block', backgroundColor: '#fafafa' }}
        />
      </div>

      <div>
        <h3>Citation Distribution for {selectedYear}</h3>
        <p>How many citations do papers from {selectedYear} have?</p>
        {!histogramData[selectedYear] && (
          <p style={{ color: 'orange' }}>Loading histogram data for {selectedYear}...</p>
        )}
        <svg
          ref={histogramRef}
          width={700}
          height={300}
          style={{ border: '1px solid #ccc', display: 'block', backgroundColor: '#fafafa' }}
        />
      </div>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <strong>How to use:</strong>
        <ol>
          <li>Look at the timeline to see publication trends over time</li>
          <li>Click any bar to select a year</li>
          <li>The histogram below updates to show citation distribution for that year</li>
        </ol>
      </div>
    </div>
  );
}

export default Dashboard;
