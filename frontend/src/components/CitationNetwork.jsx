/**
 * Citation Network Visualization
 * ==============================
 * Interactive force-directed graph showing paper citations.
 *
 * Features:
 * - D3.js force simulation for network layout
 * - Draggable nodes
 * - Hover tooltips with paper details
 * - Zoom and pan capabilities
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function CitationNetwork() {
  // State to store the network data from our API
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // useRef gives us a reference to the SVG element
  const svgRef = useRef();

  // useEffect runs when the component first loads
  useEffect(() => {
    // Fetch data from our Flask API
    fetch('http://localhost:5000/api/citation-network')
      .then(response => response.json())
      .then(networkData => {
        setData(networkData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []); // Empty array means "run once when component loads"

  // useEffect runs when data changes
  useEffect(() => {
    if (!data) return; // Don't run if we don't have data yet

    // Create the visualization
    createVisualization(data);
  }, [data]);

  /**
   * Creates the D3.js force-directed graph visualization.
   */
  function createVisualization(networkData) {
    // Set up dimensions
    const width = 800;
    const height = 600;

    // Clear any existing SVG content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create tooltip div
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('padding', '10px')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('border-radius', '5px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('font-size', '12px')
      .style('max-width', '300px')
      .style('z-index', 1000);

    // Create SVG group for zoom/pan
    const g = svg.append('g');

    // Make a copy of the data (D3 mutates it)
    const nodes = networkData.nodes.map(d => ({ ...d }));
    const links = networkData.links.map(d => ({ ...d }));

    // ========== D3 FORCE SIMULATION ==========
    // This is the physics engine that positions the nodes

    const simulation = d3.forceSimulation(nodes)
      // Link force: pull connected nodes together
      .force('link', d3.forceLink(links)
        .id(d => d.id)  // Use 'id' field to match nodes
        .distance(50))   // Distance between connected nodes

      // Charge force: push all nodes apart (like magnetic repulsion)
      .force('charge', d3.forceManyBody().strength(-100))

      // Center force: pull all nodes toward center
      .force('center', d3.forceCenter(width / 2, height / 2))

      // Collision force: prevent nodes from overlapping
      .force('collision', d3.forceCollide().radius(10));

    // ========== DRAW LINKS (EDGES) ==========

    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.6);

    // ========== DRAW NODES ==========

    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => Math.sqrt(d.citations + 1) * 2) // Size by citations
      .attr('fill', d => {
        // Color by publication year
        const yearColors = {
          2019: '#1f77b4',
          2020: '#ff7f0e',
          2021: '#2ca02c',
          2022: '#d62728',
          2023: '#9467bd',
          2024: '#8c564b'
        };
        return yearColors[d.year] || '#999';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .call(drag(simulation)); // Make nodes draggable

    // ========== ADD TOOLTIPS ==========

    node.on('mouseover', function(event, d) {
      // Show tooltip on hover
      d3.select(this)
        .attr('stroke', 'orange')
        .attr('stroke-width', 3);

      // Show tooltip with paper information
      tooltip.transition()
        .duration(200)
        .style('opacity', 0.9);

      tooltip.html(`
        <strong>${d.title || 'Unknown Title'}</strong><br/>
        <strong>Year:</strong> ${d.year}<br/>
        <strong>Citations:</strong> ${d.citations || 0}<br/>
        <strong>Authors:</strong> ${d.authors?.slice(0, 3).join(', ') || 'N/A'}${d.authors?.length > 3 ? '...' : ''}
      `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    })
    .on('mousemove', function(event) {
      // Update tooltip position as mouse moves
      tooltip
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    })
    .on('mouseout', function() {
      // Reset on mouse leave
      d3.select(this)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5);

      // Hide tooltip
      tooltip.transition()
        .duration(200)
        .style('opacity', 0);
    });

    // Add tooltips to links as well
    link.on('mouseover', function(event, d) {
      d3.select(this)
        .attr('stroke', 'orange')
        .attr('stroke-width', 2);

      tooltip.transition()
        .duration(200)
        .style('opacity', 0.9);

      tooltip.html(`
        <strong>Citation Link</strong><br/>
        <strong>From:</strong> ${d.source.title || 'Unknown'}<br/>
        <strong>To:</strong> ${d.target.title || 'Unknown'}
      `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    })
    .on('mouseout', function() {
      d3.select(this)
        .attr('stroke', '#999')
        .attr('stroke-width', 1);

      tooltip.transition()
        .duration(200)
        .style('opacity', 0);
    });

    // ========== UPDATE POSITIONS ON EACH "TICK" ==========
    // The simulation runs many times, updating positions each time

    simulation.on('tick', () => {
      // Update link positions
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      // Update node positions
      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });

    // ========== ADD ZOOM ==========

    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])  // Zoom limits
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
  }

  /**
   * Drag behavior for nodes.
   * This makes nodes draggable and updates the simulation.
   */
  function drag(simulation) {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  // ========== RENDER ==========

  if (loading) {
    return <div>Loading citation network...</div>;
  }

  if (!data) {
    return <div>Error loading data. Make sure the backend is running!</div>;
  }

  return (
    <div>
      <h2>Citation Network</h2>
      <p>Papers citing papers. Drag nodes to explore. Zoom with mouse wheel.</p>
      <svg
        ref={svgRef}
        width={800}
        height={600}
        style={{ border: '1px solid #ccc' }}
      />
      <div style={{ marginTop: '10px' }}>
        <strong>Legend:</strong>
        <span style={{ marginLeft: '10px' }}>
          <span style={{ color: '#1f77b4' }}>■</span> 2019
          <span style={{ marginLeft: '10px', color: '#ff7f0e' }}>■</span> 2020
          <span style={{ marginLeft: '10px', color: '#2ca02c' }}>■</span> 2021
          <span style={{ marginLeft: '10px', color: '#d62728' }}>■</span> 2022
          <span style={{ marginLeft: '10px', color: '#9467bd' }}>■</span> 2023
          <span style={{ marginLeft: '10px', color: '#8c564b' }}>■</span> 2024
        </span>
      </div>
      <p><em>Note: Node size represents citation count</em></p>
    </div>
  );
}

export default CitationNetwork;
