import { useEffect, useState } from 'react';
import api from '../api/client';

export default function AIInsights({ projectId }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, [projectId]);

  const fetchInsights = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get(`/api/activity/${projectId}/insights`);
      setInsights(res.data.insights || []);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-white">AI Insights</h3>
            <p className="text-xs text-slate-400">Analyzing your productivity...</p>
          </div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse h-16 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-white">AI Insights</h3>
            <p className="text-xs text-slate-400">Powered by Groq AI</p>
          </div>
        </div>

        <button
          onClick={() => fetchInsights(true)}
          disabled={refreshing}
          className="text-xs bg-white/5 border border-white/10 text-slate-300 px-3 py-2 rounded-lg hover:bg-white/10 transition disabled:opacity-50"
        >
          {refreshing ? '🔄' : '↻'} Refresh
        </button>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">
            Keep coding to generate AI insights!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div
              key={i}
              className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-400/20 rounded-xl p-4 hover:border-violet-400/40 transition"
            >
              <p className="text-sm text-slate-200 leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
