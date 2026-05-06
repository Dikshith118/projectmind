import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../api/client';
import CopilotChat from '../components/CopilotChat';

export default function Dashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState([]);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');

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

      setProject(projRes.data.project);
      setTasks(projRes.data.tasks);
      setProgress(progressRes.data);
      generateInsight(projRes.data.project, projRes.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateInsight = (proj, taskList = []) => {
  if (!proj) return;

  const done = taskList.filter(t => t.status === 'done').length;
  const pct = taskList.length ? Math.round((done / taskList.length) * 100) : 0;
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

    setRescheduling(true);
    try {
      await api.post(`/api/projects/${id}/reschedule`);
      await fetchAll();
    } catch (err) {
      alert('Reschedule failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setRescheduling(false);
    }
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

  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const completionPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const pendingTasks = totalTasks - doneTasks;
  const riskLevel = project?.daysBehind > 2 ? 'High' : project?.daysBehind > 0 ? 'Medium' : 'Low';

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'tasks') {
      const createdAt = new Date(project.createdAt);
      const today = new Date();
      const dayNum = Math.ceil((today - createdAt) / (1000 * 60 * 60 * 24));
      return t.day === dayNum || t.day === dayNum + 1;
    }
    return true;
  });

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
          {[
            ['📊', 'Dashboard', true],
            ['🧠', 'AI Insights', false],
            ['📈', 'Progress', false],
            ['✅', 'Tasks', false],
            ['⚙️', 'Settings', false],
          ].map(([icon, label, active]) => (
            <button
              key={label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition ${
                active
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{icon}</span>
              {label}
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

      <main className="flex-1 px-5 lg:px-8 py-6 max-w-[1500px] mx-auto">
        <nav className="lg:hidden mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-slate-300 hover:text-violet-300 text-sm font-medium transition"
          >
            ← Back
          </button>
          <p className="font-black text-white">ProjectMind</p>
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
  {doneTasks} of {totalTasks} tasks completed • {pendingTasks} pending • {project.daysBehind || 0} days behind
</p>

              <p className="text-slate-300 mt-4 max-w-2xl leading-relaxed">
                AI monitors your productivity, detects schedule risk, and helps you recover when tasks fall behind.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 border border-white/10 backdrop-blur rounded-3xl px-6 py-5 text-center">
                <p className="text-5xl font-black text-white">{completionPct}%</p>
                <p className="text-sm text-slate-300 mt-1">Completed</p>
              </div>

              <div className="bg-white/10 border border-white/10 backdrop-blur rounded-3xl px-6 py-5 text-center">
                <p className={`text-4xl font-black ${riskLevel === 'High' ? 'text-red-300' : riskLevel === 'Medium' ? 'text-yellow-300' : 'text-emerald-300'}`}>
                  {riskLevel}
                </p>
                <p className="text-sm text-slate-300 mt-1">Risk Level</p>
              </div>
            </div>
          </div>

          <div className="relative w-full bg-white/10 rounded-full h-3 mt-8 overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-400 to-fuchsia-500 h-3 rounded-full transition-all duration-700"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              {[
                { label: 'Completion', value: `${completionPct}%`, icon: '📈' },
                { label: 'Done Tasks', value: `${doneTasks} / ${totalTasks}`, icon: '✅' },
                { label: 'Pending', value: pendingTasks, icon: '🕒' },
                { label: 'Deadline', value: new Date(project.deadline).toLocaleDateString(), icon: '📅' },
              ].map(({ label, value, icon }) => (
                <div
                  key={label}
                  className="glass-card glow-card rounded-3xl p-5 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-400">{label}</p>
                    <span className="text-2xl">{icon}</span>
                  </div>
                  <p className="text-3xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>

            {progress.length > 0 && (
              <div className="glass-card rounded-3xl p-6 mb-6">
                <h2 className="font-black text-white text-xl mb-1">Progress Burndown</h2>
                <p className="text-sm text-slate-400 mb-5">Planned progress vs actual progress</p>

                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={progress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                    <XAxis dataKey="day" tickFormatter={(v) => `Day ${v}`} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip
                      formatter={(v) => `${v}%`}
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid rgba(148,163,184,0.25)',
                        borderRadius: '16px',
                        color: '#e2e8f0'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="planned" stroke="#8b5cf6" strokeWidth={3} dot={false} name="Planned" />
                    <Line type="monotone" dataKey="actual" stroke="#22c55e" strokeWidth={3} dot={false} name="Actual" />
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
                        <p className={`text-sm font-bold ${task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Day {task.day} · {task.estimatedH}h estimated
                        </p>
                      </div>

                      <span className={`text-xs px-3 py-1 rounded-full font-bold border ${priorityColor(task.priority)}`}>
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
              <p className="text-xs font-bold text-violet-300 uppercase tracking-wide mb-2">
                🤖 AI Copilot
              </p>
              <h2 className="text-2xl font-black text-white mb-3">Today’s Recommendation</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                {insight}
              </p>

              <button
                onClick={handleReschedule}
                disabled={rescheduling}
                className="w-full mt-5 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white py-3 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition shadow-lg shadow-violet-900/40"
              >
                {rescheduling ? 'Optimizing Plan...' : 'Optimize Plan with AI'}
              </button>
            </div>

            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-xl font-black text-white mb-4">Project Health</h2>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Consistency</span>
                    <span className="text-emerald-300 font-bold">{completionPct >= 50 ? 'Good' : 'Needs Focus'}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-2 bg-emerald-400 rounded-full" style={{ width: `${Math.min(completionPct + 20, 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Deadline Risk</span>
                    <span className="text-violet-300 font-bold">{riskLevel}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-violet-400 rounded-full"
                      style={{ width: riskLevel === 'High' ? '85%' : riskLevel === 'Medium' ? '55%' : '25%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {project.status === 'delayed' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6">
                <p className="text-red-300 font-black mb-2">⚠ Delay Detected</p>
                <p className="text-red-200/70 text-sm">
                  You are {project.daysBehind} day{project.daysBehind !== 1 ? 's' : ''} behind schedule.
                </p>
              </div>
            )}

            <div className="glass-card rounded-3xl p-6">
              <CopilotChat projectId={id} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}