import { useState } from 'react';

export default function FocusMode({
  tasks = [],
  completionPct = 0,
  riskLevel = 'Low',
  onReschedule,
}) {
  const [selectedAction, setSelectedAction] = useState('next');
  const [started, setStarted] = useState(false);

  const pendingTasks = tasks.filter((t) => t.status !== 'done');
  const highPriorityTasks = pendingTasks.filter((t) => t.priority === 'high');
  const mediumPriorityTasks = pendingTasks.filter((t) => t.priority === 'medium');

  const nextTask = highPriorityTasks[0] || mediumPriorityTasks[0] || pendingTasks[0];

  const estimatedHours = pendingTasks.reduce(
    (sum, t) => sum + Number(t.estimatedH || 0),
    0
  );

  const recoveryPlan = [
    highPriorityTasks.length > 0
      ? `Finish ${highPriorityTasks.length} high-priority task first`
      : 'No urgent high-priority task pending',
    `Complete "${nextTask?.title || 'next pending task'}" before moving to lower priority work`,
    riskLevel === 'High'
      ? 'Use AI Optimize Plan to reduce deadline risk'
      : 'Continue current pace and avoid skipping tasks',
  ];

  const actionText = {
    next: {
      title: 'Next Best Action',
      icon: '🎯',
      text: nextTask
        ? `Start with "${nextTask.title}". This task has the highest impact right now.`
        : 'All tasks are completed. Review your project and prepare your presentation.',
    },
    risk: {
      title: 'Risk Analysis',
      icon: '⚠️',
      text:
        riskLevel === 'High'
          ? `Risk is HIGH because ${pendingTasks.length} tasks are still pending and important work may be delayed.`
          : riskLevel === 'Medium'
          ? `Risk is MEDIUM. You can still recover if you complete priority tasks today.`
          : `Risk is LOW. Your project is currently stable.`,
    },
    plan: {
      title: 'Recovery Plan',
      icon: '🧠',
      text: recoveryPlan.join(' → '),
    },
  };

  const current = actionText[selectedAction];

  return (
    <div className="glass-card rounded-3xl p-6">
      <p className="text-xs font-bold text-violet-300 uppercase tracking-wide mb-2">
        🚀 AI Action Center
      </p>

      <h2 className="text-2xl font-black text-white mb-2">
        What should I do next?
      </h2>

      <p className="text-sm text-slate-400 mb-5">
        AI converts your project status into clear actions, risk analysis, and a recovery plan.
      </p>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <button
          onClick={() => setSelectedAction('next')}
          className={`py-2 rounded-2xl text-xs font-bold border transition ${
            selectedAction === 'next'
              ? 'bg-violet-500 text-white border-violet-400'
              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
          }`}
        >
          🎯 Next
        </button>

        <button
          onClick={() => setSelectedAction('risk')}
          className={`py-2 rounded-2xl text-xs font-bold border transition ${
            selectedAction === 'risk'
              ? 'bg-violet-500 text-white border-violet-400'
              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
          }`}
        >
          ⚠️ Risk
        </button>

        <button
          onClick={() => setSelectedAction('plan')}
          className={`py-2 rounded-2xl text-xs font-bold border transition ${
            selectedAction === 'plan'
              ? 'bg-violet-500 text-white border-violet-400'
              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
          }`}
        >
          🧠 Plan
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-4">
        <p className="text-3xl mb-2">{current.icon}</p>
        <h3 className="text-white font-black text-lg mb-2">
          {current.title}
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          {current.text}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-white">{pendingTasks.length}</p>
          <p className="text-[10px] text-slate-400">Pending</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-red-300">{highPriorityTasks.length}</p>
          <p className="text-[10px] text-slate-400">High Risk</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-violet-300">{estimatedHours}h</p>
          <p className="text-[10px] text-slate-400">Work Left</p>
        </div>
      </div>

      {started && (
        <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-2xl p-4 mb-4">
          <p className="text-emerald-300 font-black text-sm mb-2">
            ✅ AI Execution Started
          </p>

          <ul className="text-xs text-emerald-100/80 space-y-1">
            <li>• Focus on one recommended task</li>
            <li>• Avoid switching tasks</li>
            <li>• Complete high-priority work first</li>
            <li>• Recheck risk after completion</li>
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => setStarted(true)}
          disabled={!nextTask}
          className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white py-3 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition"
        >
          Start Recommended Action
        </button>

        {onReschedule && (
          <button
            onClick={onReschedule}
            className="w-full bg-white/5 border border-violet-400/30 text-violet-200 py-3 rounded-2xl text-sm font-bold hover:bg-violet-500/10 transition"
          >
            Optimize Full Plan with AI
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500 mt-4 text-center">
        Progress: {completionPct}% • Risk: {riskLevel}
      </p>
    </div>
  );
}