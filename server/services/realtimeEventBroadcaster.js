/**
 * REAL-TIME EVENT BROADCASTER
 * 
 * Central service for broadcasting real-time events to connected clients
 * Handles all Socket.IO event emissions across the platform
 */

class RealtimeEventBroadcaster {
  constructor() {
    this.io = null;
  }

  /**
   * Initialize with Socket.IO instance
   */
  initialize(io) {
    this.io = io;
    console.log('[RealtimeEventBroadcaster] Initialized');
  }

  /**
   * Broadcast activity event
   */
  broadcastActivity(projectId, activity) {
    if (!this.io) return;

    this.io.to(`project:${projectId}`).emit('activity:new', {
      type: 'activity',
      data: activity,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast task update
   */
  broadcastTaskUpdate(projectId, task, action = 'updated') {
    if (!this.io) return;

    this.io.to(`project:${projectId}`).emit('task:update', {
      type: 'task',
      action, // 'created', 'updated', 'completed', 'deleted'
      data: task,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast project update
   */
  broadcastProjectUpdate(projectId, updates) {
    if (!this.io) return;

    this.io.to(`project:${projectId}`).emit('project:update', {
      type: 'project',
      data: updates,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast productivity update
   */
  broadcastProductivityUpdate(projectId, metrics) {
    if (!this.io) return;

    this.io.to(`project:${projectId}`).emit('productivity:update', {
      type: 'productivity',
      data: metrics,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast AI insight
   */
  broadcastAIInsight(projectId, insight) {
    if (!this.io) return;

    this.io.to(`project:${projectId}`).emit('ai:insight', {
      type: 'ai_insight',
      data: insight,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast risk level change
   */
  broadcastRiskChange(projectId, oldLevel, newLevel, factors) {
    if (!this.io) return;

    this.io.to(`project:${projectId}`).emit('risk:change', {
      type: 'risk',
      data: {
        oldLevel,
        newLevel,
        factors,
        severity: this._getRiskSeverity(oldLevel, newLevel)
      },
      timestamp: new Date()
    });
  }

  /**
   * Broadcast focus session start
   */
  broadcastFocusSessionStart(projectId, session) {
    if (!this.io) return;

    this.io.to(`project:${projectId}`).emit('focus:start', {
      type: 'focus_session',
      action: 'start',
      data: session,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast focus session end
   */
  broadcastFocusSessionEnd(projectId, session) {
    if (!this.io) return;

    this.io.to(`project:${projectId}`).emit('focus:end', {
      type: 'focus_session',
      action: 'end',
      data: session,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast task inference (AI detected task completion)
   */
  broadcastTaskInference(projectId, inference) {
    if (!this.io) return;

    this.io.to(`project:${projectId}`).emit('task:inference', {
      type: 'task_inference',
      data: inference,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast stalled task detection
   */
  broadcastStalledTask(projectId, task) {
    if (!this.io) return;

    this.io.to(`project:${projectId}`).emit('task:stalled', {
      type: 'stalled_task',
      data: task,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast completion milestone
   */
  broadcastMilestone(projectId, milestone) {
    if (!this.io) return;

    this.io.to(`project:${projectId}`).emit('milestone:reached', {
      type: 'milestone',
      data: milestone,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast deadline warning
   */
  broadcastDeadlineWarning(projectId, warning) {
    if (!this.io) return;

    this.io.to(`project:${projectId}`).emit('deadline:warning', {
      type: 'deadline_warning',
      data: warning,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast user presence (online/offline)
   */
  broadcastUserPresence(projectId, userId, status) {
    if (!this.io) return;

    this.io.to(`project:${projectId}`).emit('user:presence', {
      type: 'user_presence',
      data: {
        userId,
        status, // 'online', 'offline', 'away'
        timestamp: new Date()
      }
    });
  }

  /**
   * Broadcast typing indicator
   */
  broadcastTyping(projectId, userId, isTyping) {
    if (!this.io) return;

    this.io.to(`project:${projectId}`).emit('user:typing', {
      type: 'typing',
      data: {
        userId,
        isTyping
      }
    });
  }

  /**
   * Broadcast AI processing status
   */
  broadcastAIProcessing(projectId, status) {
    if (!this.io) return;

    this.io.to(`project:${projectId}`).emit('ai:processing', {
      type: 'ai_processing',
      data: status, // { processing: true/false, module: 'copilot' }
      timestamp: new Date()
    });
  }

  /**
   * Broadcast batch events (multiple events at once)
   */
  broadcastBatch(projectId, events) {
    if (!this.io) return;

    this.io.to(`project:${projectId}`).emit('batch:events', {
      type: 'batch',
      data: events,
      count: events.length,
      timestamp: new Date()
    });
  }

  /**
   * Get connected clients count for a project
   */
  getConnectedClients(projectId) {
    if (!this.io) return 0;

    const room = this.io.sockets.adapter.rooms.get(`project:${projectId}`);
    return room ? room.size : 0;
  }

  /**
   * Broadcast to all connected clients (global)
   */
  broadcastGlobal(event, data) {
    if (!this.io) return;

    this.io.emit(event, {
      data,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast GitHub events
   */
  broadcastGitHubLinked(projectId, data) {
    if (!this.io) return;

    this.io.to(`project:${projectId}`).emit('github:linked', {
      type: 'github_linked',
      data,
      timestamp: new Date()
    });
  }

  broadcastCommitReceived(projectId, data) {
    if (!this.io) return;

    this.io.to(`project:${projectId}`).emit('github:commit', {
      type: 'commit',
      data,
      timestamp: new Date()
    });
  }

  broadcastPullRequestEvent(projectId, data) {
    if (!this.io) return;

    this.io.to(`project:${projectId}`).emit('github:pr', {
      type: 'pull_request',
      data,
      timestamp: new Date()
    });
  }

  /**
   * Helper: Get risk severity
   */
  _getRiskSeverity(oldLevel, newLevel) {
    const levels = { Low: 1, Medium: 2, High: 3, Critical: 4 };
    const oldScore = levels[oldLevel] || 0;
    const newScore = levels[newLevel] || 0;

    if (newScore > oldScore) return 'increased';
    if (newScore < oldScore) return 'decreased';
    return 'unchanged';
  }
}

module.exports = new RealtimeEventBroadcaster();
