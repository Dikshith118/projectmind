import { useState } from 'react';
import api from '../api/client';

export default function CopilotChat({
  projectId,
  project,
  tasks = [],
  progress = [],
  insight,
  onReschedule,
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
    <div className="bg-slate-950/70 border border-white/10 rounded-3xl flex flex-col h-[650px] overflow-hidden shadow-xl shadow-violet-900/20">
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              listening ? 'bg-red-400 animate-ping' : 'bg-emerald-400 animate-pulse'
            }`}
          ></div>

          <div>
            <p className="font-black text-white text-lg">AI Copilot</p>
            <p className="text-xs text-slate-400">
              {listening ? 'Listening to your voice...' : 'Smart project assistant'}
            </p>
          </div>
        </div>

        <div className="bg-violet-500/10 border border-violet-400/20 px-3 py-2 rounded-2xl">
          <p className="text-[10px] text-violet-200 uppercase">Productivity</p>
          <p className="text-sm font-black text-violet-300">
            {productivityScore}/100
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-sm px-4 py-3 rounded-3xl text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white'
                  : 'bg-white/10 border border-white/10 text-slate-200'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 border border-white/10 px-4 py-3 rounded-3xl text-sm text-slate-400">
              AI is thinking...
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 flex gap-2 overflow-x-auto border-t border-white/10">
        {quickQuestions.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="text-xs bg-white/5 border border-white/10 text-slate-300 px-3 py-2 rounded-xl whitespace-nowrap hover:bg-white/10 hover:text-white transition"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="px-5 py-5 border-t border-white/10 flex gap-2">
        <button
          onClick={startVoiceInput}
          disabled={loading}
          title="Use voice input"
          className={`px-4 py-3 rounded-2xl text-sm font-bold border transition ${
            listening
              ? 'bg-red-500/20 border-red-400/40 text-red-300 shadow-lg shadow-red-500/50 animate-pulse'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-violet-400/30 hover:text-violet-300'
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
              : 'Ask about deadlines, risk, tasks...'
          }
          className="flex-1 bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />

        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white px-5 py-3 rounded-2xl text-sm font-bold hover:scale-[1.03] active:scale-95 disabled:opacity-50 transition"
        >
          Send
        </button>
      </div>

      {onReschedule && (
        <button
          onClick={onReschedule}
          className="mx-5 mb-5 bg-white/5 border border-violet-400/30 text-violet-200 py-3 rounded-2xl text-sm font-bold hover:bg-violet-500/10 transition"
        >
          Optimize Plan with AI
        </button>
      )}
    </div>
  );
}