import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const SUGGESTED_PROMPTS = [
  'How much did I spend this month?',
  'Where did I spend the most money?',
  'How much did I spend on food?',
  'How much is remaining in my food budget?',
  'How can I save ₹5,000 next month?'
];

const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${user?.name || ''}! I am your AI Financial Assistant. I analyze only your verified financial records to answer questions about your expenses, budgets, and savings goals. How can I help today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { query: textToSend });
      const aiReply = { sender: 'ai', text: res.data.data?.reply || 'I could not retrieve an answer.' };
      setMessages(prev => [...prev, aiReply]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Error connecting to financial assistant. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bot size={24} color="var(--accent-purple)" />
            <span>AI Financial Assistant</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Private conversational intelligence isolated exclusively to your account
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--success)' }}>
          <ShieldCheck size={16} />
          <span>Zero Multi-Tenant Leakage Guarantee</span>
        </div>
      </div>

      {/* Suggested Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="btn btn-secondary btn-sm"
            style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', borderRadius: '9999px' }}
          >
            <Sparkles size={13} color="var(--primary-500)" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div
        className="card"
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1.5rem',
          marginBottom: '1rem',
          backgroundColor: 'rgba(17, 24, 39, 0.7)'
        }}
      >
        {messages.map((msg, idx) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
                alignSelf: isAi ? 'flex-start' : 'flex-end',
                maxWidth: '82%'
              }}
            >
              {isAi && (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--accent-gradient)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Bot size={18} />
                </div>
              )}

              <div
                style={{
                  background: isAi ? 'var(--bg-card)' : 'var(--primary-gradient)',
                  color: 'var(--text-primary)',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '14px',
                  borderTopLeftRadius: isAi ? '2px' : '14px',
                  borderTopRightRadius: isAi ? '14px' : '2px',
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  border: isAi ? '1px solid var(--border-subtle)' : 'none',
                  boxShadow: 'var(--shadow-sm)',
                  whiteSpace: 'pre-line'
                }}
              >
                {msg.text}
              </div>

              {!isAi && (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <User size={16} />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', alignSelf: 'flex-start' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--accent-gradient)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Loader2 size={16} className="spinner" />
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Gemini AI is analyzing your transactions...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
      >
        <input
          type="text"
          className="form-input"
          style={{ flex: 1, padding: '0.85rem 1.25rem', borderRadius: '12px' }}
          placeholder="Ask a question about your spending, budget, or savings..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn btn-primary"
          style={{ padding: '0.85rem 1.5rem', borderRadius: '12px' }}
        >
          <Send size={16} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
