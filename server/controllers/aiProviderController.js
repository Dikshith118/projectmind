const aiProvider = require('../services/aiProvider');

/**
 * AI PROVIDER CONTROLLER
 * 
 * Manages AI provider status, switching, and monitoring
 */

/**
 * Get provider status
 * GET /api/ai/provider-status
 */
exports.getProviderStatus = async (req, res) => {
  try {
    const status = await aiProvider.getStatus();
    res.json(status);
  } catch (error) {
    console.error('[AIProviderController] Status error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get provider statistics
 * GET /api/ai/provider-stats
 */
exports.getProviderStats = async (req, res) => {
  try {
    const stats = aiProvider.getStats();
    res.json(stats);
  } catch (error) {
    console.error('[AIProviderController] Stats error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Switch active provider
 * POST /api/ai/provider-switch
 * Body: { provider: 'groq' | 'ollama' }
 */
exports.switchProvider = async (req, res) => {
  try {
    const { provider } = req.body;

    if (!provider) {
      return res.status(400).json({ error: 'Provider name required' });
    }

    const status = await aiProvider.switchProvider(provider);
    res.json({
      message: `Switched to ${provider} provider`,
      status
    });
  } catch (error) {
    console.error('[AIProviderController] Switch error:', error.message);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Toggle fallback
 * POST /api/ai/provider-fallback
 * Body: { enabled: true | false }
 */
exports.toggleFallback = async (req, res) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled must be boolean' });
    }

    aiProvider.setFallbackEnabled(enabled);
    
    res.json({
      message: `Fallback ${enabled ? 'enabled' : 'disabled'}`,
      fallbackEnabled: enabled
    });
  } catch (error) {
    console.error('[AIProviderController] Fallback toggle error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Test provider
 * POST /api/ai/provider-test
 * Body: { provider: 'groq' | 'ollama', prompt: 'test prompt' }
 */
exports.testProvider = async (req, res) => {
  try {
    const { provider, prompt = 'Hello, respond with OK' } = req.body;

    if (!provider) {
      return res.status(400).json({ error: 'Provider name required' });
    }

    const startTime = Date.now();
    
    // Temporarily switch provider
    const originalProvider = aiProvider.activeProvider;
    await aiProvider.switchProvider(provider);

    // Test generation
    const result = await aiProvider.generateText(prompt, {
      maxTokens: 50,
      temperature: 0.5
    });

    // Switch back
    if (originalProvider && originalProvider !== provider) {
      await aiProvider.switchProvider(originalProvider);
    }

    const totalTime = Date.now() - startTime;

    res.json({
      success: true,
      provider: result.provider,
      model: result.model,
      responseTime: result.responseTime,
      totalTime,
      response: result.text
    });
  } catch (error) {
    console.error('[AIProviderController] Test error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
