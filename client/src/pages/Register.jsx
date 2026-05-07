import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/register', form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-slate-100">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 glass-card rounded-[2rem] overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden lg:flex relative overflow-hidden p-10 text-white flex-col justify-between border-r border-white/8">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-600/12 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/10 blur-3xl rounded-full"></div>

          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-cyan-900/30">
              <span className="font-black text-lg">PM</span>
            </div>

            <p className="inline-flex text-sm text-cyan-200 bg-cyan-500/10 border border-cyan-400/20 rounded-full px-4 py-1 mb-5">
              🚀 Start your journey
            </p>

            <h1 className="text-5xl font-black leading-tight">
              Build long-term projects with AI.
            </h1>

            <p className="text-slate-300 mt-5 leading-relaxed">
              ProjectMind converts your big goals into daily tasks,
              tracks your progress, and helps you stay consistent.
            </p>
          </div>

          <div className="relative space-y-4 mt-10">
            {[
              { title: '⚡ AI task planning', desc: 'Break big goals into daily steps' },
              { title: '📈 Progress tracking', desc: 'Know if you are on track' },
              { title: '🤖 Smart rescheduling', desc: 'Adjust plan automatically' },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/10 border border-white/10 rounded-2xl p-4 hover:bg-white/15 transition"
              >
                <p className="font-bold">{item.title}</p>
                <p className="text-sm text-slate-300 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-8 sm:p-10">
          <div className="mb-8">
            <div className="lg:hidden w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-5 shadow-lg shadow-cyan-900/30">
              <span className="text-white font-black">PM</span>
            </div>

            <h2 className="text-4xl font-black text-white">Create account</h2>
            <p className="text-slate-400 mt-2">
              Start tracking your projects with AI.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Full name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/30 bg-slate-950/60 text-white placeholder:text-slate-500 transition-all"
                placeholder="Arjun Sharma"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Email address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/30 bg-slate-950/60 text-white placeholder:text-slate-500 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/30 bg-slate-950/60 text-white placeholder:text-slate-500 transition-all"
                placeholder="Min 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-cyan-900/30"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-300 font-bold hover:text-cyan-200 transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}