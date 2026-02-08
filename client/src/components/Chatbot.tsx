import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';
import api from '../lib/api';

interface Message {
  id?: string;
  patient_id: string;
  sender: 'patient' | 'bot';
  content: string;
  created_at?: string;
}

interface ChatbotProps {
  patientId: string;
}

function Chatbot({ patientId }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat history on component mount
  useEffect(() => {
    async function fetchChatHistory() {
      try {
        const response = await api.get('/chatbot-messages');
        const patientMessages = (response.data || []).filter(
          (msg: Message) => msg.patient_id === patientId
        );
        setMessages(patientMessages);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setInitialLoading(false);
      }
    }
    fetchChatHistory();
  }, [patientId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      patient_id: patientId,
      sender: 'patient',
      content: inputValue,
    };

    // Add user message to UI immediately
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Send message to backend and get bot response
      const response = await api.post('/chat', {
        patient_id: patientId,
        message: inputValue,
      });

      // Add bot message to UI
      const botMessage: Message = {
        patient_id: patientId,
        sender: 'bot',
        content: response.data.reply,
      };
      setMessages((prev) => [...prev, botMessage]);

      // Play bot reply as speech
      try {
        const ttsResponse = await api.post(
          '/text-to-speech',
          { text: response.data.reply },
          { responseType: 'blob' }
        );
        const audioBlob = new Blob([ttsResponse.data], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.addEventListener('ended', () => URL.revokeObjectURL(audioUrl));
        audio.play();
      } catch (ttsError) {
        console.error('TTS playback failed:', ttsError);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        patient_id: patientId,
        sender: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (
      window.confirm(
        'Are you sure you want to clear the chat history? This action cannot be undone.'
      )
    ) {
      try {
        // Delete all messages for this patient
        for (const msg of messages) {
          if (msg.id) {
            await api.delete(`/chatbot-messages/${msg.id}`);
          }
        }
        setMessages([]);
      } catch (error) {
        console.error('Failed to clear chat:', error);
      }
    }
  };

  if (initialLoading) {
    return (
      <Paper
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '500px',
        bgcolor: '#f5f5f5',
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: '#1976d2',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">Chat Assistant</Typography>
        <IconButton
          size="small"
          onClick={handleClearChat}
          sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
          title="Clear chat history"
        >
          <ClearIcon />
        </IconButton>
      </Box>

      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          bgcolor: '#fff',
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              color: '#999',
            }}
          >
            <Typography variant="body2">
              Start a conversation with the assistant...
            </Typography>
          </Box>
        ) : (
          messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent:
                  msg.sender === 'patient' ? 'flex-end' : 'flex-start',
                mb: 1,
              }}
            >
              <Paper
                sx={{
                  maxWidth: '70%',
                  p: 1.5,
                  bgcolor:
                    msg.sender === 'patient' ? '#1976d2' : '#e0e0e0',
                  color:
                    msg.sender === 'patient' ? 'white' : 'black',
                }}
              >
                <Typography variant="body2">{msg.content}</Typography>
              </Paper>
            </Box>
          ))
        )}
        {loading && (
          <Box sx={{ display: 'flex', gap: 1, align: 'center' }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Assistant is typing...
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input Area */}
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
          display: 'flex',
          gap: 1,
          bgcolor: '#f5f5f5',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={loading}
          multiline
          maxRows={3}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white',
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!inputValue.trim() || loading}
          startIcon={<SendIcon />}
          sx={{ alignSelf: 'flex-end' }}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
}

export default Chatbot;
