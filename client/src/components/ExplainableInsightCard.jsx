import { useState } from 'react';

export default function ExplainableInsightCard({ 
  title, 
  value, 
  explanation, 
  icon = '🤖',
  type = 'info' // 'info', 'success', 'warning', 'error'
}) {
  const [expanded, setExpanded] = useState(false);

  if (!explanation) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 bg-emerald-500/5';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'error':
        return 'border-red-500/30 bg-red-500/5';
      default:
        return 'border-cyan-500/30 bg-cyan-500/5';
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 90) return 'text-emerald-300';
    if (score >= 75) return 'text-cyan-300';
    if (score >= 60) return 'text-yellow-300';
    if (score >= 40) return 'text-orange-300';
    return 'text-red-300';
  };

  const getConfidenceBg = (score) => {
    if (score >= 90) return 'bg-emerald-500/15 border-emerald-500/30';
    if (score >= 75) return 'bg-cyan-500/15 border-cyan-500/30';
    if (score >= 60) return 'bg-yellow-500/15 border-yellow-500/30';
    if (score >= 40) return 'bg-orange-500/15 border-orange-500/30';
    return 'bg-red-500/15 border-red-500/30';
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'critical':
        return 'text-red-300 bg-red-500/15';
      case 'high':
        return 'text-orange-300 bg-orange-500/15';
      case 'medium':
        return 'text-yellow-300 bg-yellow-500/15';
      case 'low':
        return 'text-blue-300 bg-blue-500/15';
      case 'positive':
        return 'text-emerald-300 bg-emerald-500/15';
      case 'neutral':
        return 'text-slate-300 bg-slate-500/15';
      case 'negative':
        return 'text-orange-300 bg-orange-500/15';
      default:
        return 'text-slate-300 bg-slate-500/15';
    }
  };

  return (
    <div className={`border rounded-2xl p-6 ${getTypeStyles()} transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="text-lg font-black text-white">{title}</h3>
            {value && <p className="text-2xl font-black text-white mt-1">{value}</p>}
          </div>
        </div>

        {/* Confidence Badge */}
        {explanation.confidence !== undefined && (
          <div className={`${getConfidenceBg(explanation.confidence)} border rounded-xl px-3 py-2 text-center`}>
            <p className={`text-xs font-bold ${getConfidenceColor(explanation.confidence)}`}>
              {explanation.confidence}%
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {explanation.confidenceLevel || 'Confidence'}
            </p>
          </div>
        )}
      </div>

      {/* Reasoning Summary */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
        <p className="text-sm text-slate-200 leading-relaxed">
          {explanation.reasoning}
        </p>
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10 transition text-sm font-bold text-slate-300"
      >
        <span>{expanded ? '▼ Hide Details' : '▶ Show Detailed Reasoning'}</span>
        <span className="text-xs text-slate-500">
          {explanation.factors?.length || 0} factors
        </span>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 space-y-4 animate-slideIn">
          {/* Contributing Factors */}
          {explanation.factors && explanation.factors.length > 0 && (
            <div>
              <h4 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                📊 Contributing Factors
              </h4>
              <div className="space-y-2">
                {explanation.factors.map((factor, i) => (
                  <div
                    key={i}
                    className="bg-white/5 border border-white/10 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-bold text-white">{factor.factor}</p>
                      <div className="flex items-center gap-2">
                        {factor.weight !== undefined && (
                          <span className="text-xs text-slate-400">
                            Weight: {factor.weight}%
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${getImpactColor(factor.impact)}`}>
                          {factor.impact}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {factor.description}
                    </p>
                    {factor.score !== undefined && (
                      <div className="mt-2">
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              factor.score >= 80 ? 'bg-emerald-500' :
                              factor.score >= 60 ? 'bg-cyan-500' :
                              factor.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${factor.score}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Score: {factor.score}/100</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence */}
          {explanation.evidence && explanation.evidence.length > 0 && (
            <div>
              <h4 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                🔍 Evidence
              </h4>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <ul className="space-y-2">
                  {explanation.evidence.map((item, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Recommendation */}
          {explanation.recommendation && (
            <div>
              <h4 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                💡 Recommendation
              </h4>
              <div className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-400/30 rounded-xl p-4">
                <p className="text-sm text-slate-200 leading-relaxed">
                  {explanation.recommendation}
                </p>
              </div>
            </div>
          )}

          {/* Confidence Factors */}
          {explanation.confidenceFactors && explanation.confidenceFactors.length > 0 && (
            <div>
              <h4 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                ⚖️ Confidence Factors
              </h4>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <ul className="space-y-1">
                  {explanation.confidenceFactors.map((factor, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">⚠</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
