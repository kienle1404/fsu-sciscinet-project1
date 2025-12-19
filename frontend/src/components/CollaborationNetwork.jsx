/**
 * Collaboration Network Visualization
 * ====================================
 * Interactive force-directed graph showing author collaborations.
 *
 * Features:
 * - Shows co-authorship relationships between researchers
 * - Edge width represents collaboration strength (number of co-authored papers)
 * - Node size indicates paper count
 * - Color coding for different research communities
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function CollaborationNetwork() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef();

  useEffect(() => {
    fetch('http://localhost:5000/api/collaboration-network')
      .then(response => response.json())
      .then(networkData => {
        setData(networkData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!data) return;
    createVisualization(data);
  }, [data]);

  function createVisualization(networkData) {
    const width = 800;
    const height = 600;

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

    const g = svg.append('g');

    const nodes = networkData.nodes.map(d => ({ ...d }));
    const links = networkData.links.map(d => ({ ...d }));

    // Force simulation (same as CitationNetwork)
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(70))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(15));

    // Draw links with variable width (based on collaboration strength)
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-width', d => Math.sqrt(d.weight)) // Thicker = more collaborations
      .attr('stroke-opacity', 0.6);

    // Color scale for authors
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Draw nodes (authors)
    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => Math.sqrt(d.papers) * 3) // Size by paper count
      .attr('fill', (d, i) => color(i % 10)) // Color by index
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .call(drag(simulation));

    // Tooltips for nodes (authors)
    node.on('mouseover', function(event, d) {
      d3.select(this)
        .attr('stroke', 'orange')
        .attr('stroke-width', 3);

      tooltip.transition()
        .duration(200)
        .style('opacity', 0.9);

      tooltip.html(`
        <strong>${d.name || 'Unknown Author'}</strong><br/>
        <strong>Papers:</strong> ${d.papers || 0}<br/>
        <strong>Collaborators:</strong> ${d.collaborators || 0}
      `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    })
    .on('mousemove', function(event) {
      tooltip
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    })
    .on('mouseout', function() {
      d3.select(this)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5);

      tooltip.transition()
        .duration(200)
        .style('opacity', 0);
    });

    // Tooltips for links (collaborations)
    link.on('mouseover', function(event, d) {
      d3.select(this)
        .attr('stroke', 'orange')
        .attr('stroke-width', Math.sqrt(d.weight) + 1);

      tooltip.transition()
        .duration(200)
        .style('opacity', 0.9);

      tooltip.html(`
        <strong>Collaboration</strong><br/>
        <strong>Between:</strong> ${d.source.name || 'Unknown'} & ${d.target.name || 'Unknown'}<br/>
        <strong>Co-authored papers:</strong> ${d.weight || 1}
      `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    })
    .on('mouseout', function(event, d) {
      d3.select(this)
        .attr('stroke', '#999')
        .attr('stroke-width', Math.sqrt(d.weight));

      tooltip.transition()
        .duration(200)
        .style('opacity', 0);
    });

    // Update positions
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });

    // Zoom
    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
  }

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

  if (loading) {
    return <div>Loading collaboration network...</div>;
  }

  if (!data) {
    return <div>Error loading data. Make sure the backend is running!</div>;
  }

  return (
    <div>
      <h2>Collaboration Network</h2>
      <p>Authors who co-authored papers together. Drag nodes to explore.</p>
      <svg
        ref={svgRef}
        width={800}
        height={600}
        style={{ border: '1px solid #ccc' }}
      />
      <p><em>Note: Node size = number of papers. Edge thickness = collaboration strength.</em></p>
    </div>
  );
}

export default CollaborationNetwork;
