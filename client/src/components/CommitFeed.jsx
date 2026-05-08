import { useEffect, useState } from 'react';
import api from '../api/client';

export default function CommitFeed({ projectId }) {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    fetchCommits();
    fetchInsights();
  }, [projectId]);

  const fetchCommits = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/github/commits/${projectId}`, {
        params: { limit: 20 }
      });
      setCommits(res.data.commits);
    } catch (err) {
      console.error('Failed to fetch commits:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await api.get(`/api/github/insights/${projectId}`, {
        params: { days: 7 }
      });
      setInsights(res.data);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'feature':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'bugfix':
        return 'bg-red-500/15 text-red-300 border-red-500/30';
      case 'refactor':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'test':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'docs':
        return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
      case 'style':
        return 'bg-pink-500/15 text-pink-300 border-pink-500/30';
      case 'chore':
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
      default:
        return 'bg-white/10 text-slate-300 border-white/10';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'feature': return '✨';
      case 'bugfix': return '🐛';
      case 'refactor': return '♻️';
      case 'test': return '🧪';
      case 'docs': return '📝';
      case 'style': return '💄';
      case 'chore': return '🔧';
      default: return '📦';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-emerald-300';
    if (confidence >= 60) return 'text-cyan-300';
    if (confidence >= 40) return 'text-yellow-300';
    return 'text-orange-300';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-slate-400 text-sm">
          No commits yet. Push to your repository to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Insights */}
      {insights && insights.insights.length > 0 && (
        <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-400/30 rounded-2xl p-6">
          <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            AI Commit Insights
          </h3>

          <div className="space-y-3 mb-4">
            {insights.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-violet-400 mt-1">•</span>
                <p className="text-sm text-slate-200 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-violet-400/20">
            <div>
              <p className="text-xs text-slate-400">Commit Velocity</p>
              <p className="text-lg font-black text-white">{insights.velocity} <span className="text-xs text-slate-400">per day</span></p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Period</p>
              <p className="text-sm font-bold text-slate-300">{insights.period}</p>
            </div>
          </div>

          {/* Patterns */}
          {insights.patterns && (
            <div className="mt-4 pt-4 border-t border-violet-400/20">
              <p className="text-xs text-slate-400 mb-2">Detected Patterns:</p>
              <div className="flex flex-wrap gap-2">
                {insights.patterns.testDrivenDevelopment && (
                  <span className="text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
                    ✓ Test-Driven Development
                  </span>
                )}
                {insights.patterns.frequentSmallCommits && (
                  <span className="text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full">
                    ✓ Frequent Small Commits
                  </span>
                )}
                {insights.patterns.featureBranching && (
                  <span className="text-xs bg-blue-500/15 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full">
                    ✓ Feature Branching
                  </span>
                )}
                {insights.patterns.documentationFirst && (
                  <span className="text-xs bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 px-3 py-1 rounded-full">
                    ✓ Documentation First
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Commit List */}
      <div>
        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📝</span>
          Recent Commits
        </h3>

        <div className="space-y-3">
          {commits.map(commit => (
            <div
              key={commit._id}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white mb-1 line-clamp-2">
                    {commit.message}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{commit.author.username || commit.author.name}</span>
                    <span>•</span>
                    <span>{new Date(commit.committedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <a
                      href={commit.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 font-mono"
                    >
                      {commit.sha.substring(0, 7)}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <span className={`text-xs px-3 py-1 rounded-full border font-bold ${getCategoryColor(commit.aiAnalysis?.category)}`}>
                    {getCategoryIcon(commit.aiAnalysis?.category)} {commit.aiAnalysis?.category || 'unknown'}
                  </span>
                </div>
              </div>

              {/* AI Analysis */}
              {commit.aiAnalysis && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-300">AI Analysis</p>
                    {commit.aiAnalysis.confidence > 0 && (
                      <span className={`text-xs font-bold ${getConfidenceColor(commit.aiAnalysis.confidence)}`}>
                        {commit.aiAnalysis.confidence}% confidence
                      </span>
                    )}
                  </div>

                  {commit.aiAnalysis.inferredTask && (
                    <div className="mb-2">
                      <p className="text-xs text-slate-400 mb-1">Inferred Task:</p>
                      <p className="text-sm font-bold text-cyan-300">
                        {commit.aiAnalysis.inferredTask.title}
                      </p>
                    </div>
                  )}

                  {commit.aiAnalysis.keywords && commit.aiAnalysis.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {commit.aiAnalysis.keywords.slice(0, 5).map((kw, i) => (
                        <span key={i} className="text-xs bg-white/10 text-slate-400 px-2 py-0.5 rounded">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {commit.aiAnalysis.completionIndicators && (
                    <div className="flex gap-2">
                      {commit.aiAnalysis.completionIndicators.hasTests && (
                        <span className="text-xs text-emerald-300">✓ Tests</span>
                      )}
                      {commit.aiAnalysis.completionIndicators.hasDocs && (
                        <span className="text-xs text-blue-300">✓ Docs</span>
                      )}
                      {commit.aiAnalysis.completionIndicators.isComplete && (
                        <span className="text-xs text-violet-300">✓ Complete</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 mt-3 text-xs">
                <span className="text-emerald-300">+{commit.additions}</span>
                <span className="text-red-300">-{commit.deletions}</span>
                <span className="text-slate-400">{commit.filesChanged?.length || 0} files</span>
                {commit.branch && (
                  <span className="text-slate-500">
                    <span className="text-slate-600">⎇</span> {commit.branch}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
