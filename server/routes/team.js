const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const auth = require('../middleware/auth');

/**
 * TEAM COLLABORATION ROUTES
 */

// Search users
router.get('/search', auth, teamController.searchUsers);

// Project team management
router.post('/projects/:projectId/invite', auth, teamController.inviteMember);
router.get('/projects/:projectId/members', auth, teamController.getMembers);
router.delete('/projects/:projectId/members/:userId', auth, teamController.removeMember);
router.put('/projects/:projectId/members/:userId/role', auth, teamController.updateMemberRole);
router.get('/projects/:projectId/role', auth, teamController.getUserRole);

// Team analytics
router.get('/projects/:projectId/analytics', auth, teamController.getTeamAnalytics);
router.get('/projects/:projectId/activity', auth, teamController.getActivityFeed);

// Task assignment
router.post('/projects/:projectId/tasks/:taskId/assign', auth, teamController.assignTask);

// Invitation acceptance
router.post('/invitations/:token/accept', auth, teamController.acceptInvitation);

module.exports = router;
