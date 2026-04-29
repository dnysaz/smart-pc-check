'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, Download, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AskAIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('smartpcchecker_chat_session');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      const initial: Message[] = [
        { role: 'assistant', content: "Hello! I'm SmartPCChecker AI, your dedicated computer technician. I ONLY answer questions related to computers, hardware, and accessories. How can I help you today?" }
      ];
      setMessages(initial);
      localStorage.setItem('smartpcchecker_chat_session', JSON.stringify(initial));
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('smartpcchecker_chat_session', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ **System Note:** ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, data]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "❌ **Connection Error:** Failed to reach the technician. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    const initial: Message[] = [{ role: 'assistant', content: "Hello! I'm SmartPCChecker AI. How can I help you with your computer today?" }];
    setMessages(initial);
    localStorage.removeItem('smartpcchecker_chat_session');
    setShowResetModal(false);
  };

  const exportChat = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(messages, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `chat_session_${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <main style={{
      padding: '24px 5% 24px 5%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#fafafa',
      overflow: 'hidden'
    }}>
      <div style={{
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0 // Important for flex scroll
      }}>

        {/* Modern Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexShrink: 0
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
              <Sparkles size={18} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>AI Technician</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111' }}>AI Support</h1>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={exportChat} className="glass" style={{ padding: '8px 12px', borderRadius: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <Download size={14} /> Export JSON
            </button>
            <button onClick={resetSession} className="glass" style={{ padding: '8px 12px', borderRadius: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#ff4b4b' }}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>

        {/* Polished Chat Area */}
        <div style={{
          flex: 1,
          background: '#fff',
          borderRadius: '24px',
          border: '1px solid #eee',
          boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0 // Crucial for inner scroll
        }}>
          <div className="chat-container" style={{
            flex: 1,
            overflowY: 'auto',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            scrollBehavior: 'smooth'
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '16px',
                flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: m.role === 'user' ? '#111' : 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0
                }}>
                  {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div style={{
                  maxWidth: '75%',
                  padding: '14px 20px',
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.role === 'user' ? 'var(--accent-cyan)' : '#f3f4f6',
                  color: m.role === 'user' ? '#fff' : '#1f2937',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  boxShadow: m.role === 'user' ? '0 4px 15px rgba(0, 112, 243, 0.2)' : 'none'
                }} className="markdown-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => <a {...props} style={{ color: m.role === 'user' ? '#fff' : '#0070f3', textDecoration: 'underline', fontWeight: 600 }} target="_blank" rel="noopener noreferrer" />
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Bot size={20} />
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={16} className="animate-spin" /> Technician is analyzing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Clean Input Area */}
          <div style={{
            padding: '24px 32px',
            borderTop: '1px solid #f3f4f6',
            background: '#fff',
            flexShrink: 0
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="Describe your PC or accessory issue..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: '14px',
                  border: '1px solid #e5e7eb',
                  background: '#f9fafb',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
                className="chat-input"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="btn-primary"
                style={{ padding: '0 24px', borderRadius: '14px' }}
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </form>
          </div>
        </div>

        {/* Quick Help Footer */}
        <div style={{ padding: '16px 0', marginTop: 'auto', textAlign: 'center', opacity: 0.6, flexShrink: 0 }}>
          <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <AlertCircle size={14} /> Specialized for Computer Technical Support only
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .chat-input:focus {
          border-color: var(--accent-cyan) !important;
          background: #fff !important;
        }
        .markdown-content p {
          margin-bottom: 12px;
        }
        .markdown-content p:last-child {
          margin-bottom: 0;
        }
        .markdown-content ul, .markdown-content ol {
          margin-bottom: 12px;
          padding-left: 20px;
        }
        .chat-container::-webkit-scrollbar {
          width: 6px;
        }
        .chat-container::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
      `}</style>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '24px', maxWidth: '400px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center', animation: 'scaleIn 0.2s ease-out' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <RotateCcw size={32} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>Start New Session?</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '32px', lineHeight: 1.5 }}>
              Are you sure you want to start a new session? This will clear the current chat history permanently.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowResetModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmReset} style={{ flex: 1, padding: '12px', borderRadius: '12px', backgroundColor: '#ef4444', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Yes, Clear Chat</button>
            </div>
          </div>
          <style>{`@keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
        </div>
      )}
    </main>
  );
}
