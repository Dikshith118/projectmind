import { useState, useMemo } from 'react';

export default function FocusMode({
  tasks = [],
  completionPct = 0,
  riskLevel = 'Low',
  onReschedule,
}) {
  const [workflowStage, setWorkflowStage] = useState('current'); // previous, current, next
  const [subTab, setSubTab] = useState('next'); // next, risk, plan
  const [startingTask, setStartingTask] = useState(false);

  // Categorize tasks
  const completedTasks = useMemo(() => 
    tasks.filter(t => t.status === 'done').sort((a, b) => 
      new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
    ), [tasks]
  );

  const activeTasks = useMemo(() => 
    tasks.filter(t => t.status === 'partial'), [tasks]
  );

  const pendingTasks = useMemo(() => 
    tasks.filter(t => t.status === 'pending' || t.status === 'skipped'), [tasks]
  );

  const highPriorityPending = useMemo(() => 
    pendingTasks.filter(t => t.priority === 'high'), [pendingTasks]
  );

  // Calculate metrics
  const totalCompleted = completedTasks.length;
  const totalPending = pendingTasks.length;
  const totalActive = activeTasks.length;
  const workLeft = pendingTasks.reduce((sum, t) => sum + (t.estimatedH || 0), 0);
  const workCompleted = completedTasks.reduce((sum, t) => sum + (t.estimatedH || 0), 0);

  // AI Insights
  const generatePreviousInsights = () => {
    if (totalCompleted === 0) {
      return {
        next: {
          title: 'No Completed Tasks Yet',
          icon: '📝',
          description: 'Start working on your first task to build momentum.',
          tasks: [],
          metrics: { completed: 0, hours: 0, streak: 0 }
        },
        risk: {
          title: 'No Historical Data',
          icon: '⏳',
          description: 'Complete tasks to analyze your productivity patterns.',
          warnings: []
        },
        plan: {
          title: 'Build Your Track Record',
          icon: '🎯',
          description: 'Focus on completing high-priority tasks first to establish a strong foundation.',
          suggestions: ['Start with high-priority tasks', 'Maintain consistent work patterns', 'Track your progress daily']
        }
      };
    }

    const recentTasks = completedTasks.slice(0, 5);
    const avgCompletionRate = totalCompleted / (totalCompleted + totalPending + totalActive) * 100;
    const productivity = avgCompletionRate > 70 ? 'excellent' : avgCompletionRate > 50 ? 'good' : 'needs improvement';

    return {
      next: {
        title: 'Recently Completed',
        icon: '✅',
        description: `You've completed ${totalCompleted} tasks with ${workCompleted}h of work.`,
        tasks: recentTasks,
        metrics: {
          completed: totalCompleted,
          hours: workCompleted,
          streak: Math.min(totalCompleted, 7)
        }
      },
      risk: {
        title: 'Productivity Analysis',
        icon: '📊',
        description: `Your completion rate is ${avgCompletionRate.toFixed(0)}% - ${productivity}.`,
        warnings: avgCompletionRate < 50 ? [
          'Completion rate below 50%',
          'Consider breaking tasks into smaller chunks',
          'Review time estimates for accuracy'
        ] : []
      },
      plan: {
        title: 'AI Retrospective',
        icon: '🧠',
        description: productivity === 'excellent' 
          ? 'Excellent work! Continue your current approach and maintain momentum.'
          : productivity === 'good'
          ? 'Good progress. Focus on completing high-priority tasks to improve efficiency.'
          : 'Consider optimizing your workflow. Break large tasks into smaller milestones.',
        suggestions: [
          `Completed ${totalCompleted} tasks successfully`,
          `Maintain ${productivity} productivity patterns`,
          'Focus on consistency over speed'
        ]
      }
    };
  };

  const generateCurrentInsights = () => {
    const currentTask = activeTasks[0];
    
    if (!currentTask) {
      return {
        next: {
          title: 'No Active Task',
          icon: '⏸️',
          description: 'Start working on a task to track your current progress.',
          task: null,
          progress: 0
        },
        risk: {
          title: 'No Active Work',
          icon: '⚠️',
          description: 'Begin a task to monitor productivity and deadline risks.',
          warnings: []
        },
        plan: {
          title: 'Start Working',
          icon: '🚀',
          description: 'Select a high-priority task and begin execution.',
          suggestions: ['Choose next task from recommendations', 'Set a focus timer', 'Minimize distractions']
        }
      };
    }

    const progress = (currentTask.activityMinutes || 0) / ((currentTask.estimatedH || 1) * 60) * 100;
    const isSlowProgress = progress < 30 && (currentTask.activityMinutes || 0) > 60;

    return {
      next: {
        title: 'Currently Working On',
        icon: '⚡',
        description: `"${currentTask.title}" - ${progress.toFixed(0)}% complete`,
        task: currentTask,
        progress: Math.min(progress, 100),
        timeSpent: Math.round((currentTask.activityMinutes || 0) / 60 * 10) / 10
      },
      risk: {
        title: isSlowProgress ? 'Slow Progress Detected' : 'On Track',
        icon: isSlowProgress ? '⚠️' : '✅',
        description: isSlowProgress 
          ? 'Current task is taking longer than expected. Consider breaking it down or seeking help.'
          : 'Current task progress is healthy. Keep up the momentum.',
        warnings: isSlowProgress ? [
          'Task taking longer than estimated',
          'May impact downstream tasks',
          'Consider asking for help or breaking it down'
        ] : []
      },
      plan: {
        title: 'Focus Strategy',
        icon: '🎯',
        description: 'AI recommends maintaining focus on current task until completion.',
        suggestions: [
          'Complete current task before switching',
          'Take short breaks every 25 minutes',
          'Eliminate distractions and notifications',
          'Track time to improve future estimates'
        ]
      }
    };
  };

  const generateNextInsights = () => {
    const nextTask = highPriorityPending[0] || pendingTasks[0];
    
    if (!nextTask) {
      return {
        next: {
          title: 'All Tasks Complete!',
          icon: '🎉',
          description: 'Congratulations! All tasks are completed. Time to review and present.',
          task: null,
          impact: 'high'
        },
        risk: {
          title: 'No Pending Risks',
          icon: '✅',
          description: 'All tasks completed successfully. Project is ready for delivery.',
          risks: []
        },
        plan: {
          title: 'Project Complete',
          icon: '🏆',
          description: 'Focus on final review, testing, and presentation preparation.',
          suggestions: [
            'Review all completed work',
            'Prepare demo and presentation',
            'Document lessons learned',
            'Celebrate your success!'
          ]
        }
      };
    }

    const upcomingHighRisk = highPriorityPending.slice(0, 3);
    const hasDeadlineRisk = riskLevel === 'High' || riskLevel === 'Medium';

    return {
      next: {
        title: 'Next Best Action',
        icon: '🎯',
        description: `"${nextTask.title}" - ${nextTask.priority} priority, ${nextTask.estimatedH}h estimated`,
        task: nextTask,
        impact: nextTask.priority,
        reasoning: nextTask.priority === 'high' 
          ? 'This task has the highest priority and impact on project success.'
          : 'This task is next in sequence and should be completed soon.'
      },
      risk: {
        title: hasDeadlineRisk ? 'Deadline Risk Detected' : 'Low Risk Ahead',
        icon: hasDeadlineRisk ? '⚠️' : '✅',
        description: hasDeadlineRisk
          ? `${highPriorityPending.length} high-priority tasks remaining. Deadline pressure increasing.`
          : 'Project timeline is healthy. Continue current pace.',
        risks: upcomingHighRisk.map(t => ({
          task: t.title,
          priority: t.priority,
          hours: t.estimatedH
        }))
      },
      plan: {
        title: 'AI Optimization Plan',
        icon: '🧠',
        description: hasDeadlineRisk
          ? 'AI recommends optimizing your schedule to reduce deadline risk.'
          : 'Current plan is optimal. Focus on execution and consistency.',
        suggestions: hasDeadlineRisk ? [
          'Complete high-priority tasks first',
          'Consider parallel work on independent tasks',
          'Use AI Optimize to redistribute workload',
          'Increase daily work hours if possible'
        ] : [
          'Maintain current pace',
          'Complete tasks in priority order',
          'Avoid scope creep',
          'Stay consistent with daily goals'
        ]
      }
    };
  };

  // Get current insights based on workflow stage
  const insights = useMemo(() => {
    switch (workflowStage) {
      case 'previous':
        return generatePreviousInsights();
      case 'current':
        return generateCurrentInsights();
      case 'next':
        return generateNextInsights();
      default:
        return generateCurrentInsights();
    }
  }, [workflowStage, tasks, completionPct, riskLevel]);

  const currentInsight = insights[subTab];

  // Handle starting recommended action
  const handleStartRecommendedAction = () => {
    const nextTask = highPriorityPending[0] || pendingTasks[0];
    
    if (!nextTask) {
      alert('No pending tasks available to start.');
      return;
    }

    setStartingTask(true);
    
    // Show success message
    setTimeout(() => {
      alert(`✅ Started working on: "${nextTask.title}"\n\nPriority: ${nextTask.priority}\nEstimated: ${nextTask.estimatedH}h\n\nFocus on completing this task before moving to the next one.`);
      setStartingTask(false);
      
      // Switch to Current workflow to show active task
      setWorkflowStage('current');
      setSubTab('next');
    }, 500);
  };

  // Handle AI optimization
  const handleOptimizeWithAI = async () => {
    if (!onReschedule) {
      alert('⚠️ Reschedule function not available. Please try again from the main dashboard.');
      return;
    }

    try {
      await onReschedule();
    } catch (error) {
      console.error('Optimization error:', error);
      alert('❌ Failed to optimize plan. Please try again.');
    }
  };

  // Workflow stage configs
  const workflowStages = [
    { id: 'previous', icon: '🕘', label: 'Previous', color: 'from-blue-500 to-cyan-500' },
    { id: 'current', icon: '⚡', label: 'Current', color: 'from-violet-500 to-fuchsia-600' },
    { id: 'next', icon: '🎯', label: 'Next', color: 'from-emerald-500 to-teal-500' }
  ];

  const subTabs = [
    { id: 'next', icon: workflowStage === 'previous' ? '✅' : workflowStage === 'current' ? '⚡' : '🎯', label: 'Next' },
    { id: 'risk', icon: '⚠️', label: 'Risk' },
    { id: 'plan', icon: '🧠', label: 'Plan' }
  ];

  return (
    <div className="glass-card rounded-3xl p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-bold text-violet-300 uppercase tracking-wide mb-2">
          🚀 AI Workflow System
        </p>
        <h2 className="text-3xl font-black text-white mb-2">
          Deep Focus Mode
        </h2>
        <p className="text-sm text-slate-400">
          AI-powered productivity lifecycle: Past → Present → Future
        </p>
      </div>

      {/* Workflow Stage Selector */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {workflowStages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => {
              setWorkflowStage(stage.id);
              setSubTab('next');
            }}
            className={`
              relative overflow-hidden rounded-2xl p-4 border-2 transition-all duration-300
              ${workflowStage === stage.id
                ? `bg-gradient-to-br ${stage.color} border-white/30 shadow-xl scale-105`
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }
            `}
          >
            <div className="relative z-10">
              <p className="text-2xl mb-1">{stage.icon}</p>
              <p className={`text-sm font-black ${
                workflowStage === stage.id ? 'text-white' : 'text-slate-300'
              }`}>
                {stage.label}
              </p>
            </div>
            {workflowStage === stage.id && (
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            )}
          </button>
        ))}
      </div>

      {/* Sub-tabs */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`
              py-3 rounded-xl text-sm font-bold border transition-all duration-200
              ${subTab === tab.id
                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white border-violet-400 shadow-lg shadow-violet-500/50'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-violet-400/30'
              }
            `}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-6 mb-6 backdrop-blur-sm">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-400/30 flex items-center justify-center text-3xl shadow-lg shadow-violet-500/20">
            {currentInsight.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-white mb-2">
              {currentInsight.title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {currentInsight.description}
            </p>
          </div>
        </div>

        {/* Stage-specific content */}
        {workflowStage === 'previous' && subTab === 'next' && currentInsight.tasks?.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-bold text-violet-300 uppercase mb-2">Recent Completions</p>
            {currentInsight.tasks.slice(0, 3).map((task, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                <span className="text-lg">✅</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{task.title}</p>
                  <p className="text-xs text-slate-400">Day {task.day} • {task.estimatedH}h</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {workflowStage === 'current' && subTab === 'next' && currentInsight.task && (
          <div className="mt-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-white">{currentInsight.task.title}</p>
                <span className="text-xs bg-violet-500/20 text-violet-300 px-3 py-1 rounded-full font-bold">
                  {currentInsight.progress?.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-600 rounded-full transition-all duration-500"
                  style={{ width: `${currentInsight.progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">
                {currentInsight.timeSpent}h spent • {currentInsight.task.estimatedH}h estimated
              </p>
            </div>
          </div>
        )}

        {workflowStage === 'next' && subTab === 'next' && currentInsight.task && (
          <div className="mt-4">
            <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-400/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-white">{currentInsight.task.title}</p>
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                  currentInsight.impact === 'high' 
                    ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                }`}>
                  {currentInsight.impact} priority
                </span>
              </div>
              <p className="text-xs text-violet-300 mb-2">
                📊 {currentInsight.task.estimatedH}h estimated • Day {currentInsight.task.day}
              </p>
              {currentInsight.reasoning && (
                <p className="text-xs text-slate-300 italic">
                  💡 {currentInsight.reasoning}
                </p>
              )}
            </div>
          </div>
        )}

        {subTab === 'risk' && (currentInsight.warnings?.length > 0 || currentInsight.risks?.length > 0) && (
          <div className="mt-4 space-y-2">
            {currentInsight.warnings?.map((warning, i) => (
              <div key={i} className="bg-red-500/10 border border-red-400/30 rounded-xl p-3 flex items-start gap-2">
                <span className="text-red-400 mt-0.5">⚠️</span>
                <p className="text-xs text-red-300">{warning}</p>
              </div>
            ))}
            {currentInsight.risks?.map((risk, i) => (
              <div key={i} className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-3">
                <p className="text-sm font-semibold text-yellow-300">{risk.task}</p>
                <p className="text-xs text-yellow-200/70">{risk.priority} priority • {risk.hours}h</p>
              </div>
            ))}
          </div>
        )}

        {subTab === 'plan' && currentInsight.suggestions?.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-bold text-violet-300 uppercase mb-2">AI Recommendations</p>
            {currentInsight.suggestions.map((suggestion, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">•</span>
                <p className="text-xs text-slate-300">{suggestion}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {workflowStage === 'previous' && (
          <>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-emerald-300">{totalCompleted}</p>
              <p className="text-[10px] text-slate-400 uppercase">Completed</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-violet-300">{workCompleted}h</p>
              <p className="text-[10px] text-slate-400 uppercase">Hours Done</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-blue-300">{Math.min(totalCompleted, 7)}</p>
              <p className="text-[10px] text-slate-400 uppercase">Day Streak</p>
            </div>
          </>
        )}

        {workflowStage === 'current' && (
          <>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-violet-300">{totalActive}</p>
              <p className="text-[10px] text-slate-400 uppercase">Active</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-fuchsia-300">{completionPct}%</p>
              <p className="text-[10px] text-slate-400 uppercase">Progress</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className={`text-2xl font-black ${
                riskLevel === 'High' ? 'text-red-300' : 
                riskLevel === 'Medium' ? 'text-yellow-300' : 
                'text-emerald-300'
              }`}>
                {riskLevel}
              </p>
              <p className="text-[10px] text-slate-400 uppercase">Risk</p>
            </div>
          </>
        )}

        {workflowStage === 'next' && (
          <>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-white">{totalPending}</p>
              <p className="text-[10px] text-slate-400 uppercase">Pending</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-red-300">{highPriorityPending.length}</p>
              <p className="text-[10px] text-slate-400 uppercase">High Risk</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-violet-300">{workLeft}h</p>
              <p className="text-[10px] text-slate-400 uppercase">Work Left</p>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-3">
        {workflowStage === 'next' && (
          <button
            onClick={handleStartRecommendedAction}
            disabled={!pendingTasks.length || startingTask}
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/30"
          >
            {startingTask ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Starting...
              </span>
            ) : (
              <>
                <span className="text-lg mr-2">🚀</span>
                Start Recommended Action
              </>
            )}
          </button>
        )}
      </div>

      {/* Footer Status */}
      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
        <span>AI Confidence: {totalCompleted > 5 ? 'High' : totalCompleted > 2 ? 'Medium' : 'Building...'}</span>
        <span>Progress: {completionPct}% • Risk: {riskLevel}</span>
      </div>
    </div>
  );
}
