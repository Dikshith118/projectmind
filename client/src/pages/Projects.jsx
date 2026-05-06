import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', goal: '', deadline: '', hoursPerDay: 2 });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/projects');
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      await api.post('/api/projects', form);
      setShowForm(false);
      setForm({ name: '', goal: '', deadline: '', hoursPerDay: 2 });
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const statusColor = (status) => {
    if (status === 'delayed') return 'bg-red-500/15 text-red-300 border-red-500/30';
    if (status === 'completed') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    return 'bg-violet-500/15 text-violet-300 border-violet-500/30';
  };

  const totalProjects = projects.length;
  const delayedProjects = projects.filter((p) => p.status === 'delayed').length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;

  return (
    <div className="min-h-screen text-slate-100">
      <nav className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
            <span className="text-white font-black text-sm">PM</span>
          </div>
          <div>
            <p className="font-bold text-white leading-tight">ProjectMind</p>
            <p className="text-xs text-violet-200/70">AI Productivity Copilot</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-sm text-slate-300">
            Hi, <span className="font-semibold text-white">{user?.name}</span>
          </span>
          <button
            onClick={logout}
            className="text-sm text-slate-300 hover:text-red-300 font-medium transition"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <section className="relative overflow-hidden rounded-[2rem] p-8 mb-6 glass-card">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-violet-600/30 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-600/20 blur-3xl rounded-full"></div>

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <p className="inline-flex items-center gap-2 text-sm text-violet-200 bg-violet-500/10 border border-violet-400/20 rounded-full px-4 py-1 mb-4">
                ✨ Welcome back, {user?.name || 'User'}
              </p>

              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                Build projects with an AI copilot.
              </h1>

              <p className="text-slate-300 mt-4 max-w-2xl leading-relaxed">
                Create long-term goals, generate daily task plans, track delays, and let AI help you stay consistent.
              </p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="group bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white px-7 py-4 rounded-2xl text-sm font-bold shadow-xl shadow-violet-900/40 hover:scale-105 active:scale-95 transition-all"
            >
              <span className="inline-block group-hover:rotate-90 transition-transform">＋</span> New Project
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          {[
            { label: 'Total Projects', value: totalProjects, icon: '📁' },
            { label: 'Completed', value: completedProjects, icon: '✅' },
            { label: 'Delayed', value: delayedProjects, icon: '⚠️' },
          ].map((item) => (
            <div
              key={item.label}
              className="glass-card glow-card rounded-3xl p-5 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-400">{item.label}</p>
                <span className="text-2xl">{item.icon}</span>
              </div>
              <p className="text-4xl font-black text-white">{item.value}</p>
            </div>
          ))}
        </section>

        {showForm && (
          <div className="glass-card rounded-[2rem] p-6 mb-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-2xl font-black text-white">Create new project</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Describe your goal and AI will generate a structured plan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Project name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-950/60 text-white placeholder:text-slate-500"
                    placeholder="e.g. Portfolio Website"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-950/60 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Goal description
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                  className="w-full border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-950/60 text-white placeholder:text-slate-500 resize-none"
                  placeholder="e.g. Build a personal portfolio with 5 pages and a blog section"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Hours available per day
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  required
                  value={form.hoursPerDay}
                  onChange={(e) => setForm({ ...form, hoursPerDay: Number(e.target.value) })}
                  className="w-36 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-950/60 text-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition shadow-lg shadow-violet-900/40"
                >
                  {creating ? 'AI is generating your plan...' : 'Generate Plan with AI'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-2xl text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-32 rounded-3xl glass-card animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card rounded-[2rem] p-12 text-center">
            <p className="text-6xl mb-4">🚀</p>
            <h2 className="text-2xl font-black text-white mb-2">No projects yet</h2>
            <p className="text-sm text-slate-400 mb-6">
              Create your first project and let AI build your productivity plan.
            </p>

            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white px-7 py-3 rounded-2xl text-sm font-bold hover:scale-105 transition shadow-lg shadow-violet-900/40"
            >
              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {projects.map((p) => (
              <div
                key={p._id}
                onClick={() => navigate(`/projects/${p._id}`)}
                className="group glass-card glow-card rounded-[2rem] p-6 cursor-pointer hover:-translate-y-2 hover:scale-[1.01] transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-400/20 flex items-center justify-center shadow-lg">
                        <span className="text-xl">📌</span>
                      </div>

                      <div>
                        <h3 className="font-black text-white text-lg truncate">{p.name}</h3>
                        <p className="text-xs text-slate-500">AI-managed project</p>
                      </div>

                      <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${statusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </div>

                    <p className="text-sm text-slate-400 line-clamp-2 mt-4">
                      {p.goal}
                    </p>
                  </div>

                  <div className="text-right text-sm text-slate-500 shrink-0">
                    <p>Deadline</p>
                    <p className="font-bold text-slate-200">
                      {new Date(p.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {p.daysBehind > 0 ? (
                  <div className="mt-5 bg-red-500/10 border border-red-500/25 text-red-300 text-xs px-4 py-2 rounded-2xl font-medium">
                    ⚠ {p.daysBehind} day{p.daysBehind > 1 ? 's' : ''} behind schedule
                  </div>
                ) : (
                  <div className="mt-5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs px-4 py-2 rounded-2xl font-medium">
                    ✅ Project is on track
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between">
                  <p className="text-xs text-slate-500">Click to open dashboard</p>
                  <p className="text-sm font-bold text-violet-300 group-hover:translate-x-1 transition">
                    Open →
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}