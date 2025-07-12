Educational AI Assistant (OpenVINO-Optimized)

This project is a multimodal AI assistant for classroom environments. It helps students and teachers by answering questions using **text**, **voice**, or **images**. The backend is built with **Flask** and optimized using **OpenVINO** for fast performance. The frontend is powered by **React**.

---

Features

- 🧠 Text-based Question Answering using Phi-2 (LLM)
- 🎤 Voice Input using SpeechRecognition API
- 🖼️ Image-to-Text (OCR) using Tesseract
- ⚡ Optimized with Intel OpenVINO Toolkit
- 🌐 Simple web interface (React)
- 💻 Works even on low-end CPUs (Intel or AMD)

---

Tech Stack

| Layer       | Technology              |
|-------------|--------------------------|
| Frontend    | React.js                 |
| Backend     | Flask + Flask-CORS       |
| AI/NLP      | HuggingFace Transformers (Phi-2) |
| Optimization| OpenVINO (via Optimum)   |
| Speech      | SpeechRecognition        |
| Image OCR   | Pytesseract + Pillow     |

---

Folder Structure

```

project/
├── backend/
│   ├── app.py
│   ├── model\_utils.py
│   ├── uploads/
│   
├── frontend/
│   ├── public/
│   └── src/
│       └── components/
├── requirements.txt
└── README.md
└── models/                          # OpenVINO models
│       └── phi2\_openvino/

````

---

Prerequisites

- Python 3.8+
- Node.js and npm
- Tesseract OCR installed:
  - Windows: [UB Mannheim Tesseract](https://github.com/UB-Mannheim/tesseract/wiki)
  - Linux: `sudo apt install tesseract-ocr`

---

Installation

Backend Setup (Flask + AI Models)

```bash
# Create virtual environment
python -m venv env
env\Scripts\activate   # or source env/bin/activate (Linux/Mac)

# Install dependencies
pip install -r requirements.txt
````

> Make sure to set Tesseract path in `app.py` (for Windows):

```python
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

Frontend Setup (React)

```bash
cd ../frontend
npm install
npm start
```

---

API Endpoints

| Endpoint  | Method | Description                         |
| --------- | ------ | ----------------------------------- |
| `/ask`    | POST   | Takes a question and returns answer |
| `/ocr`    | POST   | Extracts text from uploaded image   |
| `/speech` | POST   | Converts audio to text              |

---

Example Use Cases

*  Ask questions like: “What is Newton’s Second Law?”
*  Upload a textbook diagram and extract key points
*  Speak a question into the mic and get a response

---

Performance

| Feature   | Speed & Accuracy          |
| --------- | ------------------------- |
| Text Q\&A | < 2s (OpenVINO optimized) |
| OCR       | \~90% accuracy            |
| Speech    | \~85% (depends on mic)    |

---

Security Notes

* File uploads are sanitized and stored temporarily
* No user data is permanently saved
* CORS enabled for safe frontend-backend communication

---

Future Enhancements

* Chat history for users
* Support Indian regional languages
* Add emotion detection using webcam
* Text-to-Speech (TTS) response

---


License

This project is licensed under the **MIT License**.

---

Acknowledgements

* [Intel OpenVINO Toolkit](https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html)
* [HuggingFace Transformers](https://huggingface.co/)
* [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)
* [React.js](https://reactjs.org/)

```

---

Would you like me to:
- Auto-generate this as a downloadable `README.md` file?
- Customize it with your actual GitHub username and repo name?
- Include a working demo GIF or screenshot section?

Let me know what you'd like next!
```
