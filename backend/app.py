from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests
from groq import Groq

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"])

# Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL_NAME = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")  # configurable via .env
client = Groq(api_key=GROQ_API_KEY)

# Congress.gov API
CONGRESS_API_KEY = os.getenv("CONGRESS_API_KEY")
CONGRESS_API_ROOT = "https://api.congress.gov/v3"

# ---------------- Sample Data ----------------
sample_data = [
    {"id": 1, "title": "Welcome to Flask Backend", "description": "Your Flask backend is running successfully!"},
    {"id": 2, "title": "API Endpoints", "description": "This backend provides RESTful API endpoints for your frontend."},
    {"id": 3, "title": "CORS Enabled", "description": "Cross-Origin Resource Sharing is configured to work with your Next.js frontend."}
]

# ---------------- Helper Functions ----------------
def fetch_bill_summary(congress, bill_type, bill_number):
    url = f"{CONGRESS_API_ROOT}/bill/{congress}/{bill_type}/{bill_number}/summaries?api_key={CONGRESS_API_KEY}"
    resp = requests.get(url)
    resp.raise_for_status()
    data = resp.json()
    summaries = data.get("summaries", [])
    if summaries:
        return summaries[0].get("text", "")
    return ""

# ---------------- Routes ----------------

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
            "DELETE /api/data/<id>": "Delete data by ID",
            "GET /api/health": "Health check",
            "POST /api/analyze_bill": "Analyze bill with Groq"
        }
    })

# ---------------- Data CRUD ----------------
@app.route('/api/data', methods=['GET'])
def get_all_data():
    return jsonify({"data": sample_data, "count": len(sample_data)})

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
    sample_data = [i for i in sample_data if i["id"] != data_id]
    return jsonify({"message": "Data deleted successfully"})

# ---------------- Health Check ----------------
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Backend is running properly"})

# ---------------- Analyze Bill via Groq ----------------
@app.route("/api/analyze_bill", methods=["POST"])
def analyze_bill():
    data = request.get_json()
    desc = data.get("description")
    congress = data.get("congress")
    bill_type = data.get("billType")
    bill_number = data.get("billNumber")

    # Fetch summary if no description
    if not desc:
        if not (congress and bill_type and bill_number):
            return jsonify({"error": "Provide either a description or congress + billType + billNumber"}), 400
        try:
            desc = fetch_bill_summary(congress, bill_type, bill_number)
            if not desc:
                return jsonify({"error": "No summary available for this bill"}), 404
        except Exception as e:
            return jsonify({"error": f"Failed to fetch bill summary: {str(e)}"}), 500

    # Groq prompt with strict dropdown categories
    prompt = """
You are a policy analysis model that classifies government bills or amendments
based on which populations they affect. Always respond in strict JSON format
with only the exact options below.

Categories:

AgeGroup (choose one):
- "0-18"
- "19-25"
- "25-40"
- "41-65"
- "65+"

IncomeBracket (choose one):
- "$0-11,600"
- "$11,601-47,150"
- "$47,151-100,525"
- "$100,526+"

RaceOrEthnicity (choose one):
- "White"
- "Black"
- "Asian"
- "Other"

Location (choose one):
- "Urban"
- "Rural"
- "National"

Gender (choose one):
- "Male"
- "Female"
- "Other"

OtherGroups: optional array of any other specific groups affected (e.g., "Students", "Veterans").

Reasoning: short explanation of why each category was selected.
"""

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": desc}
            ],
            temperature=0.2
        )
        output = response.choices[0].message.content
        return jsonify({"analysis": output})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------- Run Server ----------------
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3001))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
