import { useEffect, useRef } from 'react';

export default function LiveActivityFeed({ activityFeed, connected }) {
  const feedRef = useRef(null);

  // Auto-scroll to top when new activity arrives
  useEffect(() => {
    if (feedRef.current && activityFeed.length > 0) {
      feedRef.current.scrollTop = 0;
    }
  }, [activityFeed]);

  const getEventIcon = (event) => {
    switch (event.type) {
      case 'activity':
        if (event.data.event === 'edit') return '✏️';
        if (event.data.event === 'save') return '💾';
        if (event.data.event === 'open') return '📂';
        return '📝';
      case 'task':
        if (event.action === 'completed') return '✅';
        if (event.action === 'created') return '➕';
        return '📋';
      case 'project':
        return '📊';
      case 'risk':
        return event.data.severity === 'increased' ? '⚠️' : '✅';
      case 'task_inference':
        return '🤖';
      case 'focus_session':
        return '🎯';
      case 'milestone':
        return '🎉';
      default:
        return '📌';
    }
  };

  const getEventColor = (event) => {
    switch (event.type) {
      case 'activity':
        if (event.data.event === 'save') return 'text-emerald-300';
        if (event.data.event === 'edit') return 'text-cyan-300';
        return 'text-blue-300';
      case 'task':
        if (event.action === 'completed') return 'text-emerald-300';
        return 'text-violet-300';
      case 'risk':
        return event.data.severity === 'increased' ? 'text-red-300' : 'text-emerald-300';
      case 'task_inference':
        return 'text-violet-300';
      case 'focus_session':
        return 'text-cyan-300';
      case 'milestone':
        return 'text-yellow-300';
      default:
        return 'text-slate-300';
    }
  };

  const getEventMessage = (event) => {
    switch (event.type) {
      case 'activity':
        return `${event.data.event} on ${event.data.file}`;
      case 'task':
        return `Task ${event.action}: ${event.data.title}`;
      case 'project':
        return `Project updated: ${event.data.daysBehind} days behind`;
      case 'risk':
        return `Risk ${event.data.oldLevel} → ${event.data.newLevel}`;
      case 'task_inference':
        return `AI detected: "${event.data.taskTitle}" likely complete (${event.data.confidence}%)`;
      case 'focus_session':
        return `Focus session ${event.action}: ${event.data.duration}min`;
      case 'milestone':
        return `Milestone: ${event.data.title}`;
      default:
        return 'Activity update';
    }
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
    
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            📡 Live Activity
          </h3>
          {connected && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-xs text-emerald-300 font-bold">LIVE</span>
            </div>
          )}
        </div>
        <span className="text-xs text-slate-400">Real-time updates</span>
      </div>

      {activityFeed.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📡</span>
          </div>
          <p className="text-slate-400 text-sm">Waiting for activity...</p>
          <p className="text-slate-500 text-xs mt-1">Start coding to see live updates</p>
        </div>
      ) : (
        <div 
          ref={feedRef}
          className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar"
        >
          {activityFeed.map((event, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all animate-slideIn"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="text-xl shrink-0">{getEventIcon(event)}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${getEventColor(event)} truncate`}>
                  {getEventMessage(event)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {getTimeAgo(event.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
