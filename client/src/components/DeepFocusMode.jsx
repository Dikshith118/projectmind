import { useState, useEffect } from 'react';
import { useAIFeatures } from '../hooks/useAIFeatures';

export default function DeepFocusMode({ projectId }) {
  const [action, setAction] = useState(null);
  const { loading, error, getNextAction } = useAIFeatures();

  useEffect(() => {
    loadNextAction();
  }, [projectId]);

  const loadNextAction = async () => {
    try {
      const result = await getNextAction(projectId);
      setAction(result);
    } catch (err) {
      console.error(err);
    }
  };

  const getRiskColor = (level) => {
    if (level === 'High') return 'text-red-300 bg-red-500/15 border-red-500/30';
    if (level === 'Medium') return 'text-yellow-300 bg-yellow-500/15 border-yellow-500/30';
    return 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30';
  };

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
          <span className="text-2xl">🌙</span>
        </div>
        <div>
          <h2 className="text-xl font-black text-white">Deep Focus Mode</h2>
          <p className="text-xs text-slate-400">AI action center</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-400 rounded-full animate-spin"></div>
        </div>
      ) : action ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-400/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎯</span>
              <h3 className="text-sm font-bold text-violet-300 uppercase tracking-wide">Next Best Action</h3>
            </div>
            <p className="text-lg font-black text-white mb-2">{action.nextAction}</p>
            <p className="text-sm text-slate-300">{action.reasoning}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-3xl font-black text-white">{action.remainingTasks}</p>
              <p className="text-xs text-slate-400 mt-1">Remaining</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-3xl font-black text-red-300">{action.highRiskTasks}</p>
              <p className="text-xs text-slate-400 mt-1">High Risk</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-3xl font-black text-violet-300">{action.estimatedWorkLeft}</p>
              <p className="text-xs text-slate-400 mt-1">Work Left</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-300">Risk Level</h3>
              <span className={`text-xs px-3 py-1 rounded-full font-bold border ${getRiskColor(action.riskLevel)}`}>
                {action.riskLevel}
              </span>
            </div>
            <p className="text-sm text-slate-400">{action.riskAnalysis}</p>
          </div>

          <button
            onClick={loadNextAction}
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white py-3 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition shadow-lg shadow-violet-900/40"
          >
            Start Recommended Action
          </button>

          <button
            onClick={loadNextAction}
            className="w-full bg-white/5 border border-white/10 text-slate-300 py-3 rounded-2xl font-bold hover:bg-white/10 transition"
          >
            Refresh Analysis
          </button>
        </div>
      ) : null}
    </div>
  );
}
