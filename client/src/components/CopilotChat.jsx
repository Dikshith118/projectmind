import { useState } from 'react';
import api from '../api/client';

export default function CopilotChat({
  projectId,
  project,
  tasks = [],
  progress = [],
  insight,
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hey 👋 I'm your AI project copilot. You can type or use the mic to ask about tasks, risk, deadlines, and productivity.`,
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'done').length;
  const totalTasks = tasks.length;

  const completionPct = totalTasks
    ? Math.round((doneTasks / totalTasks) * 100)
    : 0;

  const highPriorityPending = tasks.filter(
    (t) => t.status !== 'done' && t.priority === 'high'
  );

  const nextTask =
    highPriorityPending[0] || tasks.find((t) => t.status !== 'done');

  const riskLevel =
    project?.daysBehind > 2
      ? 'High'
      : project?.daysBehind > 0
      ? 'Medium'
      : 'Low';

  const productivityScore = Math.min(
    100,
    Math.max(
      0,
      completionPct -
        (project?.daysBehind || 0) * 8 +
        (highPriorityPending.length === 0 ? 10 : 0)
    )
  );

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Try Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    setListening(true);

    recognition.start();

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setInput(spokenText);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
      alert('Could not capture voice. Please try again.');
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  const generateLocalReply = (msg) => {
    const message = msg.toLowerCase();

    if (message.includes('what should i do') || message.includes('right now')) {
      if (!nextTask) {
        return '🎉 All tasks are completed. Focus on UI polishing, testing, and final presentation prep.';
      }

      return `🎯 Your next best action is "${nextTask.title}". It is marked as ${nextTask.priority} priority and has the highest impact right now.`;
    }

    if (message.includes('behind') || message.includes('delay')) {
      if ((project?.daysBehind || 0) > 0) {
        return `⚠️ You are ${project.daysBehind} day${
          project.daysBehind !== 1 ? 's' : ''
        } behind schedule because ${pendingTasks} tasks are still incomplete. Finish priority tasks first and optimize your plan.`;
      }

      return `✅ You are currently on track. No major delay detected.`;
    }

    if (message.includes('finish') || message.includes('on time')) {
      if (riskLevel === 'High') {
        return `🚨 Deadline risk is HIGH. Complete critical tasks immediately or reduce project scope.`;
      }

      if (riskLevel === 'Medium') {
        return `⚠️ You can still finish on time if you avoid skipping tasks and maintain consistency.`;
      }

      return `✅ You are likely to finish on time based on current progress.`;
    }

    if (message.includes('productive') || message.includes('score')) {
      return `📈 Productivity Score: ${productivityScore}/100. You completed ${doneTasks}/${totalTasks} tasks.`;
    }

    if (message.includes('risk')) {
      return `🧠 Current project risk level is ${riskLevel}. ${
        riskLevel === 'High'
          ? 'Focus on high-priority tasks immediately.'
          : riskLevel === 'Medium'
          ? 'Project is recoverable with consistent work.'
          : 'Project is stable.'
      }`;
    }

    if (message.includes('summary')) {
      return `📊 ${project?.name || 'Project'} is ${completionPct}% complete with ${pendingTasks} pending tasks. Current risk level is ${riskLevel}.`;
    }

    if (message.includes('optimize')) {
      return `🚀 AI recommends optimizing the remaining schedule now to improve delivery confidence.`;
    }

    return null;
  };

  const send = async (customMessage) => {
    const userMsg = customMessage || input.trim();

    if (!userMsg) return;

    setInput('');

    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const localReply = generateLocalReply(userMsg);

    if (localReply) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: localReply,
          },
        ]);

        setLoading(false);
      }, 400);

      return;
    }

    try {
      const res = await api.post('/api/copilot/chat', {
        projectId,
        message: userMsg,
        context: {
          project,
          tasks,
          progress,
          completionPct,
          productivityScore,
          riskLevel,
        },
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.data.reply,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            'Sorry, I had trouble understanding that. Try asking about risk, tasks, productivity, or deadlines.',
        },
      ]);
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
    'What should I do right now?',
    'Why am I behind?',
    'Will I finish on time?',
    'Summarize my project',
  ];

  return (
    <div className="bg-slate-950/70 border border-white/10 rounded-3xl flex flex-col h-[650px] overflow-hidden shadow-xl shadow-cyan-900/20">
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg">
            <span className="text-lg">🤖</span>
          </div>

          <div>
            <p className="font-black text-white text-lg">AI Copilot</p>
            <p className="text-xs text-slate-400">
              {listening ? 'Listening to your voice...' : 'Smart project assistant'}
            </p>
          </div>
        </div>

        <div className="bg-cyan-500/10 border border-cyan-400/20 px-4 py-2 rounded-xl">
          <p className="text-[10px] text-cyan-200 uppercase font-bold tracking-wide">Productivity</p>
          <p className="text-lg font-black text-cyan-300">
            {productivityScore}/100
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-lg ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-slate-900/80 border border-white/10 text-slate-200'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900/80 border border-white/10 px-5 py-3.5 rounded-2xl text-sm text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <span className="ml-2">AI is thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-3 flex gap-2 overflow-x-auto border-t border-white/10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {quickQuestions.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="text-xs bg-white/5 border border-white/10 text-slate-300 px-4 py-2.5 rounded-xl whitespace-nowrap hover:bg-cyan-500/10 hover:border-cyan-400/30 hover:text-cyan-200 transition-all duration-200"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-white/10 flex gap-3">
        <button
          onClick={startVoiceInput}
          disabled={loading}
          title="Use voice input"
          className={`w-12 h-12 shrink-0 rounded-xl text-lg font-bold border transition-all duration-200 flex items-center justify-center ${
            listening
              ? 'bg-red-500/20 border-red-400/40 text-red-300 shadow-lg shadow-red-500/50 animate-pulse'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-cyan-500/10 hover:border-cyan-400/30 hover:text-cyan-300'
          }`}
        >
          {listening ? '🎙️' : '🎤'}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={
            listening
              ? 'Listening...'
              : 'Ask about deadlines, risk...'
          }
          className="flex-1 min-w-0 bg-slate-900/60 border border-white/10 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/30 transition-all"
        />

        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="shrink-0 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-3 rounded-xl text-sm font-bold hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-cyan-900/30 whitespace-nowrap"
        >
          Send
        </button>
      </div>
    </div>
  );
}