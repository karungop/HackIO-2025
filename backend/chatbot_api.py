from flask import Blueprint, jsonify, request
from groq import Groq
import os
from dotenv import load_dotenv
import requests
import xml.etree.ElementTree as ET
import re
from datetime import datetime

chatbot_bp = Blueprint('chatbot', __name__)

# This will be set when the blueprint is registered
_db = None

def init_chatbot_db(db_instance):
    """Initialize the database instance for the chatbot module"""
    global _db
    _db = db_instance

# Initialize Groq client
load_dotenv()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# Note: get_bill_xml_url() removed - we now use the stored XML link directly from Firestore
    
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

# Note: extract_bill_info_from_id() removed - we now use the stored XML link directly

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
                
                # Try to get XML content from the stored XML link
                xml_content = None
                xml_link = card.get('xml link', '')
                
                if xml_link:
                    # Use the stored XML link from Firestore
                    xml_content = scrape_xml_content(xml_link)
                    if xml_content is None:
                        print(f"Failed to scrape XML content for bill {bill_id} from {xml_link}")
                else:
                    print(f"No XML link found for bill {bill_id}")
                
                # Use XML content if available, otherwise fall back to description
                if xml_content:
                    context_str += f"\n--- {title} ---\n"
                    context_str += f"Bill ID: {bill_id}\n"
                    context_str += f"Full Bill Text:\n{xml_content}\n"
                else:
                    # Fallback to original behavior
                    context_str += f"- {title}: {description}\n"
        
        # Create the full prompt with context
        system_message = f"""You are Bill Finder Assistant, a friendly and helpful guide for people who have no background in government or politics. Your goal is to make complex government bills and legislation accessible to everyday people.

IMPORTANT GUIDELINES:
- Use simple, everyday language. Avoid government jargon and legal terms.
- If you must use technical terms, immediately explain them in plain language.
- Break down complex ideas into small, digestible pieces.
- Use analogies and real-world examples to explain abstract concepts.
- Structure your responses with clear headings and bullet points for easy reading.
- Be conversational and warm, like a helpful friend explaining something.
- Always relate information back to how it affects the person's daily life.

You have access to the following context:
{context_str}

When explaining bills:
1. Start with a simple summary in plain language
2. Explain what problem this bill is trying to solve (in simple terms)
3. Break down key points using short paragraphs and bullet points
4. Explain how this might affect everyday people
5. Use bold text for important points (wrap in **bold markers**)

Remember: The user doesn't know what "appropriations" means. They don't understand "committee hearings" or "floor votes". Explain things as if talking to a smart friend who knows nothing about government."""

        user_prompt = f"{user_message}"
        
        # Get chat history if provided
        chat_history = data.get('chatHistory', [])
        
        # Build message history
        messages = [
            {"role": "system", "content": system_message}
        ]
        
        # Add chat history (excluding system messages)
        for msg in chat_history:
            if msg.get('sender') == 'user':
                messages.append({"role": "user", "content": msg.get('text', '')})
            elif msg.get('sender') == 'bot':
                messages.append({"role": "assistant", "content": msg.get('text', '')})
        
        # Add current user message
        messages.append({"role": "user", "content": user_prompt})
        
        # Generate response using Groq
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages
        )
        
        bot_response = response.choices[0].message.content
        
        return jsonify({
            "success": True,
            "response": bot_response
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chatbot_bp.route('/api/chatbot/save-history', methods=['POST'])
def save_chat_history():
    """Save chat history for a user"""
    try:
        data = request.json
        user_id = data.get('user_id')
        chat_messages = data.get('messages', [])
        timestamp = data.get('timestamp', datetime.now())
        
        if not user_id:
            return jsonify({"error": "User ID required"}), 400
        
        if _db is None:
            return jsonify({"error": "Database not initialized"}), 500
        
        # Save chat history to Firestore
        chat_doc = _db.collection('chat_history').document(user_id)
        chat_doc.set({
            'messages': chat_messages,
            'updated_at': timestamp
        }, merge=True)
        
        return jsonify({
            "success": True,
            "message": "Chat history saved"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chatbot_bp.route('/api/chatbot/load-history', methods=['GET'])
def load_chat_history():
    """Load chat history for a user"""
    try:
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({"error": "User ID required"}), 400
        
        if _db is None:
            return jsonify({"error": "Database not initialized"}), 500
        
        # Load chat history from Firestore
        chat_doc = _db.collection('chat_history').document(user_id).get()
        
        if chat_doc.exists:
            chat_data = chat_doc.to_dict()
            messages = chat_data.get('messages', [])
            
            return jsonify({
                "success": True,
                "messages": messages
            })
        else:
            return jsonify({
                "success": True,
                "messages": []
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500