from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, origins=["http://localhost:3000"])

# Sample data
sample_data = [
    {"id": 1, "title": "Welcome to Flask Backend", "description": "Your Flask backend is running successfully!"},
    {"id": 2, "title": "API Endpoints", "description": "This backend provides RESTful API endpoints for your frontend."},
    {"id": 3, "title": "CORS Enabled", "description": "Cross-Origin Resource Sharing is configured to work with your Next.js frontend."}
]

@app.route('/')
def home():
    return jsonify({
        "message": "Flask Backend is running!",
        "status": "success",
        "endpoints": {
            "GET /api/data": "Get all data",
            "GET /api/data/<id>": "Get specific data by ID",
            "POST /api/data": "Create new data",
            "PUT /api/data/<id>": "Update data by ID",
            "DELETE /api/data/<id>": "Delete data by ID"
        }
    })

@app.route('/api/data', methods=['GET'])
def get_all_data():
    return jsonify({
        "data": sample_data,
        "count": len(sample_data)
    })

@app.route('/api/data/<int:data_id>', methods=['GET'])
def get_data(data_id):
    item = next((item for item in sample_data if item["id"] == data_id), None)
    if item:
        return jsonify({"data": item})
    return jsonify({"error": "Data not found"}), 404

@app.route('/api/data', methods=['POST'])
def create_data():
    data = request.get_json()
    if not data or 'title' not in data:
        return jsonify({"error": "Title is required"}), 400
    
    new_id = max([item["id"] for item in sample_data]) + 1 if sample_data else 1
    new_item = {
        "id": new_id,
        "title": data["title"],
        "description": data.get("description", "")
    }
    sample_data.append(new_item)
    return jsonify({"data": new_item, "message": "Data created successfully"}), 201

@app.route('/api/data/<int:data_id>', methods=['PUT'])
def update_data(data_id):
    data = request.get_json()
    item = next((item for item in sample_data if item["id"] == data_id), None)
    
    if not item:
        return jsonify({"error": "Data not found"}), 404
    
    if 'title' in data:
        item["title"] = data["title"]
    if 'description' in data:
        item["description"] = data["description"]
    
    return jsonify({"data": item, "message": "Data updated successfully"})

@app.route('/api/data/<int:data_id>', methods=['DELETE'])
def delete_data(data_id):
    global sample_data
    item = next((item for item in sample_data if item["id"] == data_id), None)
    
    if not item:
        return jsonify({"error": "Data not found"}), 404
    
    sample_data = [item for item in sample_data if item["id"] != data_id]
    return jsonify({"message": "Data deleted successfully"})

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "Backend is running properly"
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
