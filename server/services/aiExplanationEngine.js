/**
 * AI EXPLANATION ENGINE
 * 
 * Provides transparent reasoning, explanations, and confidence scores
 * for all AI decisions across the platform
 */

class AIExplanationEngine {
  
  /**
   * Generate risk level explanation
   */
  explainRiskLevel(context) {
    const { risk, tasks, timeline, productivity } = context;
    
    const factors = [];
    const evidence = [];
    let confidence = 100;

    // Analyze days behind
    if (risk.daysBehind > 0) {
      factors.push({
        factor: 'Schedule Delay',
        impact: risk.daysBehind > 2 ? 'high' : 'medium',
        description: `Project is ${risk.daysBehind} day${risk.daysBehind > 1 ? 's' : ''} behind schedule`,
        weight: 30
      });
      evidence.push(`${risk.daysBehind} days behind deadline`);
    }

    // Analyze pending high-priority tasks
    if (risk.highPriorityPending > 0) {
      factors.push({
        factor: 'High-Priority Tasks',
        impact: risk.highPriorityPending > 3 ? 'high' : 'medium',
        description: `${risk.highPriorityPending} high-priority task${risk.highPriorityPending > 1 ? 's' : ''} incomplete`,
        weight: 25
      });
      evidence.push(`${risk.highPriorityPending} high-priority tasks pending`);
    }

    // Analyze time deficit
    if (risk.hoursDeficit > 0) {
      factors.push({
        factor: 'Time Constraint',
        impact: risk.hoursDeficit > 20 ? 'high' : 'medium',
        description: `${risk.hoursDeficit} hours of work exceeds available time`,
        weight: 25
      });
      evidence.push(`${risk.hoursDeficit}h time deficit`);
    }

    // Analyze productivity
    if (productivity && productivity.overallScore < 60) {
      factors.push({
        factor: 'Low Productivity',
        impact: 'medium',
        description: `Productivity score is ${productivity.overallScore}/100`,
        weight: 20
      });
      evidence.push(`Productivity at ${productivity.overallScore}/100`);
    }

    // Calculate confidence based on data availability
    if (!productivity) confidence -= 15;
    if (tasks.total < 5) confidence -= 10;

    return {
      level: risk.level,
      score: risk.score,
      confidence: Math.max(confidence, 50),
      factors: factors.sort((a, b) => b.weight - a.weight),
      evidence,
      reasoning: this._buildRiskReasoning(risk, factors),
      recommendation: this._getRiskRecommendation(risk, factors)
    };
  }

  /**
   * Generate productivity score explanation
   */
  explainProductivityScore(productivity, activityData) {
    const factors = [];
    const evidence = [];
    let confidence = 100;

    // Daily score factors
    if (productivity.daily) {
      factors.push({
        factor: 'Daily Activity',
        impact: this._getImpact(productivity.daily.score),
        description: `${productivity.daily.metrics.activeDuration} minutes active today with ${productivity.daily.metrics.sessions} coding sessions`,
        weight: 30,
        score: productivity.daily.score
      });
      evidence.push(`${productivity.daily.metrics.activeDuration}m active`);
    }

    // Focus score factors
    if (productivity.focus) {
      factors.push({
        factor: 'Focus Quality',
        impact: this._getImpact(productivity.focus.score),
        description: `${productivity.focus.metrics.totalFocusSessions} deep focus sessions totaling ${productivity.focus.metrics.totalFocusTime} minutes`,
        weight: 30,
        score: productivity.focus.score
      });
      evidence.push(`${productivity.focus.metrics.totalFocusSessions} focus sessions`);
    }

    // Consistency factors
    if (productivity.consistency) {
      factors.push({
        factor: 'Consistency',
        impact: this._getImpact(productivity.consistency.score),
        description: `Active ${productivity.consistency.metrics.activeDays} out of ${productivity.consistency.metrics.totalDays} days`,
        weight: 25,
        score: productivity.consistency.score
      });
      evidence.push(`${productivity.consistency.metrics.activeDays}/${productivity.consistency.metrics.totalDays} days active`);
    }

    // Intensity factors
    if (productivity.intensity) {
      factors.push({
        factor: 'Coding Intensity',
        impact: this._getImpact(productivity.intensity.score),
        description: `${productivity.intensity.metrics.currentEditFrequency.toFixed(1)} edits per minute`,
        weight: 15,
        score: productivity.intensity.score
      });
      evidence.push(`${productivity.intensity.metrics.currentEditFrequency.toFixed(1)} edits/min`);
    }

    return {
      overallScore: productivity.overallScore,
      confidence,
      factors: factors.sort((a, b) => b.weight - a.weight),
      evidence,
      reasoning: this._buildProductivityReasoning(productivity, factors),
      recommendation: this._getProductivityRecommendation(productivity, factors)
    };
  }

  /**
   * Generate task prioritization explanation
   */
  explainTaskPriority(task, context) {
    const factors = [];
    const evidence = [];
    let confidence = 85;

    // Priority level
    factors.push({
      factor: 'Assigned Priority',
      impact: task.priority === 'high' ? 'high' : task.priority === 'medium' ? 'medium' : 'low',
      description: `Task marked as ${task.priority} priority`,
      weight: 30
    });

    // Dependencies
    if (task.dependencies && task.dependencies.length > 0) {
      factors.push({
        factor: 'Blocking Tasks',
        impact: 'high',
        description: `Blocks ${task.dependencies.length} other task${task.dependencies.length > 1 ? 's' : ''}`,
        weight: 25
      });
      evidence.push(`Blocks ${task.dependencies.length} tasks`);
    }

    // Days behind
    if (context.risk.daysBehind > 0 && task.priority === 'high') {
      factors.push({
        factor: 'Schedule Pressure',
        impact: 'high',
        description: `Project is ${context.risk.daysBehind} days behind and this is high priority`,
        weight: 25
      });
      evidence.push(`${context.risk.daysBehind} days behind`);
    }

    // Task day vs current day
    const dayDiff = task.day - context.tasks.currentDay;
    if (dayDiff <= 0) {
      factors.push({
        factor: 'Overdue',
        impact: 'high',
        description: `Task was scheduled for day ${task.day}, currently on day ${context.tasks.currentDay}`,
        weight: 20
      });
      evidence.push(`${Math.abs(dayDiff)} days overdue`);
    }

    return {
      taskId: task.id,
      taskTitle: task.title,
      priority: task.priority,
      confidence,
      factors: factors.sort((a, b) => b.weight - a.weight),
      evidence,
      reasoning: this._buildTaskPriorityReasoning(task, factors),
      recommendation: `Focus on this task ${factors.length > 2 ? 'immediately' : 'soon'}`
    };
  }

  /**
   * Generate focus recommendation explanation
   */
  explainFocusRecommendation(recommendedTask, allTasks, context) {
    const factors = [];
    const evidence = [];
    let confidence = 80;

    // Task priority
    if (recommendedTask.priority === 'high') {
      factors.push({
        factor: 'High Priority',
        impact: 'high',
        description: 'This task is marked as high priority',
        weight: 30
      });
      evidence.push('High priority task');
    }

    // Stalled status
    if (recommendedTask.stalledDays > 0) {
      factors.push({
        factor: 'Stalled Work',
        impact: 'high',
        description: `No activity for ${recommendedTask.stalledDays} days`,
        weight: 25
      });
      evidence.push(`Stalled ${recommendedTask.stalledDays} days`);
      confidence += 10;
    }

    // Blocking other tasks
    const blockedTasks = allTasks.filter(t => 
      t.dependencies && t.dependencies.includes(recommendedTask.id)
    );
    if (blockedTasks.length > 0) {
      factors.push({
        factor: 'Blocking Tasks',
        impact: 'high',
        description: `${blockedTasks.length} task${blockedTasks.length > 1 ? 's' : ''} waiting on this`,
        weight: 25
      });
      evidence.push(`Blocks ${blockedTasks.length} tasks`);
    }

    // Time remaining
    if (context.timeline.daysRemaining < 5) {
      factors.push({
        factor: 'Deadline Pressure',
        impact: 'high',
        description: `Only ${context.timeline.daysRemaining} days until deadline`,
        weight: 20
      });
      evidence.push(`${context.timeline.daysRemaining} days left`);
    }

    return {
      taskId: recommendedTask.id,
      taskTitle: recommendedTask.title,
      confidence: Math.min(confidence, 95),
      factors: factors.sort((a, b) => b.weight - a.weight),
      evidence,
      reasoning: this._buildFocusReasoning(recommendedTask, factors),
      recommendation: 'Start this task now to maximize project success'
    };
  }

  /**
   * Generate recovery plan explanation
   */
  explainRecoveryPlan(plan, context) {
    const factors = [];
    const evidence = [];
    let confidence = 75;

    // Days behind
    factors.push({
      factor: 'Schedule Delay',
      impact: context.risk.daysBehind > 3 ? 'critical' : 'high',
      description: `Project is ${context.risk.daysBehind} days behind schedule`,
      weight: 35
    });
    evidence.push(`${context.risk.daysBehind} days behind`);

    // Time deficit
    if (context.risk.hoursDeficit > 0) {
      factors.push({
        factor: 'Time Deficit',
        impact: context.risk.hoursDeficit > 20 ? 'critical' : 'high',
        description: `${context.risk.hoursDeficit} hours of work exceeds available time`,
        weight: 30
      });
      evidence.push(`${context.risk.hoursDeficit}h deficit`);
    }

    // Pending tasks
    factors.push({
      factor: 'Remaining Work',
      impact: 'medium',
      description: `${context.tasks.pending} tasks still pending`,
      weight: 20
    });
    evidence.push(`${context.tasks.pending} tasks pending`);

    // Productivity
    if (context.productivity && context.productivity.overallScore < 60) {
      factors.push({
        factor: 'Low Productivity',
        impact: 'medium',
        description: `Current productivity at ${context.productivity.overallScore}/100`,
        weight: 15
      });
      evidence.push(`Productivity: ${context.productivity.overallScore}/100`);
      confidence -= 10;
    }

    return {
      needed: true,
      severity: context.risk.level,
      confidence: Math.max(confidence, 60),
      factors: factors.sort((a, b) => b.weight - a.weight),
      evidence,
      reasoning: this._buildRecoveryReasoning(context, factors),
      actions: plan.actions || [],
      estimatedRecoveryDays: plan.estimatedRecoveryDays || 0
    };
  }

  /**
   * Helper: Build risk reasoning text
   */
  _buildRiskReasoning(risk, factors) {
    if (factors.length === 0) {
      return `Risk level is ${risk.level} based on current project status.`;
    }

    const topFactors = factors.slice(0, 3).map(f => f.description);
    return `Risk level is ${risk.level} because: ${topFactors.join('; ')}.`;
  }

  /**
   * Helper: Build productivity reasoning text
   */
  _buildProductivityReasoning(productivity, factors) {
    const interpretation = productivity.overallScore >= 80 ? 'excellent' :
                          productivity.overallScore >= 60 ? 'good' :
                          productivity.overallScore >= 40 ? 'fair' : 'low';
    
    const topFactors = factors.slice(0, 2).map(f => f.description);
    return `Productivity is ${interpretation} (${productivity.overallScore}/100) based on: ${topFactors.join('; ')}.`;
  }

  /**
   * Helper: Build task priority reasoning text
   */
  _buildTaskPriorityReasoning(task, factors) {
    const topFactors = factors.slice(0, 2).map(f => f.description);
    return `This task should be prioritized because: ${topFactors.join('; ')}.`;
  }

  /**
   * Helper: Build focus reasoning text
   */
  _buildFocusReasoning(task, factors) {
    const topFactors = factors.slice(0, 2).map(f => f.description);
    return `Focus on "${task.title}" because: ${topFactors.join('; ')}.`;
  }

  /**
   * Helper: Build recovery reasoning text
   */
  _buildRecoveryReasoning(context, factors) {
    const topFactors = factors.slice(0, 2).map(f => f.description);
    return `Recovery plan needed because: ${topFactors.join('; ')}.`;
  }

  /**
   * Helper: Get risk recommendation
   */
  _getRiskRecommendation(risk, factors) {
    if (risk.level === 'Critical' || risk.level === 'High') {
      return 'Immediate action required. Focus on high-priority tasks and consider recovery plan.';
    } else if (risk.level === 'Medium') {
      return 'Monitor closely. Prioritize critical tasks to prevent further delays.';
    }
    return 'Continue current pace. Maintain consistency to stay on track.';
  }

  /**
   * Helper: Get productivity recommendation
   */
  _getProductivityRecommendation(productivity, factors) {
    if (productivity.overallScore >= 80) {
      return 'Excellent work! Maintain this momentum.';
    } else if (productivity.overallScore >= 60) {
      return 'Good progress. Consider increasing focus session duration.';
    } else if (productivity.overallScore >= 40) {
      return 'Room for improvement. Schedule dedicated focus blocks.';
    }
    return 'Productivity needs attention. Try deep focus mode and eliminate distractions.';
  }

  /**
   * Helper: Get impact level from score
   */
  _getImpact(score) {
    if (score >= 80) return 'positive';
    if (score >= 60) return 'neutral';
    if (score >= 40) return 'negative';
    return 'critical';
  }
}

module.exports = new AIExplanationEngine();
