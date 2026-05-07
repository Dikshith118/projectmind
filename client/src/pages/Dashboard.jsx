import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import api from '../api/client';
import CopilotChat from '../components/CopilotChat';
import FocusMode from '../components/FocusMode';
import SpeedoMeter from '../components/SpeedoMeter';

export default function Dashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState([]);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [activeFeature, setActiveFeature] = useState(null);
  
  // Demo Generator State
  const [demoData, setDemoData] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState(null);

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    setLoading(true);

    try {
      const [projRes, progressRes] = await Promise.all([
        api.get(`/api/projects/${id}`),
        api.get(`/api/projects/${id}/progress`),
      ]);

      const projectData = projRes.data.project;
      const taskData = projRes.data.tasks || [];

      setProject(projectData);
      setTasks(taskData);
      setProgress(progressRes.data || []);
      generateInsight(projectData, taskData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateInsight = (proj, taskList = []) => {
    if (!proj) return;

    const done = taskList.filter((t) => t.status === 'done').length;
    const pct = taskList.length
      ? Math.round((done / taskList.length) * 100)
      : 0;

    const behind = proj.daysBehind || 0;

    setInsight(
      `AI Analysis: You are ${pct}% complete. ${
        behind > 0
          ? `Delay detected (${behind} days). Prioritize high-impact tasks immediately.`
          : `You're on track. Maintain consistency to meet your deadline.`
      }`
    );
  };

  const handleReschedule = async () => {
    if (!window.confirm('Let AI regenerate your remaining schedule?')) return;

    try {
      await api.post(`/api/projects/${id}/reschedule`);
      await fetchAll();
    } catch (err) {
      alert('Reschedule failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleGenerateDemo = async () => {
    setDemoLoading(true);
    setDemoError(null);
    
    try {
      const response = await api.post('/api/ai/demo', { projectId: id });
      setDemoData(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to generate demo';
      setDemoError(errorMsg);
      console.error('Demo generation error:', err);
    } finally {
      setDemoLoading(false);
    }
  };

  const exportAsMarkdown = () => {
    if (!demoData) return;
    
    const markdown = `# ${project.name} - Demo Summary

## Project Overview
${demoData.overview}

## Problem Statement
${demoData.problem}

## Implemented Features
${demoData.features?.map(f => `- ${f}`).join('\n')}

## Tech Stack
${demoData.techStack?.map(t => `- ${t}`).join('\n')}

## Future Scope
${demoData.futureScope?.map(f => `- ${f}`).join('\n')}

## Demo Script
${demoData.demoScript?.map((s, i) => `${i + 1}. ${s}`).join('\n')}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '-')}-demo.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = () => {
    if (!demoData) return;
    
    // Simple text-based PDF export
    const text = `${project.name} - DEMO SUMMARY

PROJECT OVERVIEW
${demoData.overview}

PROBLEM STATEMENT
${demoData.problem}

IMPLEMENTED FEATURES
${demoData.features?.map(f => `• ${f}`).join('\n')}

TECH STACK
${demoData.techStack?.join(', ')}

FUTURE SCOPE
${demoData.futureScope?.map(f => `• ${f}`).join('\n')}

DEMO SCRIPT
${demoData.demoScript?.map((s, i) => `${i + 1}. ${s}`).join('\n')}
`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '-')}-demo.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const priorityColor = (p) => {
    if (p === 'high') return 'bg-red-500/15 text-red-300 border-red-500/30';
    if (p === 'medium') return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
    return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  };

  const statusIcon = (s) => {
    if (s === 'done') return '✅';
    if (s === 'partial') return '🔄';
    if (s === 'skipped') return '⏭️';
    return '⬜';
  };

  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status !== 'done').length;

  const completionPct = totalTasks
    ? Math.round((doneTasks / totalTasks) * 100)
    : 0;

  const riskLevel =
    project?.daysBehind > 2
      ? 'High'
      : project?.daysBehind > 0
      ? 'Medium'
      : 'Low';

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'tasks') {
      const createdAt = new Date(project.createdAt);
      const today = new Date();
      const dayNum = Math.ceil((today - createdAt) / (1000 * 60 * 60 * 24));
      return t.day === dayNum || t.day === dayNum + 1;
    }

    return true;
  });

  const featureCards = [
    {
      id: 'ppt',
      icon: '📄',
      title: 'AI Demo / PPT Generator',
      desc: 'Generate demo summary and presentation content.',
    },
    {
      id: 'focus',
      icon: '🌙',
      title: 'Deep Focus Mode',
      desc: 'Enter distraction-free task execution mode.',
    },
    {
      id: 'meeting',
      icon: '🤝',
      title: 'AI Meeting Assistant',
      desc: 'Manage meetings, absence notes, and summaries.',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-100">
        <div className="glass-card rounded-3xl px-10 py-8 text-center">
          <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 text-sm">Loading project dashboard...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-100">
        <p className="text-slate-400">Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 flex">
      <aside className="hidden lg:flex w-72 min-h-screen sticky top-0 glass-card border-r border-white/10 p-6 flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
            <span className="text-white font-black">PM</span>
          </div>

          <div>
            <p className="font-black text-white text-lg">ProjectMind</p>
            <p className="text-xs text-violet-200/70">AI Copilot</p>
          </div>
        </div>

        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-900/30">
            <span>📊</span>
            Dashboard
          </button>

          {featureCards.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white"
            >
              <span>{feature.icon}</span>
              {feature.title}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-auto text-slate-300 hover:text-violet-300 text-sm font-bold bg-white/5 border border-white/10 rounded-2xl px-4 py-3 transition"
        >
          ← Back to Projects
        </button>
      </aside>

      {activeFeature && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl overflow-y-auto">
          <div className="min-h-screen p-6 lg:p-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs text-violet-300 font-bold uppercase">
                  ProjectMind Feature
                </p>

                <h2 className="text-4xl font-black text-white">
                  {activeFeature === 'ppt' && '📄 AI Demo / PPT Generator'}
                  {activeFeature === 'focus' && '🌙 Deep Focus Mode'}
                  {activeFeature === 'meeting' && '🤝 AI Meeting Assistant'}
                </h2>
              </div>

              <button
                onClick={() => setActiveFeature(null)}
                className="w-12 h-12 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition"
              >
                ✕
              </button>
            </div>


            {activeFeature === 'ppt' && (
              <div className="glass-card rounded-3xl p-8 max-w-5xl">
                <p className="text-6xl mb-6">📄</p>

                <h3 className="text-2xl font-black text-white mb-3">
                  AI Demo / PPT Generator
                </h3>

                <p className="text-slate-400 mb-6">
                  Generate a project overview, problem statement, solution,
                  features, tech stack, future scope, and demo script.
                </p>

                {demoError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl mb-6 text-sm">
                    {demoError}
                  </div>
                )}

                {!demoData ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {[
                        'Project Overview',
                        'Problem Statement',
                        'Implemented Features',
                        'Tech Stack',
                        'Future Scope',
                        'Demo Script',
                      ].map((item) => (
                        <div
                          key={item}
                          className="bg-white/5 border border-white/10 rounded-2xl p-4 text-slate-300 font-bold"
                        >
                          ✅ {item}
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={handleGenerateDemo}
                      disabled={demoLoading}
                      className="bg-gradient-to-r from-blue-500 to-violet-600 text-white px-8 py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition"
                    >
                      {demoLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Generating Demo...
                        </span>
                      ) : (
                        'Generate Demo Summary'
                      )}
                    </button>
                  </>
                ) : (
                  <div className="space-y-6">
                    {/* Export Buttons */}
                    <div className="flex gap-3 mb-6">
                      <button
                        onClick={exportAsMarkdown}
                        className="flex-1 bg-white/5 border border-white/10 text-slate-300 py-3 px-4 rounded-xl font-bold hover:bg-white/10 transition"
                      >
                        📥 Export Markdown
                      </button>
                      <button
                        onClick={exportAsPDF}
                        className="flex-1 bg-white/5 border border-white/10 text-slate-300 py-3 px-4 rounded-xl font-bold hover:bg-white/10 transition"
                      >
                        📄 Export Text
                      </button>
                      <button
                        onClick={() => setDemoData(null)}
                        className="flex-1 bg-white/5 border border-white/10 text-slate-300 py-3 px-4 rounded-xl font-bold hover:bg-white/10 transition"
                      >
                        🔄 Generate New
                      </button>
                    </div>

                    {/* Project Overview */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h4 className="text-lg font-black text-emerald-300 mb-3 flex items-center gap-2">
                        ✅ Project Overview
                      </h4>
                      <p className="text-slate-300 leading-relaxed">{demoData.overview}</p>
                    </div>

                    {/* Problem Statement */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h4 className="text-lg font-black text-yellow-300 mb-3 flex items-center gap-2">
                        ❓ Problem Statement
                      </h4>
                      <p className="text-slate-300 leading-relaxed">{demoData.problem}</p>
                    </div>

                    {/* Implemented Features */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h4 className="text-lg font-black text-violet-300 mb-3 flex items-center gap-2">
                        🎯 Implemented Features
                        <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-1 rounded-full">
                          {demoData.features?.length || 0}
                        </span>
                      </h4>
                      <ul className="space-y-2">
                        {demoData.features?.map((f, i) => (
                          <li key={i} className="text-slate-300 flex items-start gap-2">
                            <span className="text-violet-400 mt-1">•</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tech Stack */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h4 className="text-lg font-black text-blue-300 mb-3 flex items-center gap-2">
                        ⚙️ Tech Stack
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {demoData.techStack?.map((tech, i) => (
                          <span 
                            key={i} 
                            className="text-sm bg-blue-500/15 text-blue-300 border border-blue-500/30 px-4 py-2 rounded-full font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Future Scope */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h4 className="text-lg font-black text-fuchsia-300 mb-3 flex items-center gap-2">
                        🚀 Future Scope
                      </h4>
                      <ul className="space-y-2">
                        {demoData.futureScope?.map((f, i) => (
                          <li key={i} className="text-slate-300 flex items-start gap-2">
                            <span className="text-fuchsia-400 mt-1">•</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Demo Script */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h4 className="text-lg font-black text-orange-300 mb-3 flex items-center gap-2">
                        🎬 Demo Script
                      </h4>
                      <ol className="space-y-3">
                        {demoData.demoScript?.map((step, i) => (
                          <li key={i} className="text-slate-300 flex gap-3">
                            <span className="font-bold text-orange-300 shrink-0">{i + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeFeature === 'focus' && (
              <div className="max-w-4xl">
                <FocusMode
                  tasks={tasks}
                  completionPct={completionPct}
                  riskLevel={riskLevel}
                  onReschedule={handleReschedule}
                />
              </div>
            )}

            {activeFeature === 'meeting' && (
              <div className="glass-card rounded-3xl p-8 max-w-5xl">
                <p className="text-6xl mb-6">🤝</p>

                <h3 className="text-2xl font-black text-white mb-3">
                  AI Meeting Assistant
                </h3>

                <p className="text-slate-400 mb-6">
                  View meeting timings, mark attendance, send absence message,
                  and receive AI-generated important points from missed meetings.
                </p>

                <div className="space-y-4">
                  {[
                    {
                      time: '7:00 PM',
                      title: 'Backend Sync',
                      agenda: 'API progress, database issues, authentication flow',
                    },
                    {
                      time: '8:30 PM',
                      title: 'UI Review',
                      agenda: 'Dashboard polish, chatbot layout, feature cards',
                    },
                    {
                      time: '9:15 PM',
                      title: 'Demo Planning',
                      agenda: 'Presentation flow, demo script, final testing',
                    },
                  ].map((meeting) => (
                    <div
                      key={meeting.title}
                      className="bg-white/5 border border-white/10 rounded-2xl p-5"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div>
                          <p className="text-white font-black text-lg">
                            {meeting.title}
                          </p>
                          <p className="text-xs text-violet-300 font-bold mt-1">
                            {meeting.time}
                          </p>
                          <p className="text-sm text-slate-400 mt-2">
                            Agenda: {meeting.agenda}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 py-3 rounded-2xl font-bold hover:bg-emerald-500/30 transition">
                          I Will Attend
                        </button>

                        <button className="bg-red-500/20 border border-red-400/30 text-red-300 py-3 rounded-2xl font-bold hover:bg-red-500/30 transition">
                          Can’t Attend
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-violet-500/10 border border-violet-400/20 rounded-2xl p-5">
                  <p className="text-violet-200 font-black mb-2">
                    AI Missed Meeting Summary
                  </p>
                  <p className="text-sm text-slate-300">
                    If you can’t attend, AI will collect key points, decisions,
                    blockers, and assigned tasks from the meeting.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="flex-1 px-5 lg:px-8 py-6 max-w-[1500px] mx-auto">
        <nav className="lg:hidden mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-slate-300 hover:text-violet-300 text-sm font-medium transition"
          >
            ← Back
          </button>

          <div className="flex gap-2">
            {featureCards.slice(0, 2).map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className="text-slate-300 hover:text-violet-300 text-sm font-bold bg-white/5 border border-white/10 rounded-xl px-3 py-2"
              >
                {feature.icon}
              </button>
            ))}
          </div>
        </nav>

        <section className="relative overflow-hidden rounded-[2rem] p-8 mb-6 glass-card">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-violet-600/30 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-600/20 blur-3xl rounded-full"></div>

          <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
            <div>
              <p className="inline-flex items-center gap-2 text-sm text-violet-200 bg-violet-500/10 border border-violet-400/20 rounded-full px-4 py-1 mb-4">
                📊 Project Dashboard
              </p>

              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
                {project.name}
              </h1>

              <p className="text-sm text-violet-300 mt-2">
                {doneTasks} of {totalTasks} tasks completed • {pendingTasks} pending •{' '}
                {project.daysBehind || 0} days behind
              </p>

              <p className="text-slate-300 mt-4 max-w-2xl leading-relaxed">
                AI monitors productivity, predicts schedule risk, recommends action plans,
                and helps you recover when tasks fall behind.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Speedometer */}
              <div className="bg-white/5 border border-white/10 backdrop-blur rounded-3xl p-6 flex items-center justify-center">
                <SpeedoMeter percentage={completionPct} label="Completed" />
              </div>

              {/* Risk Level */}
              <div className="bg-white/10 border border-white/10 backdrop-blur rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[180px]">
                <p
                  className={`text-6xl font-black mb-3 ${
                    riskLevel === 'High'
                      ? 'text-red-300'
                      : riskLevel === 'Medium'
                      ? 'text-yellow-300'
                      : 'text-emerald-300'
                  }`}
                >
                  {riskLevel}
                </p>
                <p className="text-sm text-slate-300 font-semibold uppercase tracking-wide">Risk Level</p>
              </div>
            </div>
          </div>

          <div className="relative w-full bg-white/10 rounded-full h-3 mt-8 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all duration-700"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            {progress.length > 0 && (
              <div className="glass-card rounded-3xl p-6 mb-6">
                <h2 className="font-black text-white text-xl mb-1">
                  Progress Burndown
                </h2>
                <p className="text-sm text-slate-400 mb-5">
                  Planned progress vs actual progress
                </p>

                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={progress}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148,163,184,0.18)"
                    />
                    <XAxis
                      dataKey="day"
                      tickFormatter={(v) => `Day ${v}`}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                    />
                    <Tooltip
                      formatter={(v) => `${v}%`}
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid rgba(148,163,184,0.25)',
                        borderRadius: '16px',
                        color: '#e2e8f0',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="planned"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={false}
                      name="Planned"
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={false}
                      name="Actual"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="flex gap-3 mb-4">
              {['tasks', 'all'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 rounded-2xl text-sm font-bold transition ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-900/30'
                      : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {tab === 'tasks' ? "Today's Tasks" : 'All Tasks'}
                </button>
              ))}
            </div>

            <div className="glass-card rounded-3xl overflow-hidden">
              {filteredTasks.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-5xl mb-3">📝</p>
                  <p className="text-slate-400 text-sm">
                    No tasks yet. AI will generate your schedule based on your goal.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {filteredTasks.map((task) => (
                    <div
                      key={task._id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition cursor-pointer hover:scale-[1.01] hover:shadow-lg hover:shadow-violet-900/20"
                    >
                      <span className="text-xl">{statusIcon(task.status)}</span>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-bold ${
                            task.status === 'done'
                              ? 'line-through text-slate-500'
                              : 'text-slate-100'
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Day {task.day} · {task.estimatedH}h estimated
                        </p>
                      </div>

                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold border ${priorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="glass-card rounded-3xl p-6">
              <CopilotChat
                projectId={id}
                project={project}
                tasks={tasks}
                progress={progress}
                insight={insight}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

