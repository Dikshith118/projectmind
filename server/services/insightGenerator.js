const Groq = require('groq-sdk');
const taskCorrelationEngine = require('./taskCorrelationEngine');
const productivityScorer = require('./productivityScorer');
const activityAnalyzer = require('./activityAnalyzer');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Generate AI-powered productivity insights
 */
class InsightGenerator {
  
  /**
   * Generate comprehensive AI insights
   */
  async generateInsights(projectId, projectName) {
    try {
      // Gather all analytics data
      const [
        productivity,
        taskProgress,
        stalledTasks,
        activeTask,
        focusSessions,
        fileDistribution
      ] = await Promise.all([
        productivityScorer.getProductivityReport(projectId, 7),
        taskCorrelationEngine.estimateTaskProgress(projectId),
        taskCorrelationEngine.detectStalledTasks(projectId),
        taskCorrelationEngine.getActiveTask(projectId),
        activityAnalyzer.detectFocusSessions(projectId, 7),
        activityAnalyzer.getFileActivityDistribution(projectId, 7)
      ]);
      
      // Build context for AI
      const context = this._buildContext({
        projectName,
        productivity,
        taskProgress,
        stalledTasks,
        activeTask,
        focusSessions,
        fileDistribution
      });
      
      // Generate insights using Groq AI
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an AI productivity analyst for ProjectMind. Analyze coding activity data and provide actionable insights.
            
Your insights should:
- Be specific and data-driven
- Identify patterns and trends
- Suggest concrete actions
- Be encouraging but honest
- Focus on productivity optimization

Format: Return 3-5 concise insights as a JSON array of strings.`
          },
          {
            role: 'user',
            content: context
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      
      const response = completion.choices[0]?.message?.content || '[]';
      
      // Parse AI response
      let insights = [];
      try {
        insights = JSON.parse(response);
      } catch {
        // Fallback: split by newlines
        insights = response.split('\n').filter(line => line.trim().length > 0);
      }
      
      return {
        insights: insights.slice(0, 5), // Max 5 insights
        metadata: {
          overallScore: productivity.overallScore,
          activeTasks: taskProgress.length,
          stalledTasks: stalledTasks.length,
          focusSessions: focusSessions.totalFocusSessions,
          timestamp: new Date()
        }
      };
      
    } catch (error) {
      console.error('[InsightGenerator] Error:', error.message);
      
      // Fallback to rule-based insights
      return this._generateFallbackInsights(projectId);
    }
  }
  
  /**
   * Build context string for AI
   */
  _buildContext(data) {
    const {
      projectName,
      productivity,
      taskProgress,
      stalledTasks,
      activeTask,
      focusSessions,
      fileDistribution
    } = data;
    
    return `Project: ${projectName}

PRODUCTIVITY METRICS (Last 7 Days):
- Overall Score: ${productivity.overallScore}/100
- Daily Score: ${productivity.daily.score}/100 (${productivity.daily.metrics.activeDuration} min active today)
- Focus Score: ${productivity.focus.score}/100 (${focusSessions.totalFocusSessions} focus sessions, ${focusSessions.totalFocusTime} min total)
- Consistency Score: ${productivity.consistency.score}/100 (${productivity.consistency.metrics.activeDays}/${productivity.consistency.metrics.totalDays} days active)
- Intensity Score: ${productivity.intensity.score}/100

TASK PROGRESS:
- Active Tasks: ${taskProgress.length}
- High Confidence Completions: ${taskProgress.filter(t => t.confidence > 70).length}
- Stalled Tasks: ${stalledTasks.length}
${stalledTasks.length > 0 ? `- Most Stalled: "${stalledTasks[0].taskTitle}" (${stalledTasks[0].stalledDays} days)` : ''}

CURRENT ACTIVITY:
${activeTask ? `- Working on: "${activeTask.taskTitle}" (Day ${activeTask.day})` : '- No recent activity detected'}

FILE ACTIVITY:
- Total Files: ${fileDistribution.totalFiles}
- Most Active: ${fileDistribution.mostActiveFiles[0]?.file.split(/[\\/]/).pop() || 'N/A'} (${fileDistribution.mostActiveFiles[0]?.total || 0} events)

Provide 3-5 actionable insights based on this data.`;
  }
  
  /**
   * Generate rule-based fallback insights
   */
  async _generateFallbackInsights(projectId) {
    const insights = [];
    
    try {
      const productivity = await productivityScorer.getProductivityReport(projectId, 7);
      const stalledTasks = await taskCorrelationEngine.detectStalledTasks(projectId);
      const activeTask = await taskCorrelationEngine.getActiveTask(projectId);
      
      // Productivity insights
      if (productivity.overallScore >= 80) {
        insights.push('🎯 Excellent productivity! You\'re maintaining strong focus and consistency.');
      } else if (productivity.overallScore >= 60) {
        insights.push('📈 Good progress. Consider increasing focus session duration for better flow.');
      } else {
        insights.push('⚠️ Productivity is below target. Try scheduling dedicated focus blocks.');
      }
      
      // Focus insights
      if (productivity.focus.metrics.totalFocusSessions < 7) {
        insights.push('🌙 Low focus session count. Aim for at least 1-2 deep focus sessions daily.');
      }
      
      // Stalled task insights
      if (stalledTasks.length > 0) {
        insights.push(`⏸️ ${stalledTasks.length} task(s) stalled. "${stalledTasks[0].taskTitle}" needs attention.`);
      }
      
      // Active task insights
      if (activeTask) {
        insights.push(`✅ Currently working on "${activeTask.taskTitle}". Keep the momentum!`);
      } else {
        insights.push('💡 No recent activity detected. Time to dive back in!');
      }
      
      // Consistency insights
      if (productivity.consistency.metrics.activeDays < 5) {
        insights.push('📅 Consistency can improve. Try coding at least 5 days per week.');
      }
      
    } catch (error) {
      insights.push('📊 Activity tracking active. Keep coding to see insights!');
    }
    
    return {
      insights: insights.slice(0, 5),
      metadata: {
        overallScore: 0,
        activeTasks: 0,
        stalledTasks: 0,
        focusSessions: 0,
        timestamp: new Date()
      }
    };
  }
  
  /**
   * Generate quick status summary
   */
  async generateQuickSummary(projectId) {
    try {
      const activeTask = await taskCorrelationEngine.getActiveTask(projectId);
      const productivity = await productivityScorer.calculateDailyScore(projectId);
      
      if (activeTask) {
        return `Working on "${activeTask.taskTitle}" • Productivity: ${productivity.score}/100`;
      } else {
        return `No active task • Daily productivity: ${productivity.score}/100`;
      }
    } catch (error) {
      return 'Activity tracking active';
    }
  }
}

module.exports = new InsightGenerator();
