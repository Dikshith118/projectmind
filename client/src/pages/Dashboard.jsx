import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../api/client';
import CopilotChat from '../components/CopilotChat';


export default function Dashboard() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [project,  setProject]  = useState(null);
  const [tasks,    setTasks]    = useState([]);
  const [progress, setProgress] = useState([]);
  const [insight,  setInsight]  = useState('');
  const [loading,  setLoading]  = useState(true);
  const [rescheduling, setRescheduling] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');

  useEffect(() => { fetchAll(); }, [id]);

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
      generateInsight(projRes.data.project);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateInsight = async (proj) => {
    if (!proj) return;
    const done    = tasks.filter(t => t.status === 'done').length;
    const pct     = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    const behind  = proj.daysBehind || 0;
    const insights = [
      behind >= 2
        ? `You are ${behind} days behind on ${proj.name}. Focus on high-priority tasks today.`
        : `${proj.name} is on track. Keep up the momentum!`,
    ];
    setInsight(insights[0]);
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
    if (p === 'high')   return 'bg-red-100 text-red-700';
    if (p === 'medium') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-600';
  };

  const statusIcon = (s) => {
    if (s === 'done')    return '✅';
    if (s === 'partial') return '🔄';
    if (s === 'skipped') return '⏭️';
    return '⬜';
  };

  const doneTasks    = tasks.filter(t => t.status === 'done').length;
  const totalTasks   = tasks.length;
  const completionPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">PM</span>
          </div>
          <span className="font-semibold text-gray-900">{project.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            project.status === 'delayed'
              ? 'bg-red-100 text-red-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {project.status}
          </span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* Delay alert */}
        {project.status === 'delayed' && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-5 flex items-center justify-between">
            <div>
              <p className="text-red-700 font-medium text-sm">
                You are {project.daysBehind} day{project.daysBehind !== 1 ? 's' : ''} behind schedule
              </p>
              <p className="text-red-500 text-xs mt-0.5">
                AI can regenerate your remaining plan automatically
              </p>
            </div>
            <button
              onClick={handleReschedule}
              disabled={rescheduling}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition"
            >
              {rescheduling ? 'Rescheduling...' : 'Auto-reschedule'}
            </button>
          </div>
        )}

        {/* AI Insight */}
        {insight && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 mb-5">
            <p className="text-blue-700 text-sm">
              <span className="font-medium">AI insight: </span>{insight}
            </p>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Completion',    value: `${completionPct}%` },
            { label: 'Tasks done',    value: `${doneTasks} / ${totalTasks}` },
            { label: 'Days behind',   value: project.daysBehind || 0 },
            { label: 'Deadline',      value: new Date(project.deadline).toLocaleDateString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Burndown chart */}
        {progress.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Progress burndown</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={progress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="day"
                  tickFormatter={(v) => `Day ${v}`}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="planned"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Planned"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Actual"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {['tasks', 'all'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab === 'tasks' ? "Today's tasks" : 'All tasks'}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="mt-6">
  <CopilotChat projectId={id} />
            </div>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No tasks found
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {tasks
                .filter((t) => {
                  if (activeTab === 'tasks') {
                    const createdAt = new Date(project.createdAt);
                    const today     = new Date();
                    const dayNum    = Math.ceil((today - createdAt) / (1000 * 60 * 60 * 24));
                    return t.day === dayNum || t.day === dayNum + 1;
                  }
                  return true;
                })
                .map((task) => (
                  <div key={task._id} className="flex items-center gap-3 px-5 py-3">
                    <span className="text-lg">{statusIcon(task.status)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        task.status === 'done'
                          ? 'line-through text-gray-400'
                          : 'text-gray-900'
                      }`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Day {task.day} · {task.estimatedH}h estimated
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}