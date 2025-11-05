import os
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.oauth2 import service_account
from google.cloud import speech
import gspread
from datetime import datetime
import sys # Import sys for path checking

# --- Configuration ---

# Get the PythonAnywhere username, or default to an empty string
# On your local PC, this will be empty. On the server, it will be 'IzhanRahman'
PA_USERNAME = os.environ.get('USER', '')

if PA_USERNAME:
    # --- Production Path (on PythonAnywhere) ---
    # This path will look like: /home/IzhanRahman/career-visualizer/google-creds.json
    CRED_FILE_PATH = f'/home/{PA_USERNAME}/career-visualizer/google-creds.json'
else:
    # --- Local Development Path (Your Windows PC) ---
    # This looks for 'google-creds.json' in the *same* (server) folder as app.py
    CRED_FILE_PATH = os.path.join(os.path.dirname(__file__), 'google-creds.json')

# This is your Google Sheet ID
SHEET_ID = '1rRWk0sSMs2N-Jc1WiaLO544p1KLUcN0ctRezN6lZjq8'

# Your user database
USERS = {
    "admin@school.com": {"password": "password123", "role": "admin"},
    "teacher1@school.com": {"password": "user123", "role": "user"},
    "teacher2@school.com": {"password": "user123", "role": "user"},
    "teacher3@school.com": {"password": "user123", "role": "user"},
}

# --- App Setup ---
app = Flask(__name__)
CORS(app) # Allow requests from your Netlify app

# --- Google API Setup ---
SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/cloud-platform'
]

# Load credentials from the file
try:
    creds = service_account.Credentials.from_service_account_file(CRED_FILE_PATH, scopes=SCOPES)
    gc = gspread.authorize(creds)
    speech_client = speech.SpeechClient(credentials=creds)
    sheet = gc.open_by_key(SHEET_ID).sheet1
    print("--- Successfully connected to Google APIs ---", file=sys.stderr)
except Exception as e:
    print(f"!!! FAILED TO LOAD GOOGLE CREDS: {e} !!!", file=sys.stderr)
    print(f"!!! Make sure '{CRED_FILE_PATH}' exists and is shared with your sheet !!!", file=sys.stderr)

# --- API Endpoints ---

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    user = USERS.get(email)
    if user and user['password'] == password:
        return jsonify({"success": True, "role": user['role']})
    else:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route('/record', methods=['POST'])
def record():
    data = request.json
    name = data.get('name')
    career = data.get('career')
    if not name or not career:
        return jsonify({"success": False, "message": "Missing name or career"}), 400
    try:
        date = datetime.now().strftime('%d-%m-%Y')
        sheet.append_row([name, career, date])
        print(f"Record saved to Google Sheet: {name}, {career}, {date}", file=sys.stderr)
        return jsonify({"success": True, "message": "Record saved"})
    except Exception as e:
        print(f"Failed to write to Google Sheet: {e}", file=sys.stderr)
        return jsonify({"success": False, "message": "Failed to save record"}), 500

@app.route('/transcribe', methods=['POST'])
def transcribe():
    data = request.json
    if 'audioData' not in data:
        return jsonify({"success": False, "message": "No audio data"}), 400
    try:
        audio_bytes = base64.b64decode(data['audioData'].split(',')[1])
        audio = speech.RecognitionAudio(content=audio_bytes)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sample_rate_hertz=48000,
            language_code="en-IN",
            model="latest_long",
            audio_channel_count=1
        )
        response = speech_client.recognize(config=config, audio=audio)
        if not response.results:
            print("Google Speech AI returned no results.", file=sys.stderr)
            return jsonify({"success": False, "transcript": ""})
        transcript = response.results[0].alternatives[0].transcript
        print(f"Google AI transcript: {transcript}", file=sys.stderr)
        return jsonify({"success": True, "transcript": transcript})
    except Exception as e:
        print(f"Google Speech-to-Text Error: {e}", file=sys.stderr)
        return jsonify({"success": False, "message": "Failed to transcribe audio"}), 500

if __name__ == '__main__':
    # This part is for local testing (python app.py)
    app.run(debug=True, port=5000)