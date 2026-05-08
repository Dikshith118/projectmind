const ActivityLog = require('../models/ActivityLog');

/**
 * Analyze coding behavior and detect patterns
 */
class ActivityAnalyzer {
  
  /**
   * Analyze edit/save frequency for a project
   */
  async analyzeEditFrequency(projectId, timeWindow = 3600000) { // 1 hour default
    const now = new Date();
    const windowStart = new Date(now - timeWindow);
    
    const activities = await ActivityLog.find({
      project: projectId,
      timestamp: { $gte: windowStart }
    }).sort('timestamp');
    
    const edits = activities.filter(a => a.event === 'edit').length;
    const saves = activities.filter(a => a.event === 'save').length;
    
    // Calculate frequency (events per minute)
    const minutes = timeWindow / 60000;
    const editFrequency = edits / minutes;
    const saveFrequency = saves / minutes;
    
    return {
      edits,
      saves,
      editFrequency: parseFloat(editFrequency.toFixed(2)),
      saveFrequency: parseFloat(saveFrequency.toFixed(2)),
      totalEvents: activities.length,
      timeWindow: minutes
    };
  }
  
  /**
   * Track active coding duration (time between first and last activity)
   */
  async calculateActiveDuration(projectId, date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const activities = await ActivityLog.find({
      project: projectId,
      timestamp: { $gte: startOfDay, $lte: endOfDay }
    }).sort('timestamp');
    
    if (activities.length === 0) {
      return { activeDuration: 0, sessions: 0, activities: 0 };
    }
    
    // Detect sessions (gap > 15 minutes = new session)
    const sessions = [];
    let currentSession = { start: activities[0].timestamp, end: activities[0].timestamp, events: 1 };
    
    for (let i = 1; i < activities.length; i++) {
      const gap = activities[i].timestamp - currentSession.end;
      
      if (gap > 15 * 60 * 1000) { // 15 minutes
        sessions.push(currentSession);
        currentSession = { start: activities[i].timestamp, end: activities[i].timestamp, events: 1 };
      } else {
        currentSession.end = activities[i].timestamp;
        currentSession.events++;
      }
    }
    sessions.push(currentSession);
    
    // Calculate total active duration
    const totalDuration = sessions.reduce((sum, session) => {
      return sum + (session.end - session.start);
    }, 0);
    
    return {
      activeDuration: Math.round(totalDuration / 60000), // minutes
      sessions: sessions.length,
      activities: activities.length,
      sessionDetails: sessions.map(s => ({
        start: s.start,
        end: s.end,
        duration: Math.round((s.end - s.start) / 60000),
        events: s.events
      }))
    };
  }
  
  /**
   * Detect focus sessions (continuous work > 25 minutes)
   */
  async detectFocusSessions(projectId, days = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const activities = await ActivityLog.find({
      project: projectId,
      timestamp: { $gte: since }
    }).sort('timestamp');
    
    const focusSessions = [];
    let currentSession = null;
    
    for (const activity of activities) {
      if (!currentSession) {
        currentSession = {
          start: activity.timestamp,
          end: activity.timestamp,
          events: 1,
          files: new Set([activity.file])
        };
      } else {
        const gap = activity.timestamp - currentSession.end;
        
        if (gap > 15 * 60 * 1000) { // 15 min gap = session break
          const duration = (currentSession.end - currentSession.start) / 60000;
          
          if (duration >= 25) { // Focus session = 25+ minutes
            focusSessions.push({
              start: currentSession.start,
              end: currentSession.end,
              duration: Math.round(duration),
              events: currentSession.events,
              files: currentSession.files.size,
              intensity: currentSession.events / duration // events per minute
            });
          }
          
          currentSession = {
            start: activity.timestamp,
            end: activity.timestamp,
            events: 1,
            files: new Set([activity.file])
          };
        } else {
          currentSession.end = activity.timestamp;
          currentSession.events++;
          currentSession.files.add(activity.file);
        }
      }
    }
    
    // Check last session
    if (currentSession) {
      const duration = (currentSession.end - currentSession.start) / 60000;
      if (duration >= 25) {
        focusSessions.push({
          start: currentSession.start,
          end: currentSession.end,
          duration: Math.round(duration),
          events: currentSession.events,
          files: currentSession.files.size,
          intensity: currentSession.events / duration
        });
      }
    }
    
    return {
      totalFocusSessions: focusSessions.length,
      totalFocusTime: focusSessions.reduce((sum, s) => sum + s.duration, 0),
      averageDuration: focusSessions.length > 0 
        ? Math.round(focusSessions.reduce((sum, s) => sum + s.duration, 0) / focusSessions.length)
        : 0,
      sessions: focusSessions
    };
  }
  
  /**
   * Detect idle periods (no activity for extended time)
   */
  async detectIdlePeriods(projectId, days = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const activities = await ActivityLog.find({
      project: projectId,
      timestamp: { $gte: since }
    }).sort('timestamp');
    
    if (activities.length < 2) {
      return { idlePeriods: [], totalIdleTime: 0 };
    }
    
    const idlePeriods = [];
    
    for (let i = 1; i < activities.length; i++) {
      const gap = activities[i].timestamp - activities[i - 1].timestamp;
      const gapHours = gap / (60 * 60 * 1000);
      
      if (gapHours >= 4) { // Idle = 4+ hours gap
        idlePeriods.push({
          start: activities[i - 1].timestamp,
          end: activities[i].timestamp,
          duration: Math.round(gapHours * 10) / 10, // hours with 1 decimal
          durationMinutes: Math.round(gap / 60000)
        });
      }
    }
    
    return {
      idlePeriods: idlePeriods.length,
      totalIdleTime: idlePeriods.reduce((sum, p) => sum + p.duration, 0),
      longestIdle: idlePeriods.length > 0 
        ? Math.max(...idlePeriods.map(p => p.duration))
        : 0,
      periods: idlePeriods
    };
  }
  
  /**
   * Detect high-intensity work sessions
   */
  async detectHighIntensitySessions(projectId, days = 7) {
    const focusData = await this.detectFocusSessions(projectId, days);
    
    // High intensity = more than 3 events per minute
    const highIntensity = focusData.sessions.filter(s => s.intensity > 3);
    
    return {
      highIntensitySessions: highIntensity.length,
      totalHighIntensityTime: highIntensity.reduce((sum, s) => sum + s.duration, 0),
      averageIntensity: highIntensity.length > 0
        ? (highIntensity.reduce((sum, s) => sum + s.intensity, 0) / highIntensity.length).toFixed(2)
        : 0,
      sessions: highIntensity
    };
  }
  
  /**
   * Get file activity distribution
   */
  async getFileActivityDistribution(projectId, days = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const activities = await ActivityLog.find({
      project: projectId,
      timestamp: { $gte: since }
    });
    
    const fileStats = {};
    
    activities.forEach(activity => {
      if (!fileStats[activity.file]) {
        fileStats[activity.file] = {
          edits: 0,
          saves: 0,
          opens: 0,
          total: 0,
          lastActivity: activity.timestamp
        };
      }
      
      fileStats[activity.file][activity.event + 's']++;
      fileStats[activity.file].total++;
      
      if (activity.timestamp > fileStats[activity.file].lastActivity) {
        fileStats[activity.file].lastActivity = activity.timestamp;
      }
    });
    
    // Convert to array and sort by activity
    const sortedFiles = Object.entries(fileStats)
      .map(([file, stats]) => ({ file, ...stats }))
      .sort((a, b) => b.total - a.total);
    
    return {
      totalFiles: sortedFiles.length,
      mostActiveFiles: sortedFiles.slice(0, 10),
      fileStats: sortedFiles
    };
  }
}

module.exports = new ActivityAnalyzer();
