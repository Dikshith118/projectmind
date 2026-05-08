const aiContextEngine = require('../services/aiContextEngine');
const aiExplanationEngine = require('../services/aiExplanationEngine');
const confidenceScorer = require('../services/confidenceScorer');
const productivityScorer = require('../services/productivityScorer');
const taskCorrelationEngine = require('../services/taskCorrelationEngine');

/**
 * EXPLAINABLE AI CONTROLLER
 * 
 * Provides transparent AI explanations with reasoning and confidence scores
 */

// Get explained risk assessment
exports.getExplainedRisk = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Build unified context
    const context = await aiContextEngine.buildUnifiedContext(projectId, {
      includeActivity: true,
      includeProductivity: true,
      includeTaskCorrelation: false,
      includeFocusSessions: false,
      includeDocuments: false
    });

    // Generate explanation
    const explanation = aiExplanationEngine.explainRiskLevel(context);

    // Calculate confidence
    const confidenceData = confidenceScorer.calculateRiskConfidence(context);

    res.json({
      ...explanation,
      confidence: confidenceData.score,
      confidenceLevel: confidenceData.level,
      confidenceFactors: confidenceData.factors,
      timestamp: new Date()
    });

  } catch (err) {
    console.error('[ExplainableAI] Risk explanation error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get explained productivity score
exports.getExplainedProductivity = async (req, res) => {
  try {
    const { projectId } = req.params;
    const days = parseInt(req.query.days) || 7;

    // Get productivity data
    const productivity = await productivityScorer.getProductivityReport(projectId, days);

    // Generate explanation
    const explanation = aiExplanationEngine.explainProductivityScore(productivity, null);

    // Calculate confidence
    const confidenceData = confidenceScorer.calculateProductivityConfidence(productivity, days);

    res.json({
      ...explanation,
      confidence: confidenceData.score,
      confidenceLevel: confidenceData.level,
      confidenceFactors: confidenceData.factors,
      timestamp: new Date()
    });

  } catch (err) {
    console.error('[ExplainableAI] Productivity explanation error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get explained task priority
exports.getExplainedTaskPriority = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    // Build context
    const context = await aiContextEngine.buildUnifiedContext(projectId);

    // Find task
    const task = context.tasks.allTasks.find(t => t.id.toString() === taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Generate explanation
    const explanation = aiExplanationEngine.explainTaskPriority(task, context);

    res.json({
      ...explanation,
      timestamp: new Date()
    });

  } catch (err) {
    console.error('[ExplainableAI] Task priority explanation error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get explained focus recommendation
exports.getExplainedFocusRecommendation = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Build context
    const context = await aiContextEngine.buildUnifiedContext(projectId, {
      includeActivity: true,
      includeProductivity: true,
      includeTaskCorrelation: true
    });

    // Get stalled tasks
    const stalledTasks = await taskCorrelationEngine.detectStalledTasks(projectId);

    // Find best task to focus on
    let recommendedTask = null;

    // Priority 1: Stalled high-priority tasks
    const stalledHighPriority = stalledTasks.filter(t => t.status !== 'done' && t.priority === 'high');
    if (stalledHighPriority.length > 0) {
      recommendedTask = stalledHighPriority[0];
    }

    // Priority 2: Today's high-priority tasks
    if (!recommendedTask) {
      const todayHighPriority = context.tasks.todaysTasks.filter(t => t.priority === 'high' && t.status !== 'done');
      if (todayHighPriority.length > 0) {
        recommendedTask = todayHighPriority[0];
      }
    }

    // Priority 3: Any pending high-priority task
    if (!recommendedTask) {
      const anyHighPriority = context.tasks.allTasks.filter(t => t.priority === 'high' && t.status !== 'done');
      if (anyHighPriority.length > 0) {
        recommendedTask = anyHighPriority[0];
      }
    }

    // Priority 4: Today's tasks
    if (!recommendedTask && context.tasks.todaysTasks.length > 0) {
      recommendedTask = context.tasks.todaysTasks[0];
    }

    if (!recommendedTask) {
      return res.json({
        message: 'No tasks to recommend',
        reasoning: 'All tasks are complete or no tasks available'
      });
    }

    // Add stalled info if applicable
    const stalledInfo = stalledTasks.find(t => t.taskId.toString() === recommendedTask.id.toString());
    if (stalledInfo) {
      recommendedTask.stalledDays = stalledInfo.stalledDays;
      recommendedTask.stalledReason = stalledInfo.reason;
    } else {
      recommendedTask.stalledDays = 0;
    }

    // Generate explanation
    const explanation = aiExplanationEngine.explainFocusRecommendation(
      recommendedTask,
      context.tasks.allTasks,
      context
    );

    // Calculate confidence
    const confidenceData = confidenceScorer.calculateFocusConfidence(recommendedTask, context);

    res.json({
      ...explanation,
      confidence: confidenceData.score,
      confidenceLevel: confidenceData.level,
      confidenceFactors: confidenceData.factors,
      timestamp: new Date()
    });

  } catch (err) {
    console.error('[ExplainableAI] Focus recommendation error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get explained recovery plan
exports.getExplainedRecoveryPlan = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Build context
    const context = await aiContextEngine.buildUnifiedContext(projectId, {
      includeActivity: true,
      includeProductivity: true
    });

    // Check if recovery needed
    if (context.project.daysBehind === 0) {
      return res.json({
        needed: false,
        message: 'Project is on track. No recovery plan needed.',
        reasoning: 'Project is not behind schedule'
      });
    }

    // Generate basic recovery plan
    const plan = {
      actions: [
        { action: 'Focus on high-priority tasks only', impact: 'Reduces scope to essentials' },
        { action: 'Increase daily coding hours', impact: 'Adds capacity' },
        { action: 'Skip or defer low-priority tasks', impact: 'Frees up time' }
      ],
      estimatedRecoveryDays: Math.ceil(context.project.daysBehind * 0.7)
    };

    // Generate explanation
    const explanation = aiExplanationEngine.explainRecoveryPlan(plan, context);

    res.json({
      ...explanation,
      timestamp: new Date()
    });

  } catch (err) {
    console.error('[ExplainableAI] Recovery plan error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get all explanations (comprehensive)
exports.getAllExplanations = async (req, res) => {
  try {
    const { projectId } = req.params;

    const [risk, productivity, focus] = await Promise.all([
      exports.getExplainedRisk({ params: { projectId } }, { json: (data) => data }).catch(() => null),
      exports.getExplainedProductivity({ params: { projectId }, query: { days: 7 } }, { json: (data) => data }).catch(() => null),
      exports.getExplainedFocusRecommendation({ params: { projectId } }, { json: (data) => data }).catch(() => null)
    ]);

    res.json({
      risk,
      productivity,
      focus,
      timestamp: new Date()
    });

  } catch (err) {
    console.error('[ExplainableAI] All explanations error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
