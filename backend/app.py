from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import tempfile
import speech_recognition as sr
from PIL import Image
import pytesseract
from transformers import AutoTokenizer
from optimum.intel import OVModelForCausalLM
import time
import re

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Tesseract path for Windows
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Speech recognition setup
recognizer = sr.Recognizer()

# Load Tokenizer and Model
model_name = "microsoft/phi-2"
print("📦 Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(
    model_name,
    trust_remote_code=True,
    padding_side="left"
)
tokenizer.pad_token = tokenizer.eos_token

print("⚡ Loading OpenVINO model...")
start_time = time.time()
model = OVModelForCausalLM.from_pretrained(
    model_name,
    export=True,
    device="CPU",
    trust_remote_code=True,
    ov_config={"PERFORMANCE_HINT": "LATENCY"}
)
print(f"✅ Model loaded in {time.time() - start_time:.2f} seconds")

# Save model and tokenizer locally
MODEL_SAVE_PATH = "../models/phi2_openvino"
if not os.path.exists(MODEL_SAVE_PATH):
    print("💾 Saving OpenVINO model...")
    model.save_pretrained(MODEL_SAVE_PATH)
    tokenizer.save_pretrained(MODEL_SAVE_PATH)

# Last image reference
last_image = None

@app.route('/upload_image', methods=['POST'])
def upload_image():
    global last_image
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    filename = os.path.basename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    last_image = filename

    return jsonify({
        'image_url': f'/uploads/{filename}',
        'message': 'Image uploaded successfully'
    })

@app.route('/uploads/<filename>')
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/extract_text', methods=['POST'])
def extract_text():
    global last_image
    if not last_image:
        return jsonify({'text': '', 'error': 'No image available'}), 400

    try:
        img_path = os.path.join(app.config['UPLOAD_FOLDER'], last_image)
        img = Image.open(img_path)
        text = pytesseract.image_to_string(img).strip()
        return jsonify({'text': text or 'No readable text found'})
    except Exception as e:
        return jsonify({'text': '', 'error': f'OCR Error: {str(e)}'}), 500

@app.route('/ask', methods=['POST'])
def ask():
    global chat_history
    data = request.get_json()
    question = data.get('question', '').strip()

    if not question:
        return jsonify({'response': '', 'error': 'Empty question'}), 400

    prompt = f"You are an educational assistant. Answer the question clearly and informatively.\nQuestion: {question}\nAnswer:"

    try:
        inputs = tokenizer(
            prompt,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=512
        )

        outputs = model.generate(
            **inputs,
            max_new_tokens=300,  # 🛠️ Increase token limit for longer answers
            temperature=0.7,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id,  # 🔁 Ensure complete stopping
        )

        full_response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        answer = full_response.replace(prompt, "").strip()

        return jsonify({'response': answer})

    except Exception as e:
        return jsonify({'response': '', 'error': f'Error generating answer: {str(e)}'}), 500

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file'}), 400

    try:
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
            request.files['audio'].save(tmp.name)

            with sr.AudioFile(tmp.name) as source:
                audio = recognizer.record(source)
                text = recognizer.recognize_google(audio)
                return jsonify({'text': text})

    except sr.UnknownValueError:
        return jsonify({'text': '', 'error': 'Could not understand audio'})
    except Exception as e:
        return jsonify({'text': '', 'error': f'Transcription error: {str(e)}'})
    finally:
        if os.path.exists(tmp.name):
            os.unlink(tmp.name)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)
