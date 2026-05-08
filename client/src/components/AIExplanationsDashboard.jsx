import { useEffect, useState } from 'react';
import api from '../api/client';
import ExplainableInsightCard from './ExplainableInsightCard';

export default function AIExplanationsDashboard({ projectId }) {
  const [explanations, setExplanations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExplanations();
  }, [projectId]);

  const fetchExplanations = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/api/explain/${projectId}/all`);
      setExplanations(res.data);
    } catch (err) {
      console.error('Failed to fetch explanations:', err);
      setError(err.response?.data?.error || 'Failed to load explanations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-white/10 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
        <p className="text-red-300 text-sm">{error}</p>
        <button
          onClick={fetchExplanations}
          className="mt-4 bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-500/30 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!explanations) return null;

  const getRiskType = (level) => {
    if (level === 'Critical' || level === 'High') return 'error';
    if (level === 'Medium') return 'warning';
    return 'success';
  };

  const getProductivityType = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'error';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            🧠 AI Reasoning & Explanations
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Transparent AI decisions with detailed reasoning
          </p>
        </div>
        <button
          onClick={fetchExplanations}
          className="bg-white/5 border border-white/10 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/10 transition"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Risk Explanation */}
      {explanations.risk && (
        <ExplainableInsightCard
          title="Risk Assessment"
          value={explanations.risk.level}
          explanation={explanations.risk}
          icon="⚠️"
          type={getRiskType(explanations.risk.level)}
        />
      )}

      {/* Productivity Explanation */}
      {explanations.productivity && (
        <ExplainableInsightCard
          title="Productivity Score"
          value={`${explanations.productivity.overallScore}/100`}
          explanation={explanations.productivity}
          icon="⚡"
          type={getProductivityType(explanations.productivity.overallScore)}
        />
      )}

      {/* Focus Recommendation */}
      {explanations.focus && explanations.focus.taskTitle && (
        <ExplainableInsightCard
          title="Focus Recommendation"
          value={explanations.focus.taskTitle}
          explanation={explanations.focus}
          icon="🎯"
          type="info"
        />
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-400/30 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-sm font-bold text-white mb-2">About AI Transparency</p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every AI decision in ProjectMind includes detailed reasoning, contributing factors, 
              and confidence scores. Click "Show Detailed Reasoning" on any card to see the full analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
