const aiReasoningEngine = require('../services/aiReasoningEngine');

/**
 * COPILOT CONTROLLER
 * 
 * Uses the unified AI reasoning engine for consistent, context-aware responses
 */

exports.chat = async (req, res) => {
  try {
    const { projectId, message } = req.body;

    if (!projectId || !message) {
      return res.status(400).json({ error: 'projectId and message are required' });
    }

    // Use unified AI reasoning engine
    const result = await aiReasoningEngine.reason(
      projectId,
      'copilot',
      message,
      {
        maxTokens: 300,
        temperature: 0.5
      }
    );

    res.json({ 
      reply: result.response,
      contextAware: true,
      timestamp: result.timestamp
    });

  } catch (err) {
    console.error('[Copilot] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get quick suggestions based on current context
 */
exports.getQuickSuggestions = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Batch reasoning for multiple suggestions
    const queries = [
      { 
        module: 'copilot', 
        query: 'What should I focus on right now? One sentence.',
        options: { maxTokens: 100 }
      },
      { 
        module: 'copilot', 
        query: 'What is my biggest risk? One sentence.',
        options: { maxTokens: 100 }
      },
      { 
        module: 'copilot', 
        query: 'How is my productivity? One sentence.',
        options: { maxTokens: 100 }
      }
    ];

    const results = await aiReasoningEngine.batchReason(projectId, queries);

    const suggestions = results
      .filter(r => r.success)
      .map(r => r.response);

    res.json({ suggestions });

  } catch (err) {
    console.error('[Copilot] Quick suggestions error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
