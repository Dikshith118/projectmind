import { useEffect, useState } from 'react';
import api from '../api/client';

export default function ProductivityMetrics({ projectId }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [projectId]);

  const fetchMetrics = async () => {
    try {
      const res = await api.get(`/api/activity/${projectId}/analytics?days=7`);
      setMetrics(res.data);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="h-8 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const { productivity } = metrics;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-300';
    if (score >= 60) return 'text-cyan-300';
    if (score >= 40) return 'text-yellow-300';
    return 'text-red-300';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-500/15 border-emerald-500/30';
    if (score >= 60) return 'bg-cyan-500/15 border-cyan-500/30';
    if (score >= 40) return 'bg-yellow-500/15 border-yellow-500/30';
    return 'bg-red-500/15 border-red-500/30';
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          📊 Productivity Metrics
        </h3>
        <span className="text-xs text-slate-400">Last 7 days</span>
      </div>

      {/* Overall Score */}
      <div className={`${getScoreBg(productivity.overallScore)} border rounded-xl p-4 mb-4`}>
        <p className="text-xs text-slate-300 mb-1 uppercase font-bold">Overall Score</p>
        <p className={`text-4xl font-black ${getScoreColor(productivity.overallScore)}`}>
          {productivity.overallScore}
          <span className="text-lg">/100</span>
        </p>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-1">Daily</p>
          <p className={`text-2xl font-black ${getScoreColor(productivity.daily.score)}`}>
            {productivity.daily.score}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {productivity.daily.metrics.activeDuration}m active
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-1">Focus</p>
          <p className={`text-2xl font-black ${getScoreColor(productivity.focus.score)}`}>
            {productivity.focus.score}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {productivity.focus.metrics.totalFocusSessions} sessions
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-1">Consistency</p>
          <p className={`text-2xl font-black ${getScoreColor(productivity.consistency.score)}`}>
            {productivity.consistency.score}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {productivity.consistency.metrics.activeDays}/{productivity.consistency.metrics.totalDays} days
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-1">Intensity</p>
          <p className={`text-2xl font-black ${getScoreColor(productivity.intensity.score)}`}>
            {productivity.intensity.score}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {productivity.intensity.metrics.currentEditFrequency.toFixed(1)} edits/min
          </p>
        </div>
      </div>
    </div>
  );
}
