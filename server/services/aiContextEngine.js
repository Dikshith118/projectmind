const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const TaskMapping = require('../models/TaskMapping');
const activityAnalyzer = require('./activityAnalyzer');
const taskCorrelationEngine = require('./taskCorrelationEngine');
const productivityScorer = require('./productivityScorer');

/**
 * UNIFIED AI CONTEXT ENGINE
 * 
 * Central intelligence layer that builds comprehensive project context
 * for ALL AI modules across the platform.
 * 
 * This makes the entire platform feel like ONE intelligent AI system.
 */
class AIContextEngine {
  
  /**
   * Build complete project intelligence context
   * @param {string} projectId - Project ID
   * @param {Object} options - Context options
   * @returns {Promise<Object>} - Unified context object
   */
  async buildUnifiedContext(projectId, options = {}) {
    const {
      includeActivity = true,
      includeProductivity = true,
      includeTaskCorrelation = true,
      includeFocusSessions = true,
      includeDocuments = true,
      days = 7
    } = options;

    try {
      // Core project data (always included)
      const [project, tasks] = await Promise.all([
        Project.findById(projectId),
        Task.find({ project: projectId }).sort('day')
      ]);

      if (!project) {
        throw new Error('Project not found');
      }

      // Build base context
      const context = {
        // Project Core
        project: this._buildProjectCore(project),
        
        // Task Intelligence
        tasks: this._buildTaskIntelligence(tasks, project),
        
        // Time & Progress
        timeline: this._buildTimeline(project, tasks),
        
        // Risk Assessment
        risk: this._buildRiskAssessment(project, tasks),
        
        // Metadata
        metadata: {
          contextBuiltAt: new Date(),
          projectId,
          includeActivity,
          includeProductivity,
          includeTaskCorrelation
        }
      };

      // Optional: Activity Intelligence
      if (includeActivity) {
        const recentActivity = await ActivityLog.find({ project: projectId })
          .sort('-timestamp')
          .limit(100);
        
        context.activity = this._buildActivityIntelligence(recentActivity);
      }

      // Optional: Productivity Metrics
      if (includeProductivity) {
        try {
          const productivity = await productivityScorer.getProductivityReport(projectId, days);
          context.productivity = this._buildProductivityIntelligence(productivity);
        } catch (err) {
          console.log('[Context] Productivity data not available yet');
          context.productivity = null;
        }
      }

      // Optional: Task Correlation
      if (includeTaskCorrelation) {
        try {
          const [taskProgress, stalledTasks, activeTask] = await Promise.all([
            taskCorrelationEngine.estimateTaskProgress(projectId),
            taskCorrelationEngine.detectStalledTasks(projectId),
            taskCorrelationEngine.getActiveTask(projectId)
          ]);
          
          context.taskCorrelation = {
            progress: taskProgress,
            stalled: stalledTasks,
            active: activeTask
          };
        } catch (err) {
          console.log('[Context] Task correlation data not available yet');
          context.taskCorrelation = null;
        }
      }

      // Optional: Focus Sessions
      if (includeFocusSessions) {
        try {
          const focusSessions = await activityAnalyzer.detectFocusSessions(projectId, days);
          context.focusSessions = focusSessions;
        } catch (err) {
          console.log('[Context] Focus session data not available yet');
          context.focusSessions = null;
        }
      }

      // Optional: Document Context
      if (includeDocuments && project.uploadedDocuments) {
        context.documents = {
          hasDocuments: true,
          documentContext: project.documentContext || null
        };
      }

      return context;

    } catch (error) {
      console.error('[AIContextEngine] Error building context:', error.message);
      throw error;
    }
  }

  /**
   * Build project core intelligence
   */
  _buildProjectCore(project) {
    return {
      id: project._id,
      name: project.name,
      goal: project.goal,
      status: project.status,
      deadline: project.deadline,
      hoursPerDay: project.hoursPerDay,
      daysBehind: project.daysBehind || 0,
      createdAt: project.createdAt,
      documentContext: project.documentContext || null
    };
  }

  /**
   * Build task intelligence
   */
  _buildTaskIntelligence(tasks, project) {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done');
    const partial = tasks.filter(t => t.status === 'partial');
    const pending = tasks.filter(t => t.status === 'pending');
    const skipped = tasks.filter(t => t.status === 'skipped');

    const highPriority = tasks.filter(t => t.priority === 'high');
    const mediumPriority = tasks.filter(t => t.priority === 'medium');
    const lowPriority = tasks.filter(t => t.priority === 'low');

    const completionPct = total > 0 ? Math.round((done.length / total) * 100) : 0;
    
    // Calculate current day
    const createdAt = new Date(project.createdAt);
    const today = new Date();
    const currentDay = Math.ceil((today - createdAt) / (1000 * 60 * 60 * 24));

    // Today's tasks
    const todaysTasks = tasks.filter(t => t.day === currentDay);
    const tomorrowsTasks = tasks.filter(t => t.day === currentDay + 1);

    return {
      total,
      done: done.length,
      partial: partial.length,
      pending: pending.length,
      skipped: skipped.length,
      completionPct,
      
      byPriority: {
        high: highPriority.length,
        medium: mediumPriority.length,
        low: lowPriority.length
      },
      
      currentDay,
      todaysTasks: todaysTasks.map(t => ({
        id: t._id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        estimatedH: t.estimatedH
      })),
      
      tomorrowsTasks: tomorrowsTasks.map(t => ({
        id: t._id,
        title: t.title,
        priority: t.priority,
        estimatedH: t.estimatedH
      })),
      
      allTasks: tasks.map(t => ({
        id: t._id,
        day: t.day,
        title: t.title,
        status: t.status,
        priority: t.priority,
        estimatedH: t.estimatedH,
        dependencies: t.dependencies || []
      }))
    };
  }

  /**
   * Build timeline intelligence
   */
  _buildTimeline(project, tasks) {
    const now = new Date();
    const deadline = new Date(project.deadline);
    const createdAt = new Date(project.createdAt);
    
    const totalDays = Math.ceil((deadline - createdAt) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((now - createdAt) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    
    const progressPct = totalDays > 0 ? Math.round((daysElapsed / totalDays) * 100) : 0;
    
    // Calculate expected vs actual progress
    const expectedCompletionPct = progressPct;
    const actualCompletionPct = tasks.length > 0 
      ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)
      : 0;
    
    const progressDelta = actualCompletionPct - expectedCompletionPct;
    
    return {
      totalDays,
      daysElapsed,
      daysRemaining,
      progressPct,
      expectedCompletionPct,
      actualCompletionPct,
      progressDelta,
      isAhead: progressDelta > 0,
      isBehind: progressDelta < 0,
      isOnTrack: Math.abs(progressDelta) <= 5,
      deadline: deadline.toISOString(),
      createdAt: createdAt.toISOString()
    };
  }

  /**
   * Build risk assessment
   */
  _buildRiskAssessment(project, tasks) {
    const daysBehind = project.daysBehind || 0;
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'partial');
    const highPriorityPending = pendingTasks.filter(t => t.priority === 'high');
    
    const now = new Date();
    const deadline = new Date(project.deadline);
    const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    
    const totalHoursRemaining = pendingTasks.reduce((sum, t) => sum + (t.estimatedH || 0), 0);
    const availableHours = daysRemaining * project.hoursPerDay;
    const hoursDeficit = totalHoursRemaining - availableHours;
    
    // Calculate risk level
    let riskLevel = 'Low';
    let riskScore = 0;
    
    if (daysBehind > 3) riskScore += 40;
    else if (daysBehind > 1) riskScore += 20;
    else if (daysBehind > 0) riskScore += 10;
    
    if (hoursDeficit > 20) riskScore += 30;
    else if (hoursDeficit > 10) riskScore += 15;
    else if (hoursDeficit > 0) riskScore += 5;
    
    if (highPriorityPending.length > 5) riskScore += 20;
    else if (highPriorityPending.length > 2) riskScore += 10;
    
    if (daysRemaining < 3) riskScore += 10;
    
    if (riskScore >= 60) riskLevel = 'Critical';
    else if (riskScore >= 40) riskLevel = 'High';
    else if (riskScore >= 20) riskLevel = 'Medium';
    
    return {
      level: riskLevel,
      score: riskScore,
      daysBehind,
      daysRemaining,
      pendingTasks: pendingTasks.length,
      highPriorityPending: highPriorityPending.length,
      totalHoursRemaining,
      availableHours,
      hoursDeficit: Math.max(hoursDeficit, 0),
      isOverCapacity: hoursDeficit > 0,
      factors: this._identifyRiskFactors(daysBehind, hoursDeficit, highPriorityPending.length, daysRemaining)
    };
  }

  /**
   * Identify specific risk factors
   */
  _identifyRiskFactors(daysBehind, hoursDeficit, highPriorityPending, daysRemaining) {
    const factors = [];
    
    if (daysBehind > 2) factors.push('Significantly behind schedule');
    else if (daysBehind > 0) factors.push('Behind schedule');
    
    if (hoursDeficit > 20) factors.push('Severe time constraint');
    else if (hoursDeficit > 0) factors.push('Time constraint');
    
    if (highPriorityPending > 5) factors.push('Many high-priority tasks pending');
    else if (highPriorityPending > 2) factors.push('Several high-priority tasks pending');
    
    if (daysRemaining < 3) factors.push('Approaching deadline');
    
    if (factors.length === 0) factors.push('On track');
    
    return factors;
  }

  /**
   * Build activity intelligence
   */
  _buildActivityIntelligence(recentActivity) {
    if (!recentActivity || recentActivity.length === 0) {
      return {
        hasActivity: false,
        totalEvents: 0,
        recentFiles: [],
        eventBreakdown: { edits: 0, saves: 0, opens: 0, commits: 0 }
      };
    }

    const edits = recentActivity.filter(a => a.event === 'edit').length;
    const saves = recentActivity.filter(a => a.event === 'save').length;
    const opens = recentActivity.filter(a => a.event === 'open').length;
    const commits = recentActivity.filter(a => a.event === 'commit').length;

    const recentFiles = [...new Set(
      recentActivity.map(a => a.file.split(/[\\/]/).pop())
    )].slice(0, 10);

    const lastActivity = recentActivity[0];
    const minutesSinceLastActivity = lastActivity 
      ? Math.floor((Date.now() - new Date(lastActivity.timestamp)) / 60000)
      : null;

    return {
      hasActivity: true,
      totalEvents: recentActivity.length,
      eventBreakdown: { edits, saves, opens, commits },
      recentFiles,
      lastActivity: lastActivity ? {
        file: lastActivity.file.split(/[\\/]/).pop(),
        event: lastActivity.event,
        timestamp: lastActivity.timestamp,
        minutesAgo: minutesSinceLastActivity
      } : null
    };
  }

  /**
   * Build productivity intelligence
   */
  _buildProductivityIntelligence(productivity) {
    if (!productivity) return null;

    return {
      overallScore: productivity.overallScore,
      daily: {
        score: productivity.daily.score,
        activeDuration: productivity.daily.metrics.activeDuration,
        sessions: productivity.daily.metrics.sessions
      },
      focus: {
        score: productivity.focus.score,
        totalSessions: productivity.focus.metrics.totalFocusSessions,
        totalTime: productivity.focus.metrics.totalFocusTime
      },
      consistency: {
        score: productivity.consistency.score,
        activeDays: productivity.consistency.metrics.activeDays,
        totalDays: productivity.consistency.metrics.totalDays
      },
      intensity: {
        score: productivity.intensity.score,
        editFrequency: productivity.intensity.metrics.currentEditFrequency
      },
      interpretation: this._interpretProductivityScore(productivity.overallScore)
    };
  }

  /**
   * Interpret productivity score
   */
  _interpretProductivityScore(score) {
    if (score >= 80) return 'Excellent - Highly productive';
    if (score >= 60) return 'Good - On track';
    if (score >= 40) return 'Fair - Room for improvement';
    return 'Low - Needs attention';
  }

  /**
   * Generate AI-ready prompt context
   * Converts unified context into natural language for AI consumption
   */
  generatePromptContext(unifiedContext) {
    const { project, tasks, timeline, risk, activity, productivity, taskCorrelation, focusSessions, documents } = unifiedContext;

    let prompt = `PROJECT INTELLIGENCE CONTEXT:\n\n`;

    // Project Core
    prompt += `PROJECT: ${project.name}\n`;
    prompt += `GOAL: ${project.goal}\n`;
    prompt += `STATUS: ${project.status}\n`;
    prompt += `DEADLINE: ${new Date(project.deadline).toDateString()}\n`;
    prompt += `HOURS PER DAY: ${project.hoursPerDay}\n\n`;

    // Timeline
    prompt += `TIMELINE:\n`;
    prompt += `- Days Elapsed: ${timeline.daysElapsed}/${timeline.totalDays}\n`;
    prompt += `- Days Remaining: ${timeline.daysRemaining}\n`;
    prompt += `- Progress: ${timeline.progressPct}% of time elapsed\n`;
    prompt += `- Expected Completion: ${timeline.expectedCompletionPct}%\n`;
    prompt += `- Actual Completion: ${timeline.actualCompletionPct}%\n`;
    prompt += `- Status: ${timeline.isAhead ? 'AHEAD OF SCHEDULE' : timeline.isBehind ? 'BEHIND SCHEDULE' : 'ON TRACK'}\n\n`;

    // Tasks
    prompt += `TASKS:\n`;
    prompt += `- Total: ${tasks.total}\n`;
    prompt += `- Done: ${tasks.done} (${tasks.completionPct}%)\n`;
    prompt += `- In Progress: ${tasks.partial}\n`;
    prompt += `- Pending: ${tasks.pending}\n`;
    prompt += `- High Priority: ${tasks.byPriority.high}\n\n`;

    if (tasks.todaysTasks.length > 0) {
      prompt += `TODAY'S TASKS (Day ${tasks.currentDay}):\n`;
      tasks.todaysTasks.forEach(t => {
        prompt += `- ${t.title} [${t.status}] (${t.priority} priority, ${t.estimatedH}h)\n`;
      });
      prompt += '\n';
    }

    // Risk Assessment
    prompt += `RISK ASSESSMENT:\n`;
    prompt += `- Risk Level: ${risk.level}\n`;
    prompt += `- Risk Score: ${risk.score}/100\n`;
    prompt += `- Days Behind: ${risk.daysBehind}\n`;
    prompt += `- Pending Tasks: ${risk.pendingTasks}\n`;
    prompt += `- Hours Remaining: ${risk.totalHoursRemaining}h\n`;
    prompt += `- Available Hours: ${risk.availableHours}h\n`;
    if (risk.isOverCapacity) {
      prompt += `- ⚠️ OVER CAPACITY: ${risk.hoursDeficit}h deficit\n`;
    }
    prompt += `- Risk Factors: ${risk.factors.join(', ')}\n\n`;

    // Activity
    if (activity && activity.hasActivity) {
      prompt += `RECENT ACTIVITY:\n`;
      prompt += `- Total Events: ${activity.totalEvents}\n`;
      prompt += `- Edits: ${activity.eventBreakdown.edits}, Saves: ${activity.eventBreakdown.saves}\n`;
      prompt += `- Recent Files: ${activity.recentFiles.slice(0, 5).join(', ')}\n`;
      if (activity.lastActivity) {
        prompt += `- Last Activity: ${activity.lastActivity.event} on ${activity.lastActivity.file} (${activity.lastActivity.minutesAgo}m ago)\n`;
      }
      prompt += '\n';
    }

    // Productivity
    if (productivity) {
      prompt += `PRODUCTIVITY METRICS:\n`;
      prompt += `- Overall Score: ${productivity.overallScore}/100 (${productivity.interpretation})\n`;
      prompt += `- Daily Score: ${productivity.daily.score}/100 (${productivity.daily.activeDuration}m active, ${productivity.daily.sessions} sessions)\n`;
      prompt += `- Focus Score: ${productivity.focus.score}/100 (${productivity.focus.totalSessions} sessions, ${productivity.focus.totalTime}m total)\n`;
      prompt += `- Consistency: ${productivity.consistency.score}/100 (${productivity.consistency.activeDays}/${productivity.consistency.totalDays} days active)\n`;
      prompt += `- Intensity: ${productivity.intensity.score}/100 (${productivity.intensity.editFrequency.toFixed(1)} edits/min)\n\n`;
    }

    // Task Correlation
    if (taskCorrelation) {
      if (taskCorrelation.active) {
        prompt += `ACTIVE TASK:\n`;
        prompt += `- Currently Working On: "${taskCorrelation.active.taskTitle}" (Day ${taskCorrelation.active.day})\n`;
        prompt += `- Status: ${taskCorrelation.active.taskStatus}\n\n`;
      }

      if (taskCorrelation.stalled && taskCorrelation.stalled.length > 0) {
        prompt += `STALLED TASKS (${taskCorrelation.stalled.length}):\n`;
        taskCorrelation.stalled.slice(0, 3).forEach(t => {
          prompt += `- "${t.taskTitle}" - ${t.reason}\n`;
        });
        prompt += '\n';
      }

      if (taskCorrelation.progress && taskCorrelation.progress.length > 0) {
        prompt += `TASK PROGRESS ESTIMATES:\n`;
        taskCorrelation.progress.slice(0, 5).forEach(t => {
          prompt += `- "${t.taskTitle}": ${t.estimatedProgress}% complete (${t.confidence}% confidence)\n`;
        });
        prompt += '\n';
      }
    }

    // Focus Sessions
    if (focusSessions && focusSessions.totalFocusSessions > 0) {
      prompt += `FOCUS SESSIONS (Last 7 Days):\n`;
      prompt += `- Total Sessions: ${focusSessions.totalFocusSessions}\n`;
      prompt += `- Total Focus Time: ${focusSessions.totalFocusTime} minutes\n`;
      prompt += `- Average Duration: ${focusSessions.averageDuration} minutes\n\n`;
    }

    // Documents
    if (documents && documents.hasDocuments && documents.documentContext) {
      const doc = documents.documentContext;
      if (doc.detectedTechnologies && doc.detectedTechnologies.length > 0) {
        prompt += `DETECTED TECHNOLOGIES:\n`;
        const techByCategory = {};
        doc.detectedTechnologies.forEach(({ category, tech }) => {
          if (!techByCategory[category]) techByCategory[category] = [];
          techByCategory[category].push(tech);
        });
        Object.entries(techByCategory).forEach(([category, techs]) => {
          prompt += `- ${category}: ${techs.join(', ')}\n`;
        });
        prompt += '\n';
      }

      if (doc.detectedFeatures && doc.detectedFeatures.length > 0) {
        prompt += `REQUIRED FEATURES:\n`;
        doc.detectedFeatures.slice(0, 10).forEach(f => {
          prompt += `- ${f}\n`;
        });
        prompt += '\n';
      }
    }

    return prompt;
  }
}

module.exports = new AIContextEngine();
