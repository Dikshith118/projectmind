const aiProvider = require('./aiProvider');

/**
 * COMMIT ANALYZER
 * 
 * AI-powered commit analysis engine that:
 * - Categorizes commits (feature, bugfix, refactor, etc.)
 * - Infers task completion from commits
 * - Correlates commits with tasks
 * - Detects implementation patterns
 * - Generates productivity insights
 */
class CommitAnalyzer {

  /**
   * Analyze single commit with AI
   */
  async analyzeCommit(commit, tasks = []) {
    try {
      const analysis = {
        category: this._categorizeCommit(commit.message),
        keywords: this._extractKeywords(commit.message),
        completionIndicators: this._detectCompletionIndicators(commit),
        inferredTask: null,
        confidence: 0,
        correlatedTasks: []
      };

      // AI-powered task correlation
      if (tasks.length > 0) {
        const correlation = await this._correlateWithTasks(commit, tasks);
        analysis.inferredTask = correlation.taskId;
        analysis.confidence = correlation.confidence;
        analysis.correlatedTasks = correlation.alternatives;
      }

      return analysis;
    } catch (error) {
      console.error('[CommitAnalyzer] Analysis error:', error.message);
      return this._getDefaultAnalysis();
    }
  }

  /**
   * Analyze multiple commits for patterns
   */
  async analyzeCommitBatch(commits, tasks = []) {
    const analyses = [];

    for (const commit of commits) {
      const analysis = await this.analyzeCommit(commit, tasks);
      analyses.push({
        sha: commit.sha,
        ...analysis
      });
    }

    return analyses;
  }

  /**
   * Generate productivity insights from commits
   */
  async generateCommitInsights(commits, projectContext) {
    try {
      const prompt = this._buildInsightsPrompt(commits, projectContext);

      const result = await aiProvider.generateText(prompt, {
        systemPrompt: 'You are an AI productivity analyst. Analyze commit patterns and generate 3-5 specific, actionable insights about development progress and velocity.',
        maxTokens: 800,
        temperature: 0.5
      });

      return this._parseInsights(result.text);

    } catch (error) {
      console.error('[CommitAnalyzer] Insights error:', error.message);
      return [];
    }
  }

  /**
   * Detect feature completion from commits
   */
  detectFeatureCompletion(commits, featureName) {
    const relevantCommits = commits.filter(c => 
      c.message.toLowerCase().includes(featureName.toLowerCase())
    );

    if (relevantCommits.length === 0) return { complete: false, confidence: 0 };

    const hasTests = relevantCommits.some(c => 
      c.filesChanged?.some(f => f.filename.includes('test') || f.filename.includes('spec'))
    );

    const hasDocs = relevantCommits.some(c =>
      c.filesChanged?.some(f => f.filename.includes('README') || f.filename.includes('.md'))
    );

    const hasCompletionKeywords = relevantCommits.some(c =>
      /complete|finish|done|implement|add/i.test(c.message)
    );

    let confidence = 0;
    if (hasCompletionKeywords) confidence += 40;
    if (hasTests) confidence += 30;
    if (hasDocs) confidence += 20;
    if (relevantCommits.length >= 3) confidence += 10;

    return {
      complete: confidence >= 60,
      confidence,
      indicators: {
        hasTests,
        hasDocs,
        hasCompletionKeywords,
        commitCount: relevantCommits.length
      }
    };
  }

  /**
   * Calculate commit velocity (commits per day)
   */
  calculateCommitVelocity(commits, days = 7) {
    if (commits.length === 0) return 0;

    const now = new Date();
    const cutoff = new Date(now - days * 24 * 60 * 60 * 1000);
    
    const recentCommits = commits.filter(c => 
      new Date(c.committedAt) >= cutoff
    );

    return recentCommits.length / days;
  }

  /**
   * Detect implementation patterns
   */
  detectPatterns(commits) {
    const patterns = {
      testDrivenDevelopment: false,
      frequentSmallCommits: false,
      featureBranching: false,
      documentationFirst: false
    };

    // TDD: Tests before implementation
    const testCommits = commits.filter(c => 
      c.filesChanged?.some(f => f.filename.includes('test'))
    );
    patterns.testDrivenDevelopment = testCommits.length / commits.length > 0.3;

    // Frequent small commits
    const avgChanges = commits.reduce((sum, c) => sum + (c.totalChanges || 0), 0) / commits.length;
    patterns.frequentSmallCommits = avgChanges < 200 && commits.length > 10;

    // Feature branching
    const branches = new Set(commits.map(c => c.branch).filter(Boolean));
    patterns.featureBranching = branches.size > 2;

    // Documentation first
    const docCommits = commits.filter(c =>
      c.filesChanged?.some(f => f.filename.includes('.md') || f.filename.includes('README'))
    );
    patterns.documentationFirst = docCommits.length > 0 && 
      commits.indexOf(docCommits[0]) < commits.length * 0.3;

    return patterns;
  }

  /**
   * Categorize commit by message
   */
  _categorizeCommit(message) {
    const msg = message.toLowerCase();

    if (/^feat|^feature|add|implement|create/i.test(msg)) return 'feature';
    if (/^fix|^bug|resolve|patch/i.test(msg)) return 'bugfix';
    if (/^refactor|^refact|restructure|reorganize/i.test(msg)) return 'refactor';
    if (/^test|^tests|testing/i.test(msg)) return 'test';
    if (/^docs|^doc|documentation|readme/i.test(msg)) return 'docs';
    if (/^style|^format|formatting|prettier|lint/i.test(msg)) return 'style';
    if (/^chore|^build|^ci|dependency|dependencies/i.test(msg)) return 'chore';

    return 'unknown';
  }

  /**
   * Extract keywords from commit message
   */
  _extractKeywords(message) {
    const keywords = [];
    const msg = message.toLowerCase();

    // Common feature keywords
    const featureKeywords = ['auth', 'login', 'signup', 'api', 'database', 'ui', 'frontend', 'backend', 'payment', 'notification'];
    featureKeywords.forEach(kw => {
      if (msg.includes(kw)) keywords.push(kw);
    });

    // Extract words from message (simple approach)
    const words = msg.match(/\b[a-z]{4,}\b/g) || [];
    const uniqueWords = [...new Set(words)].slice(0, 5);
    keywords.push(...uniqueWords);

    return [...new Set(keywords)].slice(0, 10);
  }

  /**
   * Detect completion indicators
   */
  _detectCompletionIndicators(commit) {
    const hasTests = commit.filesChanged?.some(f => 
      f.filename.includes('test') || f.filename.includes('spec')
    ) || false;

    const hasDocs = commit.filesChanged?.some(f =>
      f.filename.includes('README') || f.filename.includes('.md')
    ) || false;

    const isComplete = /complete|finish|done|ready/i.test(commit.message);

    return { hasTests, hasDocs, isComplete };
  }

  /**
   * Correlate commit with tasks using AI
   */
  async _correlateWithTasks(commit, tasks) {
    try {
      const prompt = `Analyze this commit and determine which task it relates to.

COMMIT:
Message: ${commit.message}
Files: ${commit.filesChanged?.map(f => f.filename).join(', ') || 'N/A'}

TASKS:
${tasks.map((t, i) => `${i + 1}. [${t.priority}] ${t.title} (Day ${t.day})`).join('\n')}

Return JSON only:
{
  "taskIndex": <number 1-${tasks.length} or null>,
  "confidence": <number 0-100>,
  "reason": "<brief explanation>",
  "alternatives": [{"taskIndex": <number>, "confidence": <number>}]
}`;

      const aiResult = await aiProvider.generateStructuredResponse(prompt, {
        taskIndex: 'number or null',
        confidence: 'number 0-100',
        reason: 'string',
        alternatives: 'array of {taskIndex: number, confidence: number}'
      }, {
        systemPrompt: 'You are a task correlation AI. Analyze commits and match them to tasks.',
        maxTokens: 300,
        temperature: 0.3
      });

      const result = aiResult.data;

      return {
        taskId: result.taskIndex ? tasks[result.taskIndex - 1]._id : null,
        confidence: result.confidence || 0,
        reason: result.reason || '',
        alternatives: (result.alternatives || []).map(alt => ({
          task: tasks[alt.taskIndex - 1]._id,
          confidence: alt.confidence,
          reason: result.reason
        }))
      };

    } catch (error) {
      console.error('[CommitAnalyzer] Correlation error:', error.message);
      return { taskId: null, confidence: 0, alternatives: [] };
    }
  }

  /**
   * Build insights prompt
   */
  _buildInsightsPrompt(commits, projectContext) {
    const recentCommits = commits.slice(0, 20);
    
    let prompt = `Analyze these recent commits and generate productivity insights.\n\n`;
    
    if (projectContext) {
      prompt += `PROJECT: ${projectContext.name}\n`;
      prompt += `GOAL: ${projectContext.goal}\n`;
      prompt += `DEADLINE: ${new Date(projectContext.deadline).toDateString()}\n\n`;
    }

    prompt += `RECENT COMMITS (${commits.length} total):\n`;
    recentCommits.forEach((c, i) => {
      prompt += `${i + 1}. [${new Date(c.committedAt).toLocaleDateString()}] ${c.message}\n`;
      if (c.filesChanged && c.filesChanged.length > 0) {
        prompt += `   Files: ${c.filesChanged.slice(0, 3).map(f => f.filename).join(', ')}\n`;
      }
    });

    prompt += `\nGenerate 3-5 specific insights about:\n`;
    prompt += `- Development velocity and patterns\n`;
    prompt += `- Feature completion progress\n`;
    prompt += `- Areas needing attention\n`;
    prompt += `- Productivity trends\n\n`;
    prompt += `Format: Return insights as numbered list.`;

    return prompt;
  }

  /**
   * Parse insights from AI response
   */
  _parseInsights(raw) {
    const lines = raw.split('\n').filter(line => line.trim());
    const insights = [];

    lines.forEach(line => {
      const match = line.match(/^\d+\.\s*(.+)$/);
      if (match) {
        insights.push(match[1].trim());
      }
    });

    return insights.slice(0, 5);
  }

  /**
   * Get default analysis
   */
  _getDefaultAnalysis() {
    return {
      category: 'unknown',
      keywords: [],
      completionIndicators: { hasTests: false, hasDocs: false, isComplete: false },
      inferredTask: null,
      confidence: 0,
      correlatedTasks: []
    };
  }
}

module.exports = new CommitAnalyzer();
