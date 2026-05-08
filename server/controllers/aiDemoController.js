const aiReasoningEngine = require('../services/aiReasoningEngine');

/**
 * DEMO GENERATOR CONTROLLER
 * 
 * Uses the unified AI reasoning engine with full project context
 */

exports.generateDemo = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    // Define expected JSON schema
    const schema = {
      overview: "string - 2-3 sentences about the project",
      problem: "string - problem statement (1-2 sentences)",
      features: ["array of completed feature strings"],
      techStack: ["array of technology strings"],
      futureScope: ["array of planned feature strings"],
      demoScript: ["array of demo step strings"]
    };

    // Use unified AI reasoning engine with structured output
    const result = await aiReasoningEngine.reasonStructured(
      projectId,
      'demo',
      'Generate a comprehensive demo summary for this project based on actual completed features, detected technologies, and real progress data.',
      schema,
      {
        maxTokens: 2000,
        temperature: 0.6
      }
    );

    res.json(result.data);

  } catch (err) {
    console.error('[Demo Generator] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Generate quick project summary (for judges/presentations)
 */
exports.generateQuickSummary = async (req, res) => {
  try {
    const { projectId } = req.body;

    const result = await aiReasoningEngine.reason(
      projectId,
      'demo',
      'Generate a concise 5-bullet point summary of this project suitable for judges or quick presentations. Focus on key features, tech stack, and current status.',
      {
        maxTokens: 500,
        temperature: 0.5
      }
    );

    res.json({ summary: result.response });

  } catch (err) {
    console.error('[Demo Generator] Quick summary error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get next best action for Deep Focus Mode
 */
exports.getNextAction = async (req, res) => {
  try {
    const { projectId } = req.body;

    const schema = {
      nextAction: "string - specific task title to start now",
      reasoning: "string - why this task is most important (1 sentence)",
      remainingTasks: "number",
      highRiskTasks: "number",
      estimatedWorkLeft: "string - hours remaining",
      riskLevel: "string - Low/Medium/High/Critical",
      riskAnalysis: "string - brief risk explanation"
    };

    const result = await aiReasoningEngine.reasonStructured(
      projectId,
      'focus',
      'Analyze the current project state and recommend the next best action. Consider priorities, risks, deadlines, and recent activity patterns.',
      schema,
      {
        maxTokens: 600,
        temperature: 0.3
      }
    );

    res.json(result.data);

  } catch (err) {
    console.error('[Focus Mode] Next action error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Generate recovery plan
 */
exports.generateRecoveryPlan = async (req, res) => {
  try {
    const { projectId } = req.body;

    const schema = {
      needed: "boolean",
      severity: "string - Mild/Moderate/Critical",
      actions: [
        {
          action: "string - specific action",
          impact: "string - expected result"
        }
      ],
      tasksToSkip: ["array of task titles that can be deprioritized"],
      focusAreas: ["array of critical tasks to prioritize"],
      estimatedRecoveryDays: "number"
    };

    const result = await aiReasoningEngine.reasonStructured(
      projectId,
      'recovery',
      'Analyze the project delays and create a comprehensive recovery plan. Identify which tasks can be skipped, which must be prioritized, and provide realistic recovery timeline.',
      schema,
      {
        maxTokens: 1000,
        temperature: 0.4
      }
    );

    res.json(result.data);

  } catch (err) {
    console.error('[Recovery Plan] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
