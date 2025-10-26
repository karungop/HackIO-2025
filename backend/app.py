

import os
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv

from chatbot_api import chatbot_bp
# from chatbot_websocket import register_chatbot_websockets
# from flask_socketio import SocketIO


import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import json
import re

cred = credentials.Certificate("billfinder-28004-firebase-adminsdk-fbsvc-45403f54e0.json")
firebase_admin.initialize_app(cred)

db = firestore.client()


load_dotenv()

app = Flask(__name__)
CORS(app) 
# socketio = SocketIO(app, cors_allowed_origins="*")
app.register_blueprint(chatbot_bp)
# register_chatbot_websockets(socketio)
 # Enable CORS for frontend-backend communication

# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Firestore query functions
def query_bills_by_demographics(demographics):
    """
    Query Firestore for bills that match the provided demographics.
    Returns up to 10 bills that have at least one matching demographic field.
    """
    try:
        # Get all bills from Firestore ordered by timestamp (most recent first)
        # If timestamp doesn't exist, fall back to document ID ordering
        bills_ref = db.collection('bills')
        try:
            bills = bills_ref.order_by('date', direction=firestore.Query.DESCENDING).limit(100).stream()
            print("Using date ordering")
        except Exception as e:
            print(f"Date ordering failed: {e}, using fallback")
            # Fallback if date field doesn't exist
            bills = bills_ref.limit(100).stream()
        
        matching_bills = []
        
        for bill_doc in bills:
            bill_data = bill_doc.to_dict()
            bill_id = bill_doc.id
            
            # Check if bill matches user demographics
            has_match = False
            if any(demographics.values()):  # If user provided any demographics
                if 'demographics' in bill_data and bill_data['demographics']:
                    bill_demographics = bill_data['demographics']
                    
                    # Check each demographic field for matches (excluding other_groups)
                    for field, user_values in demographics.items():
                        if field == 'other_groups':
                            continue  # Skip other_groups as requested
                            
                        if field in bill_demographics:
                            bill_values = bill_demographics[field] if isinstance(bill_demographics[field], list) else [bill_demographics[field]]
                            user_values_list = user_values if isinstance(user_values, list) else [user_values]
                            
                            # Only include bills that have matching demographic data
                            if bill_values and any(bill_values):  # Check if not empty
                                if any(value in bill_values for value in user_values_list):
                                    has_match = True
                                    break
                            # If bill has no demographic data for this field, do NOT include it
                            # (only include bills with specific demographic targeting)
                            else:
                                has_match = False
                                break
            else:
                # If no user demographics, include all bills
                has_match = True
            
            if has_match:
                # Use latest action date if available, otherwise use regular date
                latest_action_date = bill_data.get('latest action date', 'N/A')
                
                matching_bills.append({
                    'id': bill_id,
                    'title': bill_data.get('title', 'No title available'),
                    'description': bill_data.get('summary', 'No description available'),
                    'update_date': latest_action_date,
                    'affected_populations_summary': bill_data.get('demographics', ''),
                    'categorized_populations': bill_data.get('demographics', ''),
                    'population_affect_summary': bill_data.get('population affect summary', 'No population analysis available'),
                    'bill_number': bill_id
                })
                
                # Stop at 10 bills
                if len(matching_bills) >= 10:
                    break
        
        return matching_bills
        
    except Exception as e:
        print(f"Error querying Firestore: {str(e)}")
        return []

def get_top_10_bills():
    """
    Get the top 10 bills from Firestore (most recent by timestamp).
    """
    try:
        bills_ref = db.collection('bills')
        print(f"Querying Firestore collection 'bills'...")
        
        try:
            bills = bills_ref.order_by('date', direction=firestore.Query.DESCENDING).limit(10).stream()
            print("Using date ordering")
        except Exception as e:
            print(f"Date ordering failed: {e}, using fallback")
            # Fallback if date field doesn't exist
            bills = bills_ref.limit(10).stream()
        
        top_bills = []
        bill_count = 0
        
        for bill_doc in bills:
            bill_count += 1
            bill_data = bill_doc.to_dict()
            bill_id = bill_doc.id
            
            print(f"Found bill {bill_count}: {bill_id}")
            print(f"Bill data keys: {list(bill_data.keys())}")
            
            # Use latest action date if available, otherwise use regular date
            latest_action_date = bill_data.get('latest action date') or bill_data.get('date', 'N/A')
            
            top_bills.append({
                'id': bill_id,
                'title': bill_data.get('title', 'No title available'),
                'description': bill_data.get('summary', 'No description available'),
                'update_date': latest_action_date,
                'affected_populations_summary': bill_data.get('demographics', ''),
                'categorized_populations': bill_data.get('demographics', ''),
                'population_affect_summary': bill_data.get('population affect summary', 'No population analysis available'),
                'bill_number': bill_id
            })
        
        print(f"Total bills found: {bill_count}")
        return top_bills
        
    except Exception as e:
        print(f"Error getting top bills from Firestore: {str(e)}")
        return []

# Fetch recent bills from the U.S. Congress API
def fetch_recent_bills():
    url = "https://api.congress.gov/v3/bill"
    headers = {
        "X-API-Key": os.getenv("CONGRESS_API_KEY")
    }
    params = {
        "limit": 100,
        "sort": "updateDate desc",
        "format": "json"
    }
    response = requests.get(url, headers=headers, params=params)
    return response.json()

def get_bill_summary(congress, bill_type, bill_number):
    CONGRESS_API_BASE = "https://api.congress.gov/v3"
    url = f"{CONGRESS_API_BASE}/bill/{congress}/{bill_type.lower()}/{bill_number}/summaries"
    params = {
        "format": "json",
        "api_key": os.getenv("CONGRESS_API_KEY")
    }
    response = requests.get(url, params=params)
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Error fetching bill summary: {e}")
        return None
    
    data = response.json()
    summaries = data.get("summaries", [])

    if not summaries:
        return None

    # Typically the first entry is the latest summary
    latest_summary = summaries[0].get("text", "")
    return latest_summary

# Analyze bill description to determine affected populations
def analyze_bill_population(title, description):
    prompt = f"""Analyze the following bill and identify the specific populations that would be affected by it.

Bill Title: {title}
Bill Description: {description}

Please identify and categorize the affected populations into these brackets:
- Age groups (children, youth, working-age adults, seniors, etc.)
- Economic groups (low-income, middle-class, wealthy, small businesses, corporations, etc.)
- Geographic areas (rural, urban, specific states/regions, etc.)
- Occupational groups (farmers, healthcare workers, teachers, veterans, etc.)
- Other demographic groups (students, homeowners, immigrants, disabled persons, etc.)

Provide a concise summary of which populations are primarily affected and how. Do not mention that this is based off the bill title. """

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

# Categorize populations into specified brackets
def categorize_population(population_analysis):
    """
    Convert Groq AI free-text population analysis into structured categories
    using the specified options.
    """
    prompt = f"""
Based on this population analysis, extract and categorize the affected groups 
into ONLY the following options:

Age:
0-18, 19-25, 25-40, 41-65, 65+

Income:
$0-11,600, $11,601-47,150, $47,151-100,525, $100,526+

Race:
White, Black, Asian, Other

Location:
Urban, Rural, National

Gender:
Male, Female, Other

Population Analysis:
{population_analysis}

Return ONLY a JSON object like this (use empty arrays if none apply) Have NO text outside of the json:

{{
    "age_groups": [],
    "income_brackets": [],
    "race_or_ethnicity": [],
    "location": [],
    "gender": []
}}
"""
    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content



@app.route('/api/analyze_bills', methods=['GET'])
def analyze_bills():
    try:
        bills_data = fetch_recent_bills()
        analyzed_bills = []

        # Check if we got bills back
        if 'bills' not in bills_data:
            return jsonify({"error": "No bills found in API response", "data": bills_data}), 500

        for bill in bills_data['bills'][:2]:  # Limit to 2 bills
            title = bill.get('title', 'No title available')
            # Get the latest action as description if no description field
            latest_action = bill.get('latestAction', {})
            description = latest_action.get('text', 'No description available')
            
            # Analyze populations
            affected_populations = analyze_bill_population(title, description)
            categorized_populations = categorize_population(affected_populations)
            
            analyzed_bills.append({
                'bill_number': bill.get('number', 'N/A'),
                'title': title,
                'description': description,
                'update_date': bill.get('updateDate', 'N/A'),
                'affected_populations_summary': affected_populations,
                'categorized_populations': categorized_populations
            })

        return jsonify({
            "success": True,
            "count": len(analyzed_bills),
            "bills": analyzed_bills
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/data', methods=['GET'])
def get_data():
    """
    Endpoint that frontend expects for bill data.
    Queries Firestore based on demographics or returns top 10 bills.
    """
    try:
        # Get demographics from query parameters
        demographics = {}
        demographic_fields = ['age_groups', 'income_brackets', 'race_or_ethnicity', 'location', 'gender', 'other_groups']
        
        for field in demographic_fields:
            value = request.args.get(field)
            if value:
                # URL decode the value first, then handle comma-separated values
                import urllib.parse
                decoded_value = urllib.parse.unquote(value)
                demographics[field] = [v.strip() for v in decoded_value.split(',') if v.strip()]
        
        # Check if any demographics are provided
        has_demographics = any(demographics.values())
        
        if has_demographics:
            # Query bills that match demographics
            bills = query_bills_by_demographics(demographics)
        else:
            # Get top 10 bills if no demographics
            bills = get_top_10_bills()
        
        return jsonify({
            "success": True,
            "data": bills,
            "count": len(bills),
            "filtered_by_demographics": has_demographics
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/demographics', methods=['POST'])
def submit_demographics():
    """Endpoint for submitting demographic data"""
    try:
        # For now, just return success - you can implement storage later
        return jsonify({"success": True, "message": "Demographics submitted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
def parse_demographics(raw_text):
    # Remove markdown-style ```json and ``` markers
    clean_text = re.sub(r"```json|```", "", raw_text).strip()

    # Parse as JSON
    try:
        data = json.loads(clean_text)
        return data
    except json.JSONDecodeError as e:
        print("Error parsing demographics JSON:", e)
        return None

def add_bill(bill_id, title,original, summary,raw_text, affected_population_summary, latest_action_date):
    bill_ref = db.collection("bills").document(bill_id)
    print(raw_text)
    demographics = parse_demographics(raw_text)
    # demographics = raw_text
    date = datetime.now()
    if(original != None):
        bill_ref.set({
            "title": title,
            "original":original,
            "summary": summary,
            "date": date,
            "demographics": demographics, 
            "population affect summary": affected_population_summary, 
            "latest action date":latest_action_date
        })
        print(f"✅ Added bill: {title}")


# Test function to demonstrate functionality
def test_analyze_bills():
    """Test the bill analysis without running the Flask server"""
    print("Testing Bill Analysis System")
    print("=" * 80)
    
    try:
        # Fetch bills
        print("\n1. Fetching recent bills from Congress API...")
        bills_data = fetch_recent_bills()
        
        if 'bills' not in bills_data:
            print(f"Error: No bills found. Response: {bills_data}")
            return
        
        print(f"✓ Found {len(bills_data['bills'])} bills")
        
        # Analyze first 2 bills
        for i, bill in enumerate(bills_data['bills'][:], 1):
            print(f"\n{'-' * 80}")
            print(f"BILL {i}")
            print(f"{'-' * 80}")
            # print(bill)
            
            title = bill.get('title', 'No title available')
            latest_action = bill.get('latestAction', {})
            description = latest_action.get('text', 'No description available')

            summary_text = get_bill_summary(
                congress=bill.get('congress'),
                bill_type=bill.get('type'),
                bill_number=bill.get('number')
            )
            # print(summary_text)
            latest_action_date = bill.get("latestAction").get("actionDate")
            
            # print(f"\nBill Number: {bill.get('number', 'N/A')}")
            # print(f"Title: {title}")
            # print(f"Latest Action: {description}")
            # print(f"Update Date: {bill.get('updateDate', 'N/A')}")
            
            # print("\n2. Analyzing affected populations with Groq AI...")
            affected_populations = analyze_bill_population(title, description)
            # print(f"\nAffected Populations Analysis:")
            print(affected_populations)
            
            # print("\n3. Categorizing populations...")
            categorized = categorize_population(affected_populations)
            # print(f"\nCategorized Populations:")
            # print(categorized)
            # print()
            add_bill(bill.get('number'),title,summary_text, description, categorized, affected_populations, latest_action_date)
    
    except Exception as e:
        print(f"\n Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    # Uncomment to test without running server
    # test_analyze_bills()
    
    # Run Flask server
    app.run(debug=True, port=3001, host='0.0.0.0')
    # socketio.run(app, debug=True, port=3001, host='0.0.0.0')





