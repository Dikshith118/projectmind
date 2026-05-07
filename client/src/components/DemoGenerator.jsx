import { useState } from 'react';
import { useAIFeatures } from '../hooks/useAIFeatures';

export default function DemoGenerator({ projectId }) {
  const [demo, setDemo] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    problem: true,
    features: true,
    techStack: true,
    futureScope: true,
    demoScript: true,
  });
  const { loading, error, generateDemo } = useAIFeatures();

  const handleGenerate = async () => {
    try {
      const result = await generateDemo(projectId);
      setDemo(result);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = (text, sectionName) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
    console.log(`${sectionName} copied to clipboard`);
  };

  const exportAsMarkdown = () => {
    if (!demo) return;
    
    const markdown = `# ${demo.overview.split('.')[0]}

## Project Overview
${demo.overview}

## Problem Statement
${demo.problem}

## Implemented Features
${demo.features?.map(f => `- ${f}`).join('\n')}

## Tech Stack
${demo.techStack?.map(t => `- ${t}`).join('\n')}

## Future Scope
${demo.futureScope?.map(f => `- ${f}`).join('\n')}

## Demo Script
${demo.demoScript?.map((s, i) => `${i + 1}. ${s}`).join('\n')}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demo-summary.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsText = () => {
    if (!demo) return;
    
    const text = `PROJECT DEMO SUMMARY

PROJECT OVERVIEW
${demo.overview}

PROBLEM STATEMENT
${demo.problem}

IMPLEMENTED FEATURES
${demo.features?.map(f => `• ${f}`).join('\n')}

TECH STACK
${demo.techStack?.join(', ')}

FUTURE SCOPE
${demo.futureScope?.map(f => `• ${f}`).join('\n')}

DEMO SCRIPT
${demo.demoScript?.map((s, i) => `${i + 1}. ${s}`).join('\n')}
`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demo-summary.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
          <span className="text-2xl">📄</span>
        </div>
        <div>
          <h2 className="text-xl font-black text-white">AI Demo Generator</h2>
          <p className="text-xs text-slate-400">Generate presentation summary</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl mb-4 text-sm">
          {error}
        </div>
      )}

      {!demo ? (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-sm text-slate-300 mb-2">
              Generate a comprehensive demo summary for your project
            </p>
            <p className="text-xs text-slate-500">
              Includes overview, features, tech stack, and demo script
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition shadow-lg shadow-blue-900/40"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Generating...
              </span>
            ) : (
              'Generate Demo Summary'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={exportAsMarkdown}
              className="flex-1 bg-white/5 border border-white/10 text-slate-300 py-2 px-3 rounded-xl text-xs font-bold hover:bg-white/10 transition"
            >
              📥 Export MD
            </button>
            <button
              onClick={exportAsText}
              className="flex-1 bg-white/5 border border-white/10 text-slate-300 py-2 px-3 rounded-xl text-xs font-bold hover:bg-white/10 transition"
            >
              📄 Export TXT
            </button>
          </div>

          {/* Project Overview */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleSection('overview')}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
            >
              <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                ✅ Project Overview
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(demo.overview, 'Overview');
                  }}
                  className="text-slate-400 hover:text-white transition"
                >
                  📋
                </button>
                <span className="text-slate-400">
                  {expandedSections.overview ? '▼' : '▶'}
                </span>
              </div>
            </button>
            {expandedSections.overview && (
              <div className="px-4 pb-4">
                <p className="text-sm text-slate-300 leading-relaxed">{demo.overview}</p>
              </div>
            )}
          </div>

          {/* Problem Statement */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleSection('problem')}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
            >
              <h3 className="text-sm font-bold text-yellow-300 flex items-center gap-2">
                ❓ Problem Statement
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(demo.problem, 'Problem Statement');
                  }}
                  className="text-slate-400 hover:text-white transition"
                >
                  📋
                </button>
                <span className="text-slate-400">
                  {expandedSections.problem ? '▼' : '▶'}
                </span>
              </div>
            </button>
            {expandedSections.problem && (
              <div className="px-4 pb-4">
                <p className="text-sm text-slate-300 leading-relaxed">{demo.problem}</p>
              </div>
            )}
          </div>

          {/* Implemented Features */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleSection('features')}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
            >
              <h3 className="text-sm font-bold text-violet-300 flex items-center gap-2">
                🎯 Implemented Features
                <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">
                  {demo.features?.length || 0}
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(demo.features?.join('\n'), 'Features');
                  }}
                  className="text-slate-400 hover:text-white transition"
                >
                  📋
                </button>
                <span className="text-slate-400">
                  {expandedSections.features ? '▼' : '▶'}
                </span>
              </div>
            </button>
            {expandedSections.features && (
              <div className="px-4 pb-4">
                <ul className="space-y-2">
                  {demo.features?.map((f, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-violet-400 mt-0.5">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Tech Stack */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleSection('techStack')}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
            >
              <h3 className="text-sm font-bold text-blue-300 flex items-center gap-2">
                ⚙️ Tech Stack
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(demo.techStack?.join(', '), 'Tech Stack');
                  }}
                  className="text-slate-400 hover:text-white transition"
                >
                  📋
                </button>
                <span className="text-slate-400">
                  {expandedSections.techStack ? '▼' : '▶'}
                </span>
              </div>
            </button>
            {expandedSections.techStack && (
              <div className="px-4 pb-4">
                <div className="flex flex-wrap gap-2">
                  {demo.techStack?.map((tech, i) => (
                    <span 
                      key={i} 
                      className="text-xs bg-blue-500/15 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-full font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Future Scope */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleSection('futureScope')}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
            >
              <h3 className="text-sm font-bold text-fuchsia-300 flex items-center gap-2">
                🚀 Future Scope
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(demo.futureScope?.join('\n'), 'Future Scope');
                  }}
                  className="text-slate-400 hover:text-white transition"
                >
                  📋
                </button>
                <span className="text-slate-400">
                  {expandedSections.futureScope ? '▼' : '▶'}
                </span>
              </div>
            </button>
            {expandedSections.futureScope && (
              <div className="px-4 pb-4">
                <ul className="space-y-2">
                  {demo.futureScope?.map((f, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-fuchsia-400 mt-0.5">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Demo Script */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleSection('demoScript')}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
            >
              <h3 className="text-sm font-bold text-orange-300 flex items-center gap-2">
                🎬 Demo Script
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(
                      demo.demoScript?.map((s, i) => `${i + 1}. ${s}`).join('\n'),
                      'Demo Script'
                    );
                  }}
                  className="text-slate-400 hover:text-white transition"
                >
                  📋
                </button>
                <span className="text-slate-400">
                  {expandedSections.demoScript ? '▼' : '▶'}
                </span>
              </div>
            </button>
            {expandedSections.demoScript && (
              <div className="px-4 pb-4">
                <ol className="space-y-3">
                  {demo.demoScript?.map((step, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-3">
                      <span className="font-bold text-orange-300 shrink-0">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setDemo(null)}
              className="flex-1 bg-white/5 border border-white/10 text-slate-300 py-3 rounded-2xl font-bold hover:bg-white/10 transition"
            >
              Generate New
            </button>
            <button
              onClick={() => {
                const allText = `${demo.overview}\n\n${demo.problem}\n\n${demo.features?.join('\n')}\n\n${demo.techStack?.join(', ')}\n\n${demo.futureScope?.join('\n')}\n\n${demo.demoScript?.join('\n')}`;
                copyToClipboard(allText, 'Full Demo');
              }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition shadow-lg shadow-blue-900/40"
            >
              📋 Copy All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
