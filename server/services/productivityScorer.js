const activityAnalyzer = require('./activityAnalyzer');
const taskCorrelationEngine = require('./taskCorrelationEngine');

/**
 * Calculate productivity scores and metrics
 */
class ProductivityScorer {
  
  /**
   * Calculate daily productivity score (0-100)
   */
  async calculateDailyScore(projectId, date = new Date()) {
    const durationData = await activityAnalyzer.calculateActiveDuration(projectId, date);
    const frequencyData = await activityAnalyzer.analyzeEditFrequency(projectId, 3600000); // 1 hour
    
    // Score components
    const durationScore = Math.min((durationData.activeDuration / 240) * 100, 100); // 4 hours = 100%
    const sessionScore = Math.min((durationData.sessions / 3) * 100, 100); // 3 sessions = 100%
    const activityScore = Math.min((durationData.activities / 50) * 100, 100); // 50 events = 100%
    const frequencyScore = Math.min((frequencyData.editFrequency / 2) * 100, 100); // 2 edits/min = 100%
    
    // Weighted average
    const totalScore = (
      durationScore * 0.35 +
      sessionScore * 0.25 +
      activityScore * 0.25 +
      frequencyScore * 0.15
    );
    
    return {
      score: Math.round(totalScore),
      breakdown: {
        duration: Math.round(durationScore),
        sessions: Math.round(sessionScore),
        activity: Math.round(activityScore),
        frequency: Math.round(frequencyScore)
      },
      metrics: {
        activeDuration: durationData.activeDuration,
        sessions: durationData.sessions,
        totalActivities: durationData.activities,
        editFrequency: frequencyData.editFrequency
      }
    };
  }
  
  /**
   * Calculate focus score (0-100)
   */
  async calculateFocusScore(projectId, days = 7) {
    const focusData = await activityAnalyzer.detectFocusSessions(projectId, days);
    const idleData = await activityAnalyzer.detectIdlePeriods(projectId, days);
    
    // Score components
    const focusTimeScore = Math.min((focusData.totalFocusTime / (days * 120)) * 100, 100); // 2h/day = 100%
    const sessionCountScore = Math.min((focusData.totalFocusSessions / (days * 2)) * 100, 100); // 2 sessions/day = 100%
    const avgDurationScore = Math.min((focusData.averageDuration / 60) * 100, 100); // 60 min avg = 100%
    
    // Penalty for excessive idle time
    const idlePenalty = Math.min((idleData.totalIdleTime / (days * 8)) * 20, 20); // Max 20% penalty
    
    const totalScore = (
      focusTimeScore * 0.4 +
      sessionCountScore * 0.3 +
      avgDurationScore * 0.3
    ) - idlePenalty;
    
    return {
      score: Math.max(Math.round(totalScore), 0),
      breakdown: {
        focusTime: Math.round(focusTimeScore),
        sessionCount: Math.round(sessionCountScore),
        avgDuration: Math.round(avgDurationScore),
        idlePenalty: Math.round(idlePenalty)
      },
      metrics: {
        totalFocusSessions: focusData.totalFocusSessions,
        totalFocusTime: focusData.totalFocusTime,
        averageDuration: focusData.averageDuration,
        idlePeriods: idleData.idlePeriods
      }
    };
  }
  
  /**
   * Calculate consistency score (0-100)
   */
  async calculateConsistencyScore(projectId, days = 7) {
    const dailyScores = [];
    
    // Calculate daily scores for the past week
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayData = await activityAnalyzer.calculateActiveDuration(projectId, date);
      dailyScores.push(dayData.activeDuration);
    }
    
    // Calculate consistency metrics
    const activeDays = dailyScores.filter(d => d > 0).length;
    const avgDuration = dailyScores.reduce((sum, d) => sum + d, 0) / days;
    
    // Calculate standard deviation
    const variance = dailyScores.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / days;
    const stdDev = Math.sqrt(variance);
    
    // Score components
    const activeDaysScore = (activeDays / days) * 100; // % of days active
    const avgDurationScore = Math.min((avgDuration / 120) * 100, 100); // 2h avg = 100%
    const consistencyScore = Math.max(100 - (stdDev / avgDuration) * 50, 0); // Lower variance = higher score
    
    const totalScore = (
      activeDaysScore * 0.4 +
      avgDurationScore * 0.3 +
      consistencyScore * 0.3
    );
    
    return {
      score: Math.round(totalScore),
      breakdown: {
        activeDays: Math.round(activeDaysScore),
        avgDuration: Math.round(avgDurationScore),
        consistency: Math.round(consistencyScore)
      },
      metrics: {
        activeDays,
        totalDays: days,
        avgDuration: Math.round(avgDuration),
        stdDev: Math.round(stdDev)
      }
    };
  }
  
  /**
   * Calculate coding intensity score (0-100)
   */
  async calculateIntensityScore(projectId, days = 7) {
    const intensityData = await activityAnalyzer.detectHighIntensitySessions(projectId, days);
    const frequencyData = await activityAnalyzer.analyzeEditFrequency(projectId, 3600000);
    
    // Score components
    const highIntensityScore = Math.min((intensityData.highIntensitySessions / (days * 2)) * 100, 100); // 2/day = 100%
    const intensityTimeScore = Math.min((intensityData.totalHighIntensityTime / (days * 60)) * 100, 100); // 1h/day = 100%
    const currentFrequencyScore = Math.min((frequencyData.editFrequency / 3) * 100, 100); // 3 edits/min = 100%
    
    const totalScore = (
      highIntensityScore * 0.4 +
      intensityTimeScore * 0.4 +
      currentFrequencyScore * 0.2
    );
    
    return {
      score: Math.round(totalScore),
      breakdown: {
        highIntensitySessions: Math.round(highIntensityScore),
        intensityTime: Math.round(intensityTimeScore),
        currentFrequency: Math.round(currentFrequencyScore)
      },
      metrics: {
        highIntensitySessions: intensityData.highIntensitySessions,
        totalHighIntensityTime: intensityData.totalHighIntensityTime,
        averageIntensity: intensityData.averageIntensity,
        currentEditFrequency: frequencyData.editFrequency
      }
    };
  }
  
  /**
   * Get comprehensive productivity report
   */
  async getProductivityReport(projectId, days = 7) {
    const [daily, focus, consistency, intensity] = await Promise.all([
      this.calculateDailyScore(projectId),
      this.calculateFocusScore(projectId, days),
      this.calculateConsistencyScore(projectId, days),
      this.calculateIntensityScore(projectId, days)
    ]);
    
    // Calculate overall productivity score
    const overallScore = Math.round(
      daily.score * 0.3 +
      focus.score * 0.3 +
      consistency.score * 0.25 +
      intensity.score * 0.15
    );
    
    return {
      overallScore,
      daily,
      focus,
      consistency,
      intensity,
      timestamp: new Date()
    };
  }
  
  /**
   * Compare productivity trends (current vs previous period)
   */
  async getProductivityTrend(projectId, days = 7) {
    const current = await this.getProductivityReport(projectId, days);
    
    // Get previous period data (simplified - just overall score)
    const previousDaily = await this.calculateDailyScore(projectId, new Date(Date.now() - days * 24 * 60 * 60 * 1000));
    
    const change = current.overallScore - previousDaily.score;
    const percentChange = previousDaily.score > 0 
      ? Math.round((change / previousDaily.score) * 100)
      : 0;
    
    return {
      current: current.overallScore,
      previous: previousDaily.score,
      change,
      percentChange,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  }
}

module.exports = new ProductivityScorer();
