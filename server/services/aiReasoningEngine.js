const aiProvider = require('./aiProvider');
const aiContextEngine = require('./aiContextEngine');

/**
 * UNIFIED AI REASONING ENGINE
 * 
 * Central AI reasoning layer that provides consistent, context-aware
 * AI responses across ALL modules in the platform.
 * 
 * All AI features use this engine for unified intelligence.
 */
class AIReasoningEngine {
  
  /**
   * Generate AI response with unified context
   * @param {string} projectId - Project ID
   * @param {string} module - Module name (copilot, demo, focus, planning, etc.)
   * @param {string} userQuery - User's question or request
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - AI response
   */
  async reason(projectId, module, userQuery, options = {}) {
    try {
      // Build unified context
      const unifiedContext = await aiContextEngine.buildUnifiedContext(projectId, {
        includeActivity: true,
        includeProductivity: true,
        includeTaskCorrelation: true,
        includeFocusSessions: true,
        includeDocuments: true,
        days: options.days || 7
      });

      // Generate prompt context
      const contextPrompt = aiContextEngine.generatePromptContext(unifiedContext);

      // Get module-specific system prompt
      const systemPrompt = this._getModuleSystemPrompt(module, unifiedContext);

      // Combine context + system prompt
      const fullSystemPrompt = `${systemPrompt}\n\n${contextPrompt}`;

      // Call unified AI provider (Groq or Ollama with fallback)
      const result = await aiProvider.generateText(userQuery, {
        systemPrompt: fullSystemPrompt,
        maxTokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.5
      });

      return {
        response: result.text,
        context: unifiedContext,
        module,
        provider: result.provider,
        model: result.model,
        responseTime: result.responseTime,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('[AIReasoningEngine] Error:', error.message);
      throw error;
    }
  }

  /**
   * Generate structured AI response (JSON)
   * @param {string} projectId - Project ID
   * @param {string} module - Module name
   * @param {string} userQuery - User's request
   * @param {Object} schema - Expected JSON schema
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Parsed JSON response
   */
  async reasonStructured(projectId, module, userQuery, schema, options = {}) {
    try {
      // Build unified context
      const unifiedContext = await aiContextEngine.buildUnifiedContext(projectId, {
        includeActivity: true,
        includeProductivity: true,
        includeTaskCorrelation: true,
        includeFocusSessions: true,
        includeDocuments: true,
        days: options.days || 7
      });

      // Generate prompt context
      const contextPrompt = aiContextEngine.generatePromptContext(unifiedContext);

      // Get module-specific system prompt
      const systemPrompt = this._getModuleSystemPrompt(module, unifiedContext);

      // Add JSON instruction
      const jsonInstruction = `\n\nReturn ONLY valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}\n\nNo markdown. No explanation. JSON only.`;

      // Combine
      const fullSystemPrompt = `${systemPrompt}\n\n${contextPrompt}`;

      // Call unified AI provider (Groq or Ollama with fallback)
      const result = await aiProvider.generateStructuredResponse(userQuery, schema, {
        systemPrompt: fullSystemPrompt,
        maxTokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.3
      });

      return {
        data: result.data,
        context: unifiedContext,
        module,
        provider: result.provider,
        model: result.model,
        responseTime: result.responseTime,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('[AIReasoningEngine] Structured reasoning error:', error.message);
      throw error;
    }
  }

  /**
   * Get module-specific system prompt
   */
  _getModuleSystemPrompt(module, context) {
    const basePrompt = `You are ProjectMind AI, an intelligent project management assistant with complete awareness of the project's state, progress, risks, and productivity patterns.`;

    const modulePrompts = {
      copilot: `${basePrompt}

You are the AI Copilot - a conversational assistant that helps users understand their project status and make decisions.

YOUR ROLE:
- Answer questions about project status, tasks, and progress
- Provide specific, data-driven insights
- Reference actual task names, numbers, and metrics
- Be concise (2-3 sentences max)
- Never give generic advice - always use real project data

AWARENESS:
- You know the current project status, timeline, and risks
- You're aware of recent activity and productivity patterns
- You understand which tasks are done, pending, or stalled
- You can see focus sessions and work patterns`,

      demo: `${basePrompt}

You are the Demo Generator - creating professional project presentations and summaries.

YOUR ROLE:
- Generate comprehensive demo content based on actual project data
- Highlight completed features and real accomplishments
- Infer tech stack from activity and task descriptions
- Create realistic problem statements aligned with project goals
- Suggest future scope based on pending tasks

AWARENESS:
- You know exactly what features are completed vs pending
- You understand the project's actual progress and timeline
- You can see which technologies are being used
- You're aware of the project's current state and risks`,

      focus: `${basePrompt}

You are the Deep Focus Mode AI - helping users prioritize and execute tasks effectively.

YOUR ROLE:
- Recommend the next best action based on priorities and risks
- Analyze task dependencies and optimal sequencing
- Consider productivity patterns and focus session history
- Provide clear, actionable recommendations
- Factor in deadlines and capacity constraints

AWARENESS:
- You know which tasks are most urgent and important
- You understand the user's productivity patterns
- You can see recent activity and focus sessions
- You're aware of project risks and time constraints`,

      planning: `${basePrompt}

You are the Intelligent Planner - creating realistic, data-driven project schedules.

YOUR ROLE:
- Generate comprehensive task breakdowns
- Create realistic time estimates
- Map tasks to file paths for activity tracking
- Identify dependencies and milestones
- Consider detected technologies and features

AWARENESS:
- You know the project's deadline and available hours
- You understand detected technologies from documents
- You can see required features and architecture notes
- You're aware of the project's complexity and scope`,

      recovery: `${basePrompt}

You are the Recovery Plan Specialist - helping projects get back on track.

YOUR ROLE:
- Analyze delays and identify root causes
- Create actionable recovery plans
- Recommend tasks to prioritize or deprioritize
- Estimate recovery timelines
- Provide realistic, achievable strategies

AWARENESS:
- You know exactly how far behind the project is
- You understand which tasks are critical vs optional
- You can see productivity patterns and bottlenecks
- You're aware of remaining capacity and constraints`,

      insights: `${basePrompt}

You are the Productivity Insights Generator - analyzing patterns and providing recommendations.

YOUR ROLE:
- Generate 3-5 specific, actionable insights
- Identify productivity patterns and trends
- Highlight stalled tasks and bottlenecks
- Provide encouraging but honest feedback
- Suggest concrete improvements

AWARENESS:
- You know the user's productivity scores and trends
- You understand focus session patterns
- You can see which tasks are progressing vs stalled
- You're aware of activity patterns and work habits`
    };

    return modulePrompts[module] || basePrompt;
  }

  /**
   * Quick reasoning for simple queries (no full context)
   * @param {string} module - Module name
   * @param {string} query - User query
   * @param {Object} minimalContext - Minimal context object
   * @returns {Promise<string>} - AI response
   */
  async quickReason(module, query, minimalContext) {
    try {
      const systemPrompt = this._getModuleSystemPrompt(module, {});
      
      const contextStr = `QUICK CONTEXT:\n${JSON.stringify(minimalContext, null, 2)}`;

      const result = await aiProvider.generateText(query, {
        systemPrompt: `${systemPrompt}\n\n${contextStr}`,
        maxTokens: 300,
        temperature: 0.5
      });

      return result.text;

    } catch (error) {
      console.error('[AIReasoningEngine] Quick reasoning error:', error.message);
      throw error;
    }
  }

  /**
   * Batch reasoning for multiple queries
   * @param {string} projectId - Project ID
   * @param {Array} queries - Array of {module, query} objects
   * @returns {Promise<Array>} - Array of responses
   */
  async batchReason(projectId, queries) {
    // Build context once
    const unifiedContext = await aiContextEngine.buildUnifiedContext(projectId);
    const contextPrompt = aiContextEngine.generatePromptContext(unifiedContext);

    const promises = queries.map(async ({ module, query, options = {} }) => {
      try {
        const systemPrompt = this._getModuleSystemPrompt(module, unifiedContext);
        const fullSystemPrompt = `${systemPrompt}\n\n${contextPrompt}`;

        const result = await aiProvider.generateText(query, {
          systemPrompt: fullSystemPrompt,
          maxTokens: options.maxTokens || 500,
          temperature: options.temperature || 0.5
        });

        return {
          module,
          query,
          response: result.text,
          provider: result.provider,
          success: true
        };
      } catch (error) {
        return {
          module,
          query,
          error: error.message,
          success: false
        };
      }
    });

    return Promise.all(promises);
  }
}

module.exports = new AIReasoningEngine();
