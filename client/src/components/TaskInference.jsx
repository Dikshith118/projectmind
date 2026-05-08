import { useEffect, useState } from 'react';
import api from '../api/client';

export default function TaskInference({ projectId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [projectId]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/api/activity/${projectId}/analytics?days=7`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch task inference:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="h-16 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { activeTask, taskProgress, stalledTasks } = data;

  return (
    <div className="space-y-4">
      {/* Active Task */}
      {activeTask ? (
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <p className="text-xs text-cyan-300 font-bold uppercase">Active Task</p>
              <p className="text-sm text-slate-400">Currently working on</p>
            </div>
          </div>
          <p className="text-lg font-black text-white mb-2">{activeTask.taskTitle}</p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>📅 Day {activeTask.day}</span>
            <span>📝 {activeTask.event}</span>
            <span className={`px-2 py-1 rounded-full ${
              activeTask.taskStatus === 'done' ? 'bg-emerald-500/20 text-emerald-300' :
              activeTask.taskStatus === 'partial' ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-slate-500/20 text-slate-300'
            }`}>
              {activeTask.taskStatus}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <p className="text-slate-400 text-sm">No active task detected</p>
        </div>
      )}

      {/* Task Progress Summary */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h4 className="text-sm font-black text-white mb-4 flex items-center gap-2">
          📈 Task Progress Inference
        </h4>
        
        {taskProgress.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">
            No task activity detected yet
          </p>
        ) : (
          <div className="space-y-3">
            {taskProgress.slice(0, 5).map((task, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-slate-200 flex-1 truncate">
                    {task.taskTitle}
                  </p>
                  <span className="text-xs text-cyan-300 font-bold ml-2">
                    {task.estimatedProgress}%
                  </span>
                </div>
                
                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${task.estimatedProgress}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{task.activityMetrics.totalEvents} events</span>
                  <span>{task.confidence}% confidence</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stalled Tasks */}
      {stalledTasks.length > 0 && (
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-400/30 rounded-2xl p-6">
          <h4 className="text-sm font-black text-red-300 mb-3 flex items-center gap-2">
            ⚠️ Stalled Tasks ({stalledTasks.length})
          </h4>
          <div className="space-y-2">
            {stalledTasks.slice(0, 3).map((task, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-sm font-bold text-slate-200 mb-1">{task.taskTitle}</p>
                <p className="text-xs text-red-300">{task.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
