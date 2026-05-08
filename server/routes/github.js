const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const auth = require('../middleware/auth');

/**
 * GITHUB ROUTES
 */

// OAuth callback
router.post('/oauth/callback', auth, githubController.oauthCallback);

// Link repository
router.post('/link', auth, githubController.linkRepository);

// Get user repositories
router.get('/repos', auth, githubController.getUserRepositories);

// Get integration status
router.get('/status/:projectId', auth, githubController.getIntegrationStatus);

// Sync commits manually
router.post('/sync/:projectId', auth, githubController.syncCommits);

// Get commits
router.get('/commits/:projectId', auth, githubController.getCommits);

// Get commit insights
router.get('/insights/:projectId', auth, githubController.getCommitInsights);

// Unlink repository
router.delete('/unlink/:projectId', auth, githubController.unlinkRepository);

// Webhook endpoint (no auth - verified by signature)
router.post('/webhook', githubController.handleWebhook);

module.exports = router;
