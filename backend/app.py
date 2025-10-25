import os
import requests
from flask import Flask, jsonify
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Fetch recent bills from the U.S. Congress API
def fetch_recent_bills():
    url = "https://api.congress.gov/v3/bill"
    headers = {
        "X-API-Key": os.getenv("CONGRESS_API_KEY")
    }
    params = {
        "limit": 2,
        "sort": "updateDate desc",
        "format": "json"
    }
    response = requests.get(url, headers=headers, params=params)
    return response.json()

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

Provide a concise summary of which populations are primarily affected and how."""

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
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

Return ONLY a JSON object like this (use empty arrays if none apply):

{{
    "age_groups": [],
    "income_brackets": [],
    "race_or_ethnicity": [],
    "location": [],
    "gender": [],
    "other_groups": []
}}
"""
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
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
        for i, bill in enumerate(bills_data['bills'][:2], 1):
            print(f"\n{'-' * 80}")
            print(f"BILL {i}")
            print(f"{'-' * 80}")
            
            title = bill.get('title', 'No title available')
            latest_action = bill.get('latestAction', {})
            description = latest_action.get('text', 'No description available')
            
            print(f"\nBill Number: {bill.get('number', 'N/A')}")
            print(f"Title: {title}")
            print(f"Latest Action: {description}")
            print(f"Update Date: {bill.get('updateDate', 'N/A')}")
            
            print("\n2. Analyzing affected populations with Groq AI...")
            affected_populations = analyze_bill_population(title, description)
            print(f"\nAffected Populations Analysis:")
            print(affected_populations)
            
            print("\n3. Categorizing populations...")
            categorized = categorize_population(affected_populations)
            print(f"\nCategorized Populations:")
            print(categorized)
            print()
    
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    # Uncomment to test without running server
    test_analyze_bills()
    
    # Uncomment to run Flask server
    # app.run(debug=True, port=3001)