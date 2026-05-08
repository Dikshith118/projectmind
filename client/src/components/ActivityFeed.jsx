import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import api from '../api/client';

export default function ActivityFeed({ projectId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchActivities();

    // Setup Socket.IO connection
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const newSocket = io(socketUrl);

    newSocket.on('connect', () => {
      console.log('[Socket.IO] Connected');
      newSocket.emit('join:project', projectId);
    });

    newSocket.on('activity:update', () => {
      fetchActivities();
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit('leave:project', projectId);
        newSocket.disconnect();
      }
    };
  }, [projectId]);

  const fetchActivities = async () => {
    try {
      const res = await api.get(`/api/activity/${projectId}/feed?limit=20`);
      setActivities(res.data);
    } catch (err) {
      console.error('Failed to fetch activity feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (event) => {
    switch (event) {
      case 'edit': return '✏️';
      case 'save': return '💾';
      case 'open': return '📂';
      case 'commit': return '✅';
      default: return '📝';
    }
  };

  const getEventColor = (event) => {
    switch (event) {
      case 'edit': return 'text-cyan-300';
      case 'save': return 'text-emerald-300';
      case 'open': return 'text-blue-300';
      case 'commit': return 'text-violet-300';
      default: return 'text-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-black text-white mb-4">📡 Live Activity</h3>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse h-12 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          📡 Live Activity
          {socket?.connected && (
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          )}
        </h3>
        <span className="text-xs text-slate-400">Last 20 events</span>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
          {activities.map((activity, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition"
            >
              <span className="text-xl">{getEventIcon(activity.event)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 font-medium truncate">
                  {activity.file}
                </p>
                <p className={`text-xs ${getEventColor(activity.event)} font-bold`}>
                  {activity.event.toUpperCase()}
                </p>
              </div>
              <span className="text-xs text-slate-500 shrink-0">
                {activity.timeAgo}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
