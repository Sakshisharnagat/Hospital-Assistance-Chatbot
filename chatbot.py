# chatbot.py
# ---------------------------------------------------------
# Ye file Gemini API ko call karti hai aur AIIMS Nagpur ki
# knowledge ke saath sawaalon ke jawab deti hai.
# ---------------------------------------------------------

import os
from dotenv import load_dotenv
import google.generativeai as genai
from hospital_info import HOSPITAL_NAME, HOSPITAL_KNOWLEDGE

# .env file se GEMINI_API_KEY load karo
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError(
        "GEMINI_API_KEY nahi mili. .env file mein ye line honi chahiye:\n"
        "GEMINI_API_KEY=your_actual_key_here"
    )

genai.configure(api_key=API_KEY)

# System instruction - ye chatbot ko batata hai ki wo kaun hai aur kaise behave kare
SYSTEM_INSTRUCTION = f"""
You are the official virtual assistant for {HOSPITAL_NAME}.
Answer only using the hospital information given below. Be polite, clear,
and concise. Reply in the same language the user writes in (Hindi, English,
or Hinglish).

If a question is outside what you know from the information below (like a
specific doctor's live availability, exact bed status today, or billing
details), say you don't have confirmed real-time information on that and
recommend the user call the hospital or check the official website/app.

If the user describes a medical emergency, tell them to call emergency
services or go to the nearest hospital immediately - never try to diagnose
or prescribe treatment.

--- HOSPITAL INFORMATION START ---
{HOSPITAL_KNOWLEDGE}
--- HOSPITAL INFORMATION END ---
"""

model = genai.GenerativeModel(
    model_name="gemini-3.6-flash",
    system_instruction=SYSTEM_INSTRUCTION,
)

# Har user ki chat history yaad rakhne ke liye (simple in-memory version)
_chat_sessions = {}


def get_response(user_message: str, session_id: str = "default") -> str:
    """
    User ka message leke Gemini se jawab leke deta hai.
    session_id alag-alag users/tabs ke liye alag conversation yaad rakhne ke kaam aata hai.
    """
    if not user_message or not user_message.strip():
        return "Kripya apna sawaal type karein."

    if session_id not in _chat_sessions:
        _chat_sessions[session_id] = model.start_chat(history=[])

    chat = _chat_sessions[session_id]

    try:
        response = chat.send_message(user_message)
        return response.text
    except Exception as e:
        return (
            "Maaf kijiye, abhi jawab dene mein dikkat aa rahi hai. "
            "Thodi der baad dobara try karein. "
            f"(Technical detail: {e})"
        )


# Isse standalone test karne ke liye (terminal mein: python chatbot.py)
if __name__ == "__main__":
    print(f"{HOSPITAL_NAME} Chatbot - test mode (exit karne ke liye 'quit' likhein)\n")
    while True:
        user_input = input("Aap: ")
        if user_input.strip().lower() in ("quit", "exit"):
            break
        print("Bot:", get_response(user_input))