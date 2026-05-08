const GitHubIntegration = require('../models/GitHubIntegration');
const GitHubCommit = require('../models/GitHubCommit');
const Task = require('../models/Task');
const githubService = require('../services/githubService');
const commitAnalyzer = require('../services/commitAnalyzer');
const realtimeEventBroadcaster = require('../services/realtimeEventBroadcaster');

/**
 * GITHUB CONTROLLER
 * 
 * Handles GitHub integration endpoints
 */

// OAuth callback - exchange code for token
exports.oauthCallback = async (req, res) => {
  try {
    const { code, projectId } = req.body;
    const userId = req.user.id;

    if (!code || !projectId) {
      return res.status(400).json({ error: 'Code and projectId required' });
    }

    // Exchange code for access token
    const { accessToken } = await githubService.exchangeCodeForToken(code);

    // Get user info
    const githubUser = await githubService.getAuthenticatedUser(accessToken);

    // Store temporarily (will be completed when repo is linked)
    res.json({
      success: true,
      githubUser,
      accessToken, // Send to frontend temporarily
      message: 'Authentication successful. Please select a repository.'
    });

  } catch (err) {
    console.error('[GitHub] OAuth callback error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Link repository to project
exports.linkRepository = async (req, res) => {
  try {
    const { projectId, accessToken, repoOwner, repoName, trackedBranches } = req.body;
    const userId = req.user.id;

    if (!projectId || !accessToken || !repoOwner || !repoName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get GitHub user info
    const githubUser = await githubService.getAuthenticatedUser(accessToken);

    // Get repository details
    const repo = await githubService.getRepository(accessToken, repoOwner, repoName);

    // Create webhook secret
    const webhookSecret = githubService.generateWebhookSecret();

    // Create or update integration
    let integration = await GitHubIntegration.findOne({ user: userId, project: projectId });

    if (integration) {
      // Update existing
      integration.githubUserId = githubUser.id;
      integration.githubUsername = githubUser.username;
      integration.accessToken = accessToken;
      integration.repoOwner = repoOwner;
      integration.repoName = repoName;
      integration.repoFullName = repo.fullName;
      integration.repoUrl = repo.url;
      integration.defaultBranch = repo.defaultBranch;
      integration.trackedBranches = trackedBranches || [repo.defaultBranch];
      integration.webhookSecret = webhookSecret;
      integration.syncEnabled = true;
    } else {
      // Create new
      integration = new GitHubIntegration({
        user: userId,
        project: projectId,
        githubUserId: githubUser.id,
        githubUsername: githubUser.username,
        accessToken,
        repoOwner,
        repoName,
        repoFullName: repo.fullName,
        repoUrl: repo.url,
        defaultBranch: repo.defaultBranch,
        trackedBranches: trackedBranches || [repo.defaultBranch],
        webhookSecret
      });
    }

    await integration.save();

    // Fetch initial commits
    await this._syncCommits(integration);

    // Broadcast event
    realtimeEventBroadcaster.broadcastGitHubLinked(projectId, {
      repoName: repo.fullName,
      repoUrl: repo.url
    });

    res.json({
      success: true,
      integration: {
        id: integration._id,
        repoFullName: integration.repoFullName,
        repoUrl: integration.repoUrl,
        defaultBranch: integration.defaultBranch,
        trackedBranches: integration.trackedBranches
      },
      message: 'Repository linked successfully'
    });

  } catch (err) {
    console.error('[GitHub] Link repo error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get user repositories
exports.getUserRepositories = async (req, res) => {
  try {
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token required' });
    }

    const repos = await githubService.getUserRepositories(accessToken);

    res.json({ repos });

  } catch (err) {
    console.error('[GitHub] Get repos error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get integration status
exports.getIntegrationStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const integration = await GitHubIntegration.findOne({ user: userId, project: projectId });

    if (!integration) {
      return res.json({ linked: false });
    }

    res.json({
      linked: true,
      integration: {
        id: integration._id,
        githubUsername: integration.githubUsername,
        repoFullName: integration.repoFullName,
        repoUrl: integration.repoUrl,
        defaultBranch: integration.defaultBranch,
        trackedBranches: integration.trackedBranches,
        lastSyncAt: integration.lastSyncAt,
        totalCommits: integration.totalCommits,
        syncEnabled: integration.syncEnabled
      }
    });

  } catch (err) {
    console.error('[GitHub] Get status error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Sync commits manually
exports.syncCommits = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const integration = await GitHubIntegration.findOne({ user: userId, project: projectId });

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    const result = await this._syncCommits(integration);

    res.json({
      success: true,
      ...result
    });

  } catch (err) {
    console.error('[GitHub] Sync error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get commits for project
exports.getCommits = async (req, res) => {
  try {
    const { projectId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const commits = await GitHubCommit.find({ project: projectId })
      .sort('-committedAt')
      .limit(limit)
      .populate('aiAnalysis.inferredTask', 'title priority status');

    res.json({ commits });

  } catch (err) {
    console.error('[GitHub] Get commits error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get commit insights
exports.getCommitInsights = async (req, res) => {
  try {
    const { projectId } = req.params;
    const days = parseInt(req.query.days) || 7;

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const commits = await GitHubCommit.find({
      project: projectId,
      committedAt: { $gte: cutoff }
    }).sort('-committedAt');

    if (commits.length === 0) {
      return res.json({
        insights: [],
        velocity: 0,
        patterns: {},
        totalCommits: 0
      });
    }

    // Calculate velocity
    const velocity = commitAnalyzer.calculateCommitVelocity(commits, days);

    // Detect patterns
    const patterns = commitAnalyzer.detectPatterns(commits);

    // Generate AI insights
    const Project = require('../models/Project');
    const project = await Project.findById(projectId);
    const insights = await commitAnalyzer.generateCommitInsights(commits, project);

    res.json({
      insights,
      velocity: velocity.toFixed(2),
      patterns,
      totalCommits: commits.length,
      period: `Last ${days} days`
    });

  } catch (err) {
    console.error('[GitHub] Get insights error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Unlink repository
exports.unlinkRepository = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const integration = await GitHubIntegration.findOne({ user: userId, project: projectId });

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    // Delete webhook if exists
    if (integration.webhookId) {
      try {
        await githubService.deleteWebhook(
          integration.accessToken,
          integration.repoOwner,
          integration.repoName,
          integration.webhookId
        );
      } catch (err) {
        console.log('[GitHub] Webhook deletion failed:', err.message);
      }
    }

    // Delete integration
    await GitHubIntegration.deleteOne({ _id: integration._id });

    // Optionally delete commits
    // await GitHubCommit.deleteMany({ project: projectId });

    res.json({
      success: true,
      message: 'Repository unlinked successfully'
    });

  } catch (err) {
    console.error('[GitHub] Unlink error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Webhook handler
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-hub-signature-256'];
    const event = req.headers['x-github-event'];
    const payload = req.body;

    // Find integration by repository
    const repoFullName = payload.repository?.full_name;
    if (!repoFullName) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const integration = await GitHubIntegration.findOne({ repoFullName });
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    // Verify signature
    const isValid = githubService.verifyWebhookSignature(
      JSON.stringify(payload),
      signature,
      integration.webhookSecret
    );

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Handle event
    if (event === 'push') {
      await this._handlePushEvent(payload, integration);
    } else if (event === 'pull_request') {
      await this._handlePullRequestEvent(payload, integration);
    }

    res.json({ success: true });

  } catch (err) {
    console.error('[GitHub] Webhook error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Internal: Sync commits from GitHub
exports._syncCommits = async (integration) => {
  try {
    const options = {
      perPage: 100
    };

    // If we have a last sync, only fetch new commits
    if (integration.lastSyncAt) {
      options.since = integration.lastSyncAt.toISOString();
    }

    // Fetch commits for each tracked branch
    let totalNew = 0;

    for (const branch of integration.trackedBranches) {
      const commits = await githubService.getCommits(
        integration.accessToken,
        integration.repoOwner,
        integration.repoName,
        { ...options, sha: branch }
      );

      // Fetch detailed info for each commit
      for (const commit of commits) {
        const existing = await GitHubCommit.findOne({ sha: commit.sha });
        if (existing) continue;

        // Get full commit details
        const fullCommit = await githubService.getCommit(
          integration.accessToken,
          integration.repoOwner,
          integration.repoName,
          commit.sha
        );

        // Get tasks for correlation
        const tasks = await Task.find({ project: integration.project });

        // Analyze commit
        const analysis = await commitAnalyzer.analyzeCommit(fullCommit, tasks);

        // Save commit
        const newCommit = new GitHubCommit({
          project: integration.project,
          integration: integration._id,
          sha: fullCommit.sha,
          message: fullCommit.message,
          author: fullCommit.author,
          committedAt: fullCommit.committedAt,
          branch,
          additions: fullCommit.stats.additions,
          deletions: fullCommit.stats.deletions,
          totalChanges: fullCommit.stats.total,
          filesChanged: fullCommit.files,
          aiAnalysis: {
            ...analysis,
            analyzedAt: new Date()
          },
          url: fullCommit.url,
          processed: true
        });

        await newCommit.save();
        totalNew++;

        // Broadcast event
        realtimeEventBroadcaster.broadcastCommitReceived(integration.project.toString(), {
          sha: fullCommit.sha.substring(0, 7),
          message: fullCommit.message,
          author: fullCommit.author.username || fullCommit.author.name,
          category: analysis.category
        });
      }
    }

    // Update integration
    integration.lastSyncAt = new Date();
    integration.totalCommits += totalNew;
    await integration.save();

    return {
      newCommits: totalNew,
      totalCommits: integration.totalCommits,
      lastSyncAt: integration.lastSyncAt
    };

  } catch (error) {
    console.error('[GitHub] Sync commits error:', error.message);
    throw error;
  }
};

// Internal: Handle push event
exports._handlePushEvent = async (payload, integration) => {
  const commits = payload.commits || [];
  const branch = payload.ref.replace('refs/heads/', '');

  // Only process tracked branches
  if (!integration.trackedBranches.includes(branch)) {
    return;
  }

  for (const commit of commits) {
    const existing = await GitHubCommit.findOne({ sha: commit.id });
    if (existing) continue;

    // Fetch full commit details
    const fullCommit = await githubService.getCommit(
      integration.accessToken,
      integration.repoOwner,
      integration.repoName,
      commit.id
    );

    // Get tasks
    const tasks = await Task.find({ project: integration.project });

    // Analyze
    const analysis = await commitAnalyzer.analyzeCommit(fullCommit, tasks);

    // Save
    const newCommit = new GitHubCommit({
      project: integration.project,
      integration: integration._id,
      sha: fullCommit.sha,
      message: fullCommit.message,
      author: fullCommit.author,
      committedAt: fullCommit.committedAt,
      branch,
      additions: fullCommit.stats.additions,
      deletions: fullCommit.stats.deletions,
      totalChanges: fullCommit.stats.total,
      filesChanged: fullCommit.files,
      aiAnalysis: {
        ...analysis,
        analyzedAt: new Date()
      },
      url: fullCommit.url,
      processed: true
    });

    await newCommit.save();

    // Broadcast
    realtimeEventBroadcaster.broadcastCommitReceived(integration.project.toString(), {
      sha: fullCommit.sha.substring(0, 7),
      message: fullCommit.message,
      author: fullCommit.author.username || fullCommit.author.name,
      category: analysis.category
    });
  }
};

// Internal: Handle pull request event
exports._handlePullRequestEvent = async (payload, integration) => {
  const pr = payload.pull_request;
  const action = payload.action; // opened, closed, merged, etc.

  // Broadcast PR event
  realtimeEventBroadcaster.broadcastPullRequestEvent(integration.project.toString(), {
    number: pr.number,
    title: pr.title,
    action,
    author: pr.user.login,
    url: pr.html_url
  });
};

module.exports = exports;
