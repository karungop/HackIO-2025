from flask import Blueprint, jsonify, request
from groq import Groq
import os
from dotenv import load_dotenv
import requests
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
import re

chatbot_bp = Blueprint('chatbot', __name__)

# Initialize Groq client
load_dotenv()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def get_bill_xml_url(congress, bill_type, bill_number):
    """Get XML URL for a bill from Congress API"""
    CONGRESS_API_BASE = "https://api.congress.gov/v3"
    url = f"{CONGRESS_API_BASE}/bill/{congress}/{bill_type.lower()}/{bill_number}/text"
    params = {
        "format": "json",
        "api_key": os.getenv("CONGRESS_API_KEY")
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        text_versions = data.get("textVersions", [])
        if not text_versions:
            return None
            
        # Get the latest version
        latest_version = text_versions[0]
        formats = latest_version.get("formats", [])
        
        # Find the "Formatted XML" version
        xml_format = next((fmt for fmt in formats if fmt.get("type") == "Formatted XML"), None)
        if not xml_format:
            return None
            
        return xml_format.get("url")
    except Exception as e:
        print(f"Error fetching bill XML URL: {e}")
        return None
    
def scrape_xml_content(xml_url):
    """Scrape and clean XML content from the bill XML URL"""
    try:
        response = requests.get(xml_url)
        response.raise_for_status()
        
        # Parse XML
        root = ET.fromstring(response.content)
        
        # Extract text content, focusing on main sections
        text_content = []
        
        # Look for common bill sections
        sections_to_extract = [
            'title', 'section', 'subsection', 'paragraph', 'clause',
            'bill-text', 'legis-body', 'text'
        ]
        
        def extract_text_recursive(element, depth=0):
            if element.text and element.text.strip():
                text_content.append(element.text.strip())
            
            for child in element:
                extract_text_recursive(child, depth + 1)
                
            if element.tail and element.tail.strip():
                text_content.append(element.tail.strip())
        
        extract_text_recursive(root)
        
        # Join and clean the text
        full_text = ' '.join(text_content)
        
        # Clean up the text
        full_text = re.sub(r'\s+', ' ', full_text)  # Replace multiple spaces with single space
        full_text = re.sub(r'\n+', '\n', full_text)  # Replace multiple newlines with single newline
        
        # Limit length to avoid token limits (keep first 8000 characters)
        if len(full_text) > 8000:
            full_text = full_text[:8000] + "... [Content truncated]"
            
        return full_text
        
    except Exception as e:
        print(f"Error scraping XML content: {e}")
        return None

def extract_bill_info_from_id(bill_id):
    """Extract congress, type, and number from bill ID"""
    # Assuming bill_id format is like "118hr123" or "118s456"
    # This might need adjustment based on your actual bill ID format
    match = re.match(r'(\d+)([a-zA-Z]+)(\d+)', bill_id)
    if match:
        congress = match.group(1)
        bill_type = match.group(2).upper()
        bill_number = match.group(3)
        return congress, bill_type, bill_number
    return None, None, None

@chatbot_bp.route('/api/chatbot/message', methods=['POST'])
def send_message():
    """Handle chatbot message endpoint"""
    try:
        data = request.json
        user_message = data.get('message', '')
        
        # Get context (bills data, demographics, etc.)
        context = data.get('context', {})
        
        # Build context string for the prompt
        context_str = ""
        
        # Add demographic context
        demographics = context.get('demographics', {})
        if demographics:
            context_str += f"\nUser Demographics: {demographics}\n"
        
        # Add context cards (selected bills) with XML content
        context_cards = context.get('contextCards', [])
        if context_cards:
            context_str += "\nRelevant Bills Context:\n"
            for card in context_cards:
                bill_id = card.get('id', '')
                title = card.get('title', '')
                description = card.get('description', '')
                
                # Try to get XML content
                xml_content = None
                if bill_id:
                    congress, bill_type, bill_number = extract_bill_info_from_id(bill_id)
                    if congress and bill_type and bill_number:
                        xml_url = get_bill_xml_url(congress, bill_type, bill_number)
                        if xml_url:
                            xml_content = scrape_xml_content(xml_url)
                
                # Use XML content if available, otherwise fall back to description
                if xml_content:
                    context_str += f"\n--- {title} ---\n"
                    context_str += f"Bill ID: {bill_id}\n"
                    context_str += f"Full Bill Text:\n{xml_content}\n"
                else:
                    # Fallback to original behavior
                    context_str += f"- {title}: {description}\n"
        
        # Create the full prompt with context
        system_message = f"""You are Bill Finder Assistant, helping users understand legislation and how it affects them.

You have access to the following context:
{context_str}

Provide helpful, accurate information about bills and legislation. If the user asks about specific bills from the context, reference the full bill text provided. Focus on the actual legislative content rather than demographic analysis."""

        user_prompt = f"{user_message}"
        
        # Generate response using Groq
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_prompt}
            ]
        )
        
        bot_response = response.choices[0].message.content
        
        return jsonify({
            "success": True,
            "response": bot_response
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500