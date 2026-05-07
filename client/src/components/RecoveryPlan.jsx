import { useState } from 'react';
import { useAIFeatures } from '../hooks/useAIFeatures';

export default function RecoveryPlan({ projectId, daysBehind }) {
  const [plan, setPlan] = useState(null);
  const { loading, error, generateRecoveryPlan } = useAIFeatures();

  const handleGenerate = async () => {
    try {
      const result = await generateRecoveryPlan(projectId);
      setPlan(result);
    } catch (err) {
      console.error(err);
    }
  };

  if (daysBehind === 0) {
    return null;
  }

  const getSeverityColor = (severity) => {
    if (severity === 'Critical') return 'text-red-300 bg-red-500/15 border-red-500/30';
    if (severity === 'Moderate') return 'text-yellow-300 bg-yellow-500/15 border-yellow-500/30';
    return 'text-blue-300 bg-blue-500/15 border-blue-500/30';
  };

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg">
          <span className="text-2xl">⚠️</span>
        </div>
        <div>
          <h2 className="text-xl font-black text-white">Recovery Plan</h2>
          <p className="text-xs text-slate-400">{daysBehind} days behind schedule</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl mb-4 text-sm">
          {error}
        </div>
      )}

      {!plan ? (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white py-3 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition shadow-lg shadow-red-900/40"
        >
          {loading ? 'Analyzing...' : 'Generate Recovery Plan'}
        </button>
      ) : plan.needed ? (
        <div className="space-y-4">
          <div className={`px-4 py-3 rounded-2xl border font-bold text-sm ${getSeverityColor(plan.severity)}`}>
            Severity: {plan.severity}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-emerald-300 mb-3">🎯 Recovery Actions</h3>
            <div className="space-y-3">
              {plan.actions?.map((item, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3">
                  <p className="text-sm font-bold text-white mb-1">{item.action}</p>
                  <p className="text-xs text-slate-400">Impact: {item.impact}</p>
                </div>
              ))}
            </div>
          </div>

          {plan.tasksToSkip?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-yellow-300 mb-3">⏭️ Tasks to Deprioritize</h3>
              <ul className="space-y-1">
                {plan.tasksToSkip.map((task, i) => (
                  <li key={i} className="text-sm text-slate-300">• {task}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-violet-300 mb-3">🔥 Focus Areas</h3>
            <ul className="space-y-1">
              {plan.focusAreas?.map((area, i) => (
                <li key={i} className="text-sm text-slate-300">• {area}</li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-400/30 rounded-2xl p-4 text-center">
            <p className="text-xs text-emerald-300 mb-1">Estimated Recovery Time</p>
            <p className="text-3xl font-black text-white">{plan.estimatedRecoveryDays} days</p>
          </div>

          <button
            onClick={() => setPlan(null)}
            className="w-full bg-white/5 border border-white/10 text-slate-300 py-3 rounded-2xl font-bold hover:bg-white/10 transition"
          >
            Generate New Plan
          </button>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl text-sm text-center">
          {plan.message}
        </div>
      )}
    </div>
  );
}
