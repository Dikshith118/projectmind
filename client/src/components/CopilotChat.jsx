import { useState } from 'react';
import api from '../api/client';

export default function CopilotChat({ projectId }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your ProjectMind copilot. Ask me anything about your project." }
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/api/copilot/chat', {
        projectId,
        message: userMsg,
      });
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Sorry, I had trouble answering that. Try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const quickQuestions = [
    "What should I do right now?",
    "Why am I behind?",
    "Will I finish on time?",
    "What did I work on today?",
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl flex flex-col h-96">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        <span className="font-semibold text-gray-900 text-sm">AI Copilot</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-3 py-2 rounded-xl text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-xl text-sm text-gray-500">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Quick questions */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-gray-100">
        {quickQuestions.map((q) => (
          <button
            key={q}
            onClick={() => { setInput(q); }}
            className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2 py-1 rounded-lg whitespace-nowrap hover:bg-gray-100"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask anything about your project..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}