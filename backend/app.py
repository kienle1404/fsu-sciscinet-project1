from flask import Flask, jsonify
from flask_cors import CORS
import json

# Create Flask app
app = Flask(__name__)

# Enable CORS for frontend access
CORS(app)

# Load all data files when the server starts
print("Loading data files...")
try:
    with open('citation_network.json', 'r') as f:
        citation_network = json.load(f)

    with open('collaboration_network.json', 'r') as f:
        collaboration_network = json.load(f)

    with open('timeline_data.json', 'r') as f:
        timeline_data = json.load(f)

    with open('histogram_data.json', 'r') as f:
        histogram_data = json.load(f)

    print("All data loaded successfully!")

except FileNotFoundError as e:
    print(f"Error: {e}")
    print("Make sure you've run preprocess.py first!")
    exit(1)


# ========== API ENDPOINTS ==========

@app.route('/')
def home():
    """
    Home route - just returns a welcome message.
    """
    return jsonify({
        "message": "FSU CS Research Network API",
        "endpoints": {
            "/api/citation-network": "Get citation network data",
            "/api/collaboration-network": "Get collaboration network data",
            "/api/timeline": "Get publication timeline data",
            "/api/histogram/<year>": "Get citation histogram for a specific year"
        }
    })


@app.route('/api/citation-network')
def get_citation_network():
    """
    Return the citation network (papers citing papers).
    """
    return jsonify(citation_network)


@app.route('/api/collaboration-network')
def get_collaboration_network():
    """
    Return the collaboration network.
    """
    return jsonify(collaboration_network)


@app.route('/api/timeline')
def get_timeline():
    """
    Return publication counts by year
    """
    return jsonify(timeline_data)


@app.route('/api/histogram/<int:year>')
def get_histogram(year):
    """
    Return citation distribution for a specific year.
    Args: 
    year: Publication year (from URL)
    Returns:
    JSON array of {label, count} objects for histogram bins
    """
    # Convert year to string (that's how it's stored in our data)
    year_str = str(year)

    if year_str in histogram_data:
        return jsonify(histogram_data[year_str])
    else:
        # Return error if year not found
        return jsonify({
            "error": f"No data for year {year}"
        }), 404


# ========== RUN SERVER ==========

if __name__ == '__main__':
    """
    Start the Flask development server.
    Access it at: http://localhost:5000
    """
    print("\n" + "="*50)
    print("Starting Flask API server...")
    print("Access the API at: http://localhost:5000")
    print("="*50 + "\n")

    app.run(
        host='localhost',
        port=5000,
        debug=True
    )
