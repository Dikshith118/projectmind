import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-slate-100">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 glass-card rounded-[2rem] overflow-hidden">
        <div className="hidden lg:flex relative overflow-hidden p-10 text-white flex-col justify-between border-r border-white/10">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-violet-600/30 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/20 blur-3xl rounded-full"></div>

          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center mb-6 shadow-lg shadow-violet-900/40">
              <span className="font-black text-lg">PM</span>
            </div>

            <p className="inline-flex text-sm text-violet-200 bg-violet-500/10 border border-violet-400/20 rounded-full px-4 py-1 mb-5">
              ✨ AI-powered productivity
            </p>

            <h1 className="text-5xl font-black leading-tight">
              Plan smarter with your AI copilot.
            </h1>

            <p className="text-slate-300 mt-5 leading-relaxed">
              Track long-term projects, generate daily tasks, monitor progress,
              and stay consistent with ProjectMind.
            </p>
          </div>

          <div className="relative grid grid-cols-3 gap-4 mt-10">
            {[
              { value: 'AI', label: 'Planning' },
              { value: '24/7', label: 'Tracking' },
              { value: '100%', label: 'Focus' },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white/10 border border-white/10 rounded-2xl p-4 hover:bg-white/15 transition"
              >
                <p className="text-2xl font-black">{item.value}</p>
                <p className="text-xs text-slate-300">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <div className="mb-8">
            <div className="lg:hidden w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center mb-5 shadow-lg shadow-violet-900/40">
              <span className="text-white font-black">PM</span>
            </div>

            <h2 className="text-4xl font-black text-white">Welcome back</h2>
            <p className="text-slate-400 mt-2">
              Sign in to continue managing your projects.
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
                Email address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-950/60 text-white placeholder:text-slate-500"
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
                className="w-full border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-950/60 text-white placeholder:text-slate-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white py-3 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition shadow-lg shadow-violet-900/40"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            No account?{' '}
            <Link to="/register" className="text-violet-300 font-bold hover:text-fuchsia-300 transition">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}