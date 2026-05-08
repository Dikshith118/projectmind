import { useEffect, useState } from 'react';

export default function LiveProductivityPulse({ liveMetrics, connected, onRefresh }) {
  const [pulse, setPulse] = useState(false);

  // Pulse animation when metrics update
  useEffect(() => {
    if (liveMetrics) {
      setPulse(true);
      setTimeout(() => setPulse(false), 1000);
    }
  }, [liveMetrics]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-300';
    if (score >= 60) return 'text-cyan-300';
    if (score >= 40) return 'text-yellow-300';
    return 'text-red-300';
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-emerald-500 to-green-500';
    if (score >= 60) return 'from-cyan-500 to-blue-500';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  if (!liveMetrics) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-white">⚡ Live Productivity</h3>
          {connected && (
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          )}
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">⚡</span>
          </div>
          <p className="text-slate-400 text-sm">Loading metrics...</p>
        </div>
      </div>
    );
  }

  const { overallScore, daily, focus, consistency, intensity } = liveMetrics;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-black text-white">⚡ Live Productivity</h3>
          {connected && (
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          )}
        </div>
        <button
          onClick={onRefresh}
          className="text-xs bg-white/5 border border-white/10 text-slate-300 px-3 py-1 rounded-lg hover:bg-white/10 transition"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Overall Score - Large Display */}
      <div className={`relative mb-6 ${pulse ? 'animate-pulse' : ''}`}>
        <div className={`bg-gradient-to-br ${getScoreGradient(overallScore)} opacity-10 rounded-2xl p-8`}></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className={`text-6xl font-black ${getScoreColor(overallScore)}`}>
            {overallScore}
          </p>
          <p className="text-sm text-slate-400 mt-2">Overall Score</p>
        </div>
      </div>

      {/* Score Breakdown - Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-1">Daily</p>
          <p className={`text-2xl font-black ${getScoreColor(daily.score)}`}>
            {daily.score}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {daily.metrics.activeDuration}m active
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-1">Focus</p>
          <p className={`text-2xl font-black ${getScoreColor(focus.score)}`}>
            {focus.score}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {focus.metrics.totalFocusSessions} sessions
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-1">Consistency</p>
          <p className={`text-2xl font-black ${getScoreColor(consistency.score)}`}>
            {consistency.score}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {consistency.metrics.activeDays}/{consistency.metrics.totalDays} days
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-1">Intensity</p>
          <p className={`text-2xl font-black ${getScoreColor(intensity.score)}`}>
            {intensity.score}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {intensity.metrics.currentEditFrequency.toFixed(1)} edits/min
          </p>
        </div>
      </div>

      {/* Live Indicator */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
        <span>Updates in real-time</span>
      </div>
    </div>
  );
}
