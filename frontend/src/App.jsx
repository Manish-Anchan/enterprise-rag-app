import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import EmptyState from './components/EmptyState';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ArchitectureModal from './components/ArchitectureModal';
import { checkBackendHealth, sendQuery } from './services/api';
import { Loader2 } from 'lucide-react';

function generateSessionId() {
  return 'session_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
}

export default function App() {
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem('novatech_session_id') || generateSessionId();
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('novatech_chat_messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState({ status: 'checking' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [lastLatency, setLastLatency] = useState(null);

  const messagesEndRef = useRef(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('novatech_session_id', sessionId);
  }, [sessionId]);

  useEffect(() => {
    localStorage.setItem('novatech_chat_messages', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Health check on mount and interval
  useEffect(() => {
    let isMounted = true;
    const fetchHealth = async () => {
      const res = await checkBackendHealth();
      if (isMounted) setBackendStatus(res);
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleResetSession = () => {
    const newId = generateSessionId();
    setSessionId(newId);
    setMessages([]);
    localStorage.removeItem('novatech_chat_messages');
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('novatech_chat_messages');
  };

  const handleSendPrompt = async (textToSend) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const startTime = performance.now();

    try {
      const response = await sendQuery(queryText, sessionId);
      const endTime = performance.now();
      const latencySec = ((endTime - startTime) / 1000).toFixed(2);
      setLastLatency(latencySec);

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer || 'No response generated.',
        thought_process: response.thought_process || [],
        status: response.status || 'success',
        sources: response.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setBackendStatus({ status: 'healthy' });
    } catch (err) {
      setBackendStatus({ status: 'offline' });
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **Connection Error:** Could not reach the NovaTech RAG backend.\n\nMake sure the FastAPI server is running with:\n\`\`\`bash\nuvicorn app.main:app --host 0.0.0.0 --port 8080 --reload\n\`\`\`\n*Error details: ${err.message}*`,
        thought_process: ['Backend connection check failed'],
        status: 'error',
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessionId={sessionId}
        onResetSession={handleResetSession}
        onSelectPrompt={(prompt) => {
          setIsSidebarOpen(false);
          handleSendPrompt(prompt);
        }}
        backendStatus={backendStatus}
        onOpenArchitecture={() => setIsArchModalOpen(true)}
      />

      {/* Main Chat Workspace */}
      <div className="flex flex-1 flex-col h-full min-w-0 bg-background">
        <ChatHeader
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onClearChat={handleClearChat}
          onOpenArchitecture={() => setIsArchModalOpen(true)}
          messageCount={messages.length}
          latency={lastLatency}
        />

        {/* Scrollable Message List */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <EmptyState onSelectPrompt={handleSendPrompt} />
            ) : (
              messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))
            )}

            {isLoading && (
              <div className="flex gap-3 py-3 w-full justify-start animate-pulse">
                <div className="h-7 w-7 rounded-md bg-zinc-800 border border-border flex items-center justify-center text-zinc-400 shrink-0 mt-0.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                </div>
                <div className="rounded-xl px-4 py-2.5 text-xs text-muted-foreground bg-card border border-border flex items-center gap-2">
                  <span>Searching knowledge base & synthesizing response...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Chat Input */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={() => handleSendPrompt(input)}
          isLoading={isLoading}
        />
      </div>

      {/* Architecture Modal */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </div>
  );
}
