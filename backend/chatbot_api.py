from flask import Blueprint, jsonify, request
from groq import Groq
import os
from dotenv import load_dotenv


chatbot_bp = Blueprint('chatbot', __name__)

# Initialize Groq client (you'll pass this or load it here)
load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@chatbot_bp.route('/api/chatbot/message', methods=['POST'])
def send_message():
    """Handle chatbot message endpoint"""
    try:
        data = request.json
        user_message = data.get('message', '')
        
        # Get context (bills data, demographics, etc.)
        context = data.get('context', {})
        
        # Generate response using Groq
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are Bill Finder Assistant, helping users understand legislation..."},
                {"role": "user", "content": user_message}
            ]
        )
        
        bot_response = response.choices[0].message.content
        
        return jsonify({
            "success": True,
            "response": bot_response
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500