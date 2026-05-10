import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User, Bot, Loader2, X, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChatInterface({ onClose, token }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your Neural ATS Assistant. How can I help you optimize your career trajectory today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { id: Date.now(), text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/chat/query', 
        { query: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const botMessage = { 
        id: Date.now() + 1, 
        text: response.data.response, 
        isBot: true 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "Neural Link interrupted. Please verify your connection.", 
        isBot: true,
        isError: true
      }]);
    }
    setLoading(false);
  };

  return (
    <div className="glass-card animate-slide-up" style={{
      position: 'fixed',
      bottom: '90px',
      right: '20px',
      width: '380px',
      height: '500px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      padding: 0,
      border: '1px solid var(--glass-border)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.03)'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <div className="pulse-dot"></div>
          <span style={{fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px'}}>NEURAL ASSISTANT</span>
        </div>
        <button onClick={onClose} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'}}>
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            alignSelf: msg.isBot ? 'flex-start' : 'flex-end',
            maxWidth: '85%',
            display: 'flex',
            gap: '10px',
            flexDirection: msg.isBot ? 'row' : 'row-reverse'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: msg.isBot ? 'var(--primary)' : 'var(--secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '4px'
            }}>
              {msg.isBot ? <Bot size={16} color="#000" /> : <User size={16} color="#000" />}
            </div>
            <div style={{
              padding: '12px 16px',
              borderRadius: '16px',
              borderTopLeftRadius: msg.isBot ? '4px' : '16px',
              borderTopRightRadius: msg.isBot ? '16px' : '4px',
              background: msg.isBot ? 'rgba(255,255,255,0.05)' : 'var(--secondary)',
              color: msg.isBot ? 'var(--text-main)' : '#000',
              fontSize: '13px',
              lineHeight: '1.5',
              border: msg.isBot ? '1px solid rgba(255,255,255,0.1)' : 'none'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{alignSelf: 'flex-start', display: 'flex', gap: '10px', alignItems: 'center'}}>
            <div style={{width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Loader2 size={16} className="spinning" />
            </div>
            <span style={{fontSize: '11px', color: 'var(--text-muted)'}}>Assistant is thinking...</span>
          </div>
        )}
      </div>

      {/* Shortcut */}
      <div style={{padding: '10px 20px', background: 'rgba(0, 229, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
         <button 
           onClick={() => navigate('/analyzer')}
           className="btn-glow" 
           style={{fontSize: '10px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '8px'}}
         >
           <Zap size={12} fill="currentColor" /> UPLOAD RESUME TO NEURAL ATS
         </button>
      </div>

      {/* Input */}
      <div style={{padding: '20px', borderTop: '1px solid var(--glass-border)'}}>
        <div style={{position: 'relative'}}>
          <input
            type="text"
            className="glass-input"
            placeholder="Type your query..."
            style={{paddingRight: '50px'}}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer'
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
