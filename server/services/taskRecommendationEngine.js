const platformInferenceService = require('./platformInferenceService');

/**
 * TASK RECOMMENDATION ENGINE
 * 
 * AI-powered task execution recommendations including:
 * - Platform recommendations
 * - Execution workflows
 * - Next steps
 * - Blockers and warnings
 */
class TaskRecommendationEngine {

  /**
   * Generate comprehensive task recommendations
   */
  async generateRecommendations(task, projectContext = {}, allTasks = []) {
    try {
      console.log(`[TaskRecommendationEngine] Generating recommendations for task: ${task.title}`);

      // Run all analyses in parallel
      const [
        platforms,
        workflow,
        blockers
      ] = await Promise.all([
        platformInferenceService.inferPlatforms(task, projectContext),
        platformInferenceService.generateExecutionWorkflow(task, []),
        platformInferenceService.detectBlockers(task, allTasks)
      ]);

      return {
        task: {
          id: task._id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          estimatedHours: task.estimatedHours,
          day: task.day
        },
        platforms,
        workflow,
        blockers: blockers.blockers,
        warnings: blockers.warnings,
        nextSteps: this._generateNextSteps(task, workflow, blockers),
        timestamp: new Date()
      };

    } catch (error) {
      console.error('[TaskRecommendationEngine] Error:', error.message);
      
      // Return fallback recommendations
      return this._getFallbackRecommendations(task);
    }
  }

  /**
   * Generate next steps
   */
  _generateNextSteps(task, workflow, blockers) {
    const steps = [];

    // Check for blockers first
    if (blockers.blockers.length > 0) {
      steps.push({
        order: 1,
        action: 'Resolve Dependencies',
        description: 'Complete dependent tasks before starting this one',
        type: 'blocker',
        icon: '🚫'
      });
      return steps;
    }

    // If task not started
    if (task.status === 'pending') {
      steps.push({
        order: 1,
        action: 'Review Task Requirements',
        description: 'Understand what needs to be done and gather necessary information',
        type: 'preparation',
        icon: '📋'
      });

      steps.push({
        order: 2,
        action: 'Open Required Platforms',
        description: 'Launch the recommended tools and platforms',
        type: 'setup',
        icon: '🚀'
      });

      if (workflow.length > 0) {
        steps.push({
          order: 3,
          action: `Start ${workflow[0].phase}`,
          description: workflow[0].actions[0],
          type: 'execution',
          icon: '⚡'
        });
      }
    }

    // If task in progress
    if (task.status === 'partial') {
      steps.push({
        order: 1,
        action: 'Continue Execution',
        description: 'Follow the workflow steps to complete the task',
        type: 'execution',
        icon: '⚡'
      });

      steps.push({
        order: 2,
        action: 'Test Your Work',
        description: 'Verify functionality works as expected',
        type: 'testing',
        icon: '🧪'
      });

      steps.push({
        order: 3,
        action: 'Mark Complete',
        description: 'Update task status when finished',
        type: 'completion',
        icon: '✅'
      });
    }

    return steps;
  }

  /**
   * Get fallback recommendations
   */
  _getFallbackRecommendations(task) {
    return {
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status
      },
      platforms: [
        {
          id: 'vscode',
          name: 'VS Code',
          category: 'IDE',
          icon: '💻',
          description: 'Code editor for development',
          url: 'https://code.visualstudio.com',
          relevance: 'high'
        }
      ],
      workflow: [
        {
          phase: 'Execution',
          order: 1,
          actions: [
            'Review task requirements',
            'Complete the work',
            'Test and verify',
            'Mark as complete'
          ]
        }
      ],
      blockers: [],
      warnings: [],
      nextSteps: [
        {
          order: 1,
          action: 'Start Task',
          description: 'Begin working on this task',
          type: 'execution',
          icon: '⚡'
        }
      ],
      timestamp: new Date()
    };
  }
}

module.exports = new TaskRecommendationEngine();
