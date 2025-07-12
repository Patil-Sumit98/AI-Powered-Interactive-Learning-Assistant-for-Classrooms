import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Box } from '@mui/material';
import ChatWindow from './components/ChatWindow';
import InputArea from './components/InputArea';
import logo from './logo.JPEG';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [lastUploadedImage, setLastUploadedImage] = useState(null);
  const recognitionRef = useRef(null);

  // Speech recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + ' ' + transcript);
        setListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setListening(false);
      };
    }

    return () => recognitionRef.current?.stop();
  }, []);

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  // Typing animation handler
  const typeOutResponse = (text) => {
    let index = 0;
    let animatedText = '';

    setMessages(prev => [...prev, { sender: 'bot', text: '' }]); // Placeholder

    const interval = setInterval(() => {
      if (index < text.length) {
        animatedText += text[index++];
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { sender: 'bot', text: animatedText };
          return updated;
        });
      } else {
        clearInterval(interval);
      }
    }, 20); // Typing speed (ms per character)
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInput('');

    try {
      let responseText = '';

      if (input.toLowerCase().includes('extract the text') && lastUploadedImage) {
        const res = await axios.post('http://localhost:5000/extract_text', {
          imagePath: lastUploadedImage
        });
        responseText = res.data.text || "No text found";
      } else {
        const res = await axios.post('http://localhost:5000/ask', { question: input });
        responseText = res.data.response || "No answer found";
      }

      typeOutResponse(responseText);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Error processing your request" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/upload_image', formData);
      const imageUrl = res.data.image_url;

      setLastUploadedImage(imageUrl);
      setMessages(prev => [...prev, { sender: 'user', image: imageUrl }]);
    } catch (err) {
      console.error("Image upload error:", err);
      setMessages(prev => [...prev, { sender: 'bot', text: "Error uploading image" }]);
    }
  };

  return (
    <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Typography
        variant="h4"
        sx={{
          my: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img src={logo} alt="logo" style={{ width: 90, height: 90, borderRadius: 30 }} />
          <span style={{ fontWeight: 600, fontSize: '2rem', color: 'black' }}>
            Edu <span style={{ color: '#e91e63' }}>Genie</span>
          </span>
        </Box>
        <Typography
          variant="subtitle1"
          sx={{
            color: 'black',
            letterSpacing: 2,
            fontSize: '0.7rem',
            fontWeight: 500,
            position: 'absolute',
            top: 73,
            left: 742
          }}
        >
          ASK. LEARN. GROW
        </Typography>
      </Typography>

      <ChatWindow messages={messages} loading={loading} />

      <InputArea
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        listening={listening}
        toggleListening={toggleListening}
        handleImageUpload={handleImageUpload}
      />
    </Container>
  );
}

export default App;
