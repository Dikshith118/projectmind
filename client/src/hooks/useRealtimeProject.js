import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

/**
 * REAL-TIME PROJECT HOOK
 * 
 * Manages Socket.IO connection and real-time updates for a project
 * Provides live activity feed, metrics, and notifications
 */
export default function useRealtimeProject(projectId, userId) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [activityFeed, setActivityFeed] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [connectedClients, setConnectedClients] = useState(0);
  const [typingUsers, setTypingUsers] = useState(new Set());

  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!projectId) return;

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts
    });

    socketRef.current = newSocket;

    // Connection events
    newSocket.on('connect', () => {
      console.log('[Realtime] Connected to server');
      setConnected(true);
      reconnectAttempts.current = 0;

      // Authenticate
      if (userId) {
        newSocket.emit('authenticate', { userId });
      }

      // Join project room
      newSocket.emit('join:project', projectId);
    });

    newSocket.on('disconnect', () => {
      console.log('[Realtime] Disconnected from server');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Realtime] Connection error:', error.message);
      reconnectAttempts.current++;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('[Realtime] Max reconnection attempts reached');
      }
    });

    // Project events
    newSocket.on('project:clients', (data) => {
      setConnectedClients(data.count);
    });

    // Activity events
    newSocket.on('activity:new', (event) => {
      setActivityFeed(prev => [event, ...prev].slice(0, 50));
    });

    // Task events
    newSocket.on('task:update', (event) => {
      setActivityFeed(prev => [event, ...prev].slice(0, 50));
      
      if (event.action === 'completed') {
        addNotification({
          type: 'success',
          title: 'Task Completed',
          message: `"${event.data.title}" marked as done`,
          icon: '✅'
        });
      }
    });

    // Project updates
    newSocket.on('project:update', (event) => {
      setActivityFeed(prev => [event, ...prev].slice(0, 50));
    });

    // Productivity updates
    newSocket.on('productivity:update', (event) => {
      setLiveMetrics(event.data);
    });

    // AI insights
    newSocket.on('ai:insight', (event) => {
      addNotification({
        type: 'info',
        title: 'AI Insight',
        message: event.data.insights?.[0] || 'New insight available',
        icon: '🤖'
      });
    });

    // Risk changes
    newSocket.on('risk:change', (event) => {
      const { oldLevel, newLevel, severity } = event.data;
      
      addNotification({
        type: severity === 'increased' ? 'warning' : 'success',
        title: 'Risk Level Changed',
        message: `Risk changed from ${oldLevel} to ${newLevel}`,
        icon: severity === 'increased' ? '⚠️' : '✅'
      });

      setActivityFeed(prev => [event, ...prev].slice(0, 50));
    });

    // Focus session events
    newSocket.on('focus:start', (event) => {
      addNotification({
        type: 'info',
        title: 'Focus Session Started',
        message: `Deep focus session detected (${event.data.duration}min)`,
        icon: '🎯'
      });
    });

    newSocket.on('focus:end', (event) => {
      addNotification({
        type: 'success',
        title: 'Focus Session Complete',
        message: `Completed ${event.data.duration}min focus session`,
        icon: '🌟'
      });
    });

    // Task inference
    newSocket.on('task:inference', (event) => {
      addNotification({
        type: 'info',
        title: 'AI Detected Completion',
        message: `"${event.data.taskTitle}" appears complete (${event.data.confidence}% confidence)`,
        icon: '🤖'
      });

      setActivityFeed(prev => [event, ...prev].slice(0, 50));
    });

    // Stalled task
    newSocket.on('task:stalled', (event) => {
      addNotification({
        type: 'warning',
        title: 'Task Stalled',
        message: `"${event.data.taskTitle}" - ${event.data.reason}`,
        icon: '⏸️'
      });
    });

    // Milestone reached
    newSocket.on('milestone:reached', (event) => {
      addNotification({
        type: 'success',
        title: 'Milestone Reached!',
        message: event.data.title,
        icon: '🎉'
      });
    });

    // Deadline warning
    newSocket.on('deadline:warning', (event) => {
      addNotification({
        type: 'warning',
        title: 'Deadline Approaching',
        message: event.data.message,
        icon: '⏰'
      });
    });

    // User presence
    newSocket.on('user:presence', (event) => {
      // Handle user online/offline status
      console.log('[Realtime] User presence:', event.data);
    });

    // Typing indicator
    newSocket.on('user:typing', (event) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (event.data.isTyping) {
          newSet.add(event.data.userId);
        } else {
          newSet.delete(event.data.userId);
        }
        return newSet;
      });
    });

    // AI processing status
    newSocket.on('ai:processing', (event) => {
      // Handle AI processing indicator
      console.log('[Realtime] AI processing:', event.data);
    });

    // Heartbeat
    const heartbeatInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit('heartbeat');
      }
    }, 30000); // Every 30 seconds

    newSocket.on('heartbeat:ack', (data) => {
      const latency = Date.now() - data.timestamp;
      console.log('[Realtime] Latency:', latency, 'ms');
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      clearInterval(heartbeatInterval);
      if (newSocket) {
        newSocket.emit('leave:project', projectId);
        newSocket.disconnect();
      }
    };
  }, [projectId, userId]);

  // Add notification
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [{ ...notification, id, timestamp: new Date() }, ...prev].slice(0, 10));

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // Request productivity update
  const requestProductivityUpdate = useCallback(() => {
    if (socket && connected) {
      socket.emit('request:productivity', projectId);
    }
  }, [socket, connected, projectId]);

  // Request AI insights
  const requestInsights = useCallback(() => {
    if (socket && connected) {
      socket.emit('request:insights', projectId);
    }
  }, [socket, connected, projectId]);

  // Send typing indicator
  const sendTyping = useCallback((isTyping) => {
    if (socket && connected) {
      socket.emit(isTyping ? 'typing:start' : 'typing:stop');
    }
  }, [socket, connected]);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Clear activity feed
  const clearActivityFeed = useCallback(() => {
    setActivityFeed([]);
  }, []);

  return {
    socket,
    connected,
    activityFeed,
    notifications,
    liveMetrics,
    connectedClients,
    typingUsers,
    requestProductivityUpdate,
    requestInsights,
    sendTyping,
    clearNotifications,
    clearActivityFeed,
    addNotification
  };
}
