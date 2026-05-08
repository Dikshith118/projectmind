const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { protect } = require('../middleware/auth');

/**
 * TEAM COLLABORATION ROUTES
 */

// Search users
router.get('/search', protect, teamController.searchUsers);

// Project team management
router.post('/projects/:projectId/invite', protect, teamController.inviteMember);
router.get('/projects/:projectId/members', protect, teamController.getMembers);
router.delete('/projects/:projectId/members/:userId', protect, teamController.removeMember);
router.put('/projects/:projectId/members/:userId/role', protect, teamController.updateMemberRole);
router.get('/projects/:projectId/role', protect, teamController.getUserRole);

// Team analytics
router.get('/projects/:projectId/analytics', protect, teamController.getTeamAnalytics);
router.get('/projects/:projectId/activity', protect, teamController.getActivityFeed);

// Task assignment
router.post('/projects/:projectId/tasks/:taskId/assign', protect, teamController.assignTask);

// Invitation acceptance
router.post('/invitations/:token/accept', protect, teamController.acceptInvitation);

module.exports = router;
