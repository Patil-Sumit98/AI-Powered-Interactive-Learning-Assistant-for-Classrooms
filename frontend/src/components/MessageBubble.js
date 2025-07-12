import React from 'react';
import { Box, Paper } from '@mui/material';

const MessageBubble = ({ msg }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
        mb: 2
      }}
    >
      <Paper
        sx={{
          p: 2,
          maxWidth: '80%',
          bgcolor: msg.sender === 'user' ? '#e3f2fd' : '#f5f5f5',
          borderRadius: msg.sender === 'user' 
            ? '18px 18px 0 18px' 
            : '18px 18px 18px 0'
        }}
      >
        {msg.text}
      </Paper>
    </Box>
  );
};

export default MessageBubble;
