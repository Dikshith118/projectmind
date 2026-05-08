const express = require('express');
const router = express.Router();
const aiProviderController = require('../controllers/aiProviderController');
const auth = require('../middleware/auth');

/**
 * AI PROVIDER ROUTES
 * 
 * Endpoints for managing AI providers (Groq, Ollama)
 */

// Get provider status
router.get('/provider-status', auth, aiProviderController.getProviderStatus);

// Get provider statistics
router.get('/provider-stats', auth, aiProviderController.getProviderStats);

// Switch active provider
router.post('/provider-switch', auth, aiProviderController.switchProvider);

// Toggle fallback
router.post('/provider-fallback', auth, aiProviderController.toggleFallback);

// Test provider
router.post('/provider-test', auth, aiProviderController.testProvider);

module.exports = router;
