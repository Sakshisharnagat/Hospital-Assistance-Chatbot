# app.py
# ---------------------------------------------------------
# Ye Flask server hai jo templates/index.html ko serve karta hai
# aur /chat endpoint pe chatbot.py se jawab leke JS ko bhejta hai.
# Agar aapka app.py pehle se bana hua hai, to bas /chat wala route
# aur import line apne existing app.py mein copy kar lein.
# ---------------------------------------------------------

from flask import Flask, render_template, request, jsonify
from chatbot import get_response

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")
    session_id = data.get("session_id", "default")  # optional, agar multi-user chahiye

    reply = get_response(user_message, session_id)
    return jsonify({"response": reply})


if __name__ == "__main__":
    app.run(debug=True)