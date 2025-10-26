from flask import Blueprint, jsonify, request
from groq import Groq
import os
from dotenv import load_dotenv

chatbot_bp = Blueprint('chatbot', __name__)

# Initialize Groq client
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
        
        # Build context string for the prompt
        context_str = ""
        
        # Add demographic context
        demographics = context.get('demographics', {})
        if demographics:
            context_str += f"\nUser Demographics: {demographics}\n"
        
        # Add context cards (selected bills)
        context_cards = context.get('contextCards', [])
        if context_cards:
            context_str += "\nRelevant Bills Context:\n"
            for card in context_cards:
                context_str += f"- {card.get('title', '')}: {card.get('description', '')}\n"
        
        # Create the full prompt with context
        system_message = f"""You are Bill Finder Assistant, helping users understand legislation and how it affects them.

You have access to the following context:
{context_str}

Provide helpful, accurate information about bills and legislation. If the user asks about specific bills from the context, reference them."""

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