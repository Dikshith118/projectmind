const axios = require('axios');
const crypto = require('crypto');

/**
 * GITHUB SERVICE
 * 
 * Handles all GitHub API interactions:
 * - OAuth authentication
 * - Repository data fetching
 * - Commit retrieval
 * - Branch tracking
 * - Pull request monitoring
 * - Webhook management
 */
class GitHubService {
  constructor() {
    this.baseURL = 'https://api.github.com';
    this.clientId = process.env.GITHUB_CLIENT_ID;
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET;
  }

  /**
   * Exchange OAuth code for access token
   */
  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code
        },
        {
          headers: { Accept: 'application/json' }
        }
      );

      return {
        accessToken: response.data.access_token,
        tokenType: response.data.token_type,
        scope: response.data.scope
      };
    } catch (error) {
      console.error('[GitHub] Token exchange error:', error.message);
      throw new Error('Failed to exchange code for token');
    }
  }

  /**
   * Get authenticated user info
   */
  async getAuthenticatedUser(accessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/user`, {
        headers: this._getHeaders(accessToken)
      });

      return {
        id: response.data.id,
        username: response.data.login,
        name: response.data.name,
        email: response.data.email,
        avatarUrl: response.data.avatar_url,
        profileUrl: response.data.html_url
      };
    } catch (error) {
      console.error('[GitHub] Get user error:', error.message);
      throw new Error('Failed to get user info');
    }
  }

  /**
   * Get user repositories
   */
  async getUserRepositories(accessToken, page = 1, perPage = 30) {
    try {
      const response = await axios.get(`${this.baseURL}/user/repos`, {
        headers: this._getHeaders(accessToken),
        params: {
          page,
          per_page: perPage,
          sort: 'updated',
          affiliation: 'owner,collaborator'
        }
      });

      return response.data.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        description: repo.description,
        url: repo.html_url,
        defaultBranch: repo.default_branch,
        private: repo.private,
        language: repo.language,
        updatedAt: repo.updated_at
      }));
    } catch (error) {
      console.error('[GitHub] Get repos error:', error.message);
      throw new Error('Failed to get repositories');
    }
  }

  /**
   * Get repository details
   */
  async getRepository(accessToken, owner, repo) {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}`, {
        headers: this._getHeaders(accessToken)
      });

      return {
        id: response.data.id,
        name: response.data.name,
        fullName: response.data.full_name,
        owner: response.data.owner.login,
        description: response.data.description,
        url: response.data.html_url,
        defaultBranch: response.data.default_branch,
        private: response.data.private,
        language: response.data.language,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at
      };
    } catch (error) {
      console.error('[GitHub] Get repo error:', error.message);
      throw new Error('Failed to get repository');
    }
  }

  /**
   * Get repository branches
   */
  async getBranches(accessToken, owner, repo) {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}/branches`, {
        headers: this._getHeaders(accessToken)
      });

      return response.data.map(branch => ({
        name: branch.name,
        sha: branch.commit.sha,
        protected: branch.protected
      }));
    } catch (error) {
      console.error('[GitHub] Get branches error:', error.message);
      throw new Error('Failed to get branches');
    }
  }

  /**
   * Get commits from repository
   */
  async getCommits(accessToken, owner, repo, options = {}) {
    try {
      const params = {
        per_page: options.perPage || 100,
        page: options.page || 1
      };

      if (options.since) params.since = options.since;
      if (options.until) params.until = options.until;
      if (options.sha) params.sha = options.sha; // branch or commit SHA
      if (options.author) params.author = options.author;

      const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}/commits`, {
        headers: this._getHeaders(accessToken),
        params
      });

      return response.data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          username: commit.author?.login,
          avatarUrl: commit.author?.avatar_url
        },
        committedAt: commit.commit.author.date,
        url: commit.html_url,
        stats: commit.stats // May not be included in list view
      }));
    } catch (error) {
      console.error('[GitHub] Get commits error:', error.message);
      throw new Error('Failed to get commits');
    }
  }

  /**
   * Get single commit details (includes file changes)
   */
  async getCommit(accessToken, owner, repo, sha) {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}/commits/${sha}`, {
        headers: this._getHeaders(accessToken)
      });

      return {
        sha: response.data.sha,
        message: response.data.commit.message,
        author: {
          name: response.data.commit.author.name,
          email: response.data.commit.author.email,
          username: response.data.author?.login,
          avatarUrl: response.data.author?.avatar_url
        },
        committedAt: response.data.commit.author.date,
        url: response.data.html_url,
        stats: {
          additions: response.data.stats.additions,
          deletions: response.data.stats.deletions,
          total: response.data.stats.total
        },
        files: response.data.files.map(file => ({
          filename: file.filename,
          status: file.status,
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes
        }))
      };
    } catch (error) {
      console.error('[GitHub] Get commit error:', error.message);
      throw new Error('Failed to get commit details');
    }
  }

  /**
   * Get pull requests
   */
  async getPullRequests(accessToken, owner, repo, state = 'all') {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}/pulls`, {
        headers: this._getHeaders(accessToken),
        params: {
          state, // open, closed, all
          per_page: 100
        }
      });

      return response.data.map(pr => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        author: pr.user.login,
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
        mergedAt: pr.merged_at,
        closedAt: pr.closed_at,
        url: pr.html_url,
        branch: pr.head.ref,
        baseBranch: pr.base.ref
      }));
    } catch (error) {
      console.error('[GitHub] Get PRs error:', error.message);
      throw new Error('Failed to get pull requests');
    }
  }

  /**
   * Create webhook for repository
   */
  async createWebhook(accessToken, owner, repo, webhookUrl, secret) {
    try {
      const response = await axios.post(
        `${this.baseURL}/repos/${owner}/${repo}/hooks`,
        {
          name: 'web',
          active: true,
          events: ['push', 'pull_request', 'commit_comment'],
          config: {
            url: webhookUrl,
            content_type: 'json',
            secret: secret,
            insecure_ssl: '0'
          }
        },
        {
          headers: this._getHeaders(accessToken)
        }
      );

      return {
        id: response.data.id,
        url: response.data.url,
        active: response.data.active,
        events: response.data.events
      };
    } catch (error) {
      console.error('[GitHub] Create webhook error:', error.message);
      throw new Error('Failed to create webhook');
    }
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(accessToken, owner, repo, webhookId) {
    try {
      await axios.delete(`${this.baseURL}/repos/${owner}/${repo}/hooks/${webhookId}`, {
        headers: this._getHeaders(accessToken)
      });
      return true;
    } catch (error) {
      console.error('[GitHub] Delete webhook error:', error.message);
      throw new Error('Failed to delete webhook');
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  }

  /**
   * Get request headers
   */
  _getHeaders(accessToken) {
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ProjectMind-AI'
    };
  }

  /**
   * Generate webhook secret
   */
  generateWebhookSecret() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = new GitHubService();
