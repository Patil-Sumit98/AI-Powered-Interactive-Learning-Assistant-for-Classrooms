import React from 'react';
import { IconButton, TextField, Box } from '@mui/material';
import { Mic, Send, Image as ImageIcon } from '@mui/icons-material';

function InputArea({ input, setInput, handleSend, listening, toggleListening, handleImageUpload }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
      <input
        accept="image/*,.pdf"
        id="image-upload"
        type="file"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />
      <label htmlFor="image-upload">
        <IconButton color="primary" component="span">
          <ImageIcon />
        </IconButton>
      </label>

      <IconButton 
        color={listening ? 'error' : 'primary'} 
        onClick={toggleListening}
      >
        <Mic />
      </IconButton>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Ask a question..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      />

      <IconButton 
        color="primary" 
        onClick={handleSend}
        disabled={!input.trim()}
      >
        <Send />
      </IconButton>
    </Box>
  );
}

export default InputArea;
