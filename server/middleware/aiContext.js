const aiContextEngine = require('../services/aiContextEngine');

/**
 * AI CONTEXT MIDDLEWARE
 * 
 * Automatically attaches unified AI context to requests
 * Makes context available to all route handlers
 */

/**
 * Attach unified context to request
 * Usage: router.get('/endpoint', attachAIContext, handler)
 */
exports.attachAIContext = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId || req.query.projectId;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    // Build unified context
    const context = await aiContextEngine.buildUnifiedContext(projectId, {
      includeActivity: true,
      includeProductivity: true,
      includeTaskCorrelation: true,
      includeFocusSessions: true,
      includeDocuments: true,
      days: 7
    });

    // Attach to request
    req.aiContext = context;
    req.aiContextPrompt = aiContextEngine.generatePromptContext(context);

    next();
  } catch (error) {
    console.error('[AI Context Middleware] Error:', error.message);
    res.status(500).json({ error: 'Failed to build AI context' });
  }
};

/**
 * Attach lightweight context (no productivity/activity)
 * Usage: router.get('/endpoint', attachLightContext, handler)
 */
exports.attachLightContext = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId || req.query.projectId;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    // Build lightweight context
    const context = await aiContextEngine.buildUnifiedContext(projectId, {
      includeActivity: false,
      includeProductivity: false,
      includeTaskCorrelation: false,
      includeFocusSessions: false,
      includeDocuments: true,
      days: 7
    });

    req.aiContext = context;
    req.aiContextPrompt = aiContextEngine.generatePromptContext(context);

    next();
  } catch (error) {
    console.error('[AI Context Middleware] Error:', error.message);
    res.status(500).json({ error: 'Failed to build AI context' });
  }
};

/**
 * Validate project ownership
 * Usage: router.post('/endpoint', auth, validateProjectOwnership, handler)
 */
exports.validateProjectOwnership = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId || req.query.projectId;
    const userId = req.user.userId;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const Project = require('../models/Project');
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.user.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    req.project = project;
    next();
  } catch (error) {
    console.error('[Project Ownership Middleware] Error:', error.message);
    res.status(500).json({ error: 'Failed to validate project ownership' });
  }
};
