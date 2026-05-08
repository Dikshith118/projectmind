/**
 * CONFIDENCE SCORER
 * 
 * Calculates confidence levels for AI predictions and recommendations
 * based on data quality, quantity, and consistency
 */

class ConfidenceScorer {
  
  /**
   * Calculate confidence for risk assessment
   */
  calculateRiskConfidence(context) {
    let confidence = 100;
    const factors = [];

    // Data availability
    if (!context.productivity) {
      confidence -= 15;
      factors.push('No productivity data available');
    }

    if (!context.activity || !context.activity.hasActivity) {
      confidence -= 10;
      factors.push('Limited activity data');
    }

    if (context.tasks.total < 5) {
      confidence -= 10;
      factors.push('Few tasks to analyze');
    }

    // Data recency
    if (context.activity && context.activity.lastActivity) {
      const hoursSinceActivity = (Date.now() - new Date(context.activity.lastActivity.timestamp)) / (1000 * 60 * 60);
      if (hoursSinceActivity > 24) {
        confidence -= 5;
        factors.push('Activity data is stale');
      }
    }

    // Timeline clarity
    if (context.timeline.daysRemaining < 1) {
      confidence -= 5;
      factors.push('Very close to deadline');
    }

    return {
      score: Math.max(confidence, 50),
      level: this._getConfidenceLevel(confidence),
      factors
    };
  }

  /**
   * Calculate confidence for productivity score
   */
  calculateProductivityConfidence(productivity, days) {
    let confidence = 100;
    const factors = [];

    // Data completeness
    if (!productivity.daily) {
      confidence -= 20;
      factors.push('Missing daily metrics');
    }

    if (!productivity.focus) {
      confidence -= 15;
      factors.push('Missing focus metrics');
    }

    if (!productivity.consistency) {
      confidence -= 15;
      factors.push('Missing consistency metrics');
    }

    // Data quality
    if (productivity.daily && productivity.daily.metrics.sessions < 2) {
      confidence -= 10;
      factors.push('Few coding sessions today');
    }

    if (productivity.consistency && productivity.consistency.metrics.activeDays < days / 2) {
      confidence -= 10;
      factors.push('Inconsistent activity pattern');
    }

    // Time period
    if (days < 3) {
      confidence -= 10;
      factors.push('Short analysis period');
    }

    return {
      score: Math.max(confidence, 60),
      level: this._getConfidenceLevel(confidence),
      factors
    };
  }

  /**
   * Calculate confidence for task inference
   */
  calculateTaskInferenceConfidence(taskActivity, taskMapping) {
    let confidence = 50; // Start lower for inference
    const factors = [];

    // Activity volume
    if (taskActivity.saves >= 5) {
      confidence += 20;
      factors.push('High save count');
    } else if (taskActivity.saves >= 3) {
      confidence += 10;
      factors.push('Moderate save count');
    }

    if (taskActivity.edits >= 10) {
      confidence += 15;
      factors.push('High edit count');
    } else if (taskActivity.edits >= 5) {
      confidence += 8;
      factors.push('Moderate edit count');
    }

    // File coverage
    if (taskActivity.filesWorkedOn >= 3) {
      confidence += 10;
      factors.push('Multiple files modified');
    }

    // Mapping quality
    if (taskMapping && taskMapping.paths && taskMapping.paths.length > 0) {
      confidence += 10;
      factors.push('Clear file mapping');
    } else {
      confidence -= 10;
      factors.push('Unclear file mapping');
    }

    // Recent activity
    if (taskActivity.lastActivity) {
      const hoursSince = (Date.now() - new Date(taskActivity.lastActivity)) / (1000 * 60 * 60);
      if (hoursSince < 1) {
        confidence += 5;
        factors.push('Very recent activity');
      }
    }

    return {
      score: Math.min(Math.max(confidence, 30), 95),
      level: this._getConfidenceLevel(confidence),
      factors
    };
  }

  /**
   * Calculate confidence for focus recommendation
   */
  calculateFocusConfidence(task, context) {
    let confidence = 70; // Start at moderate
    const factors = [];

    // Task clarity
    if (task.priority === 'high') {
      confidence += 15;
      factors.push('Clear high priority');
    }

    if (task.dependencies && task.dependencies.length > 0) {
      confidence += 10;
      factors.push('Blocks other tasks');
    }

    // Context quality
    if (context.productivity && context.productivity.overallScore > 0) {
      confidence += 10;
      factors.push('Productivity data available');
    }

    if (context.taskCorrelation && context.taskCorrelation.stalled) {
      const isStalled = context.taskCorrelation.stalled.some(t => t.taskId === task.id);
      if (isStalled) {
        confidence += 10;
        factors.push('Task is stalled');
      }
    }

    // Risk context
    if (context.risk.level === 'High' || context.risk.level === 'Critical') {
      confidence += 5;
      factors.push('High project risk');
    }

    return {
      score: Math.min(confidence, 95),
      level: this._getConfidenceLevel(confidence),
      factors
    };
  }

  /**
   * Calculate confidence for AI insight
   */
  calculateInsightConfidence(insightType, dataQuality) {
    let confidence = 80; // Start high for AI insights
    const factors = [];

    // Data quality impact
    if (dataQuality.hasProductivity) {
      confidence += 5;
      factors.push('Productivity data available');
    } else {
      confidence -= 10;
      factors.push('No productivity data');
    }

    if (dataQuality.hasActivity) {
      confidence += 5;
      factors.push('Activity data available');
    } else {
      confidence -= 10;
      factors.push('No activity data');
    }

    if (dataQuality.hasTaskCorrelation) {
      confidence += 5;
      factors.push('Task correlation available');
    }

    // Insight type impact
    if (insightType === 'stalled_task') {
      confidence += 5;
      factors.push('Clear stalled task pattern');
    }

    if (insightType === 'productivity_trend') {
      if (dataQuality.days >= 7) {
        confidence += 5;
        factors.push('Sufficient trend data');
      } else {
        confidence -= 5;
        factors.push('Limited trend data');
      }
    }

    return {
      score: Math.min(Math.max(confidence, 60), 95),
      level: this._getConfidenceLevel(confidence),
      factors
    };
  }

  /**
   * Calculate aggregate confidence from multiple sources
   */
  calculateAggregateConfidence(confidenceScores) {
    if (confidenceScores.length === 0) return { score: 50, level: 'Low' };

    const avgScore = confidenceScores.reduce((sum, c) => sum + c.score, 0) / confidenceScores.length;
    const minScore = Math.min(...confidenceScores.map(c => c.score));

    // Weighted average (favor minimum to be conservative)
    const finalScore = Math.round(avgScore * 0.7 + minScore * 0.3);

    return {
      score: finalScore,
      level: this._getConfidenceLevel(finalScore),
      sources: confidenceScores.length
    };
  }

  /**
   * Helper: Get confidence level from score
   */
  _getConfidenceLevel(score) {
    if (score >= 90) return 'Very High';
    if (score >= 75) return 'High';
    if (score >= 60) return 'Moderate';
    if (score >= 40) return 'Low';
    return 'Very Low';
  }

  /**
   * Get confidence color for UI
   */
  getConfidenceColor(score) {
    if (score >= 90) return 'emerald';
    if (score >= 75) return 'cyan';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  }

  /**
   * Get confidence icon for UI
   */
  getConfidenceIcon(score) {
    if (score >= 90) return '✓✓✓';
    if (score >= 75) return '✓✓';
    if (score >= 60) return '✓';
    if (score >= 40) return '~';
    return '?';
  }
}

module.exports = new ConfidenceScorer();
