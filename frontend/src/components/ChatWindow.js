import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const ChatWindow = ({ messages, loading }) => {
  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        padding: 2,
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {messages.map((msg, idx) => (
        <Box
          key={idx}
          sx={{
            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            backgroundColor: msg.sender === 'user' ? '#e3f2fd' : '#eeeeee',
            padding: 1.5,
            borderRadius: 2,
            maxWidth: '75%',
          }}
        >
          {msg.image ? (
            <img
              src={`http://localhost:5000/${msg.image}`}
              alt="Uploaded"
              style={{ maxWidth: '100%', borderRadius: 8 }}
            />
          ) : (
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
          )}
        </Box>
      ))}
      {loading && <CircularProgress sx={{ alignSelf: 'center' }} />}
    </Box>
  );
};

export default ChatWindow;
