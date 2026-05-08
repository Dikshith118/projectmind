const Groq = require('groq-sdk');

/**
 * GROQ AI PROVIDER
 * 
 * Handles all Groq API interactions with unified interface
 */
class GroqProvider {
  constructor() {
    this.name = 'groq';
    this.client = null;
    this.model = 'llama-3.3-70b-versatile';
    this.isAvailable = false;
  }

  /**
   * Initialize provider
   */
  async initialize() {
    try {
      const apiKey = process.env.GROQ_API_KEY;
      
      if (!apiKey) {
        console.log('[GroqProvider] No API key found - provider disabled');
        this.isAvailable = false;
        return false;
      }

      this.client = new Groq({ apiKey });
      this.isAvailable = true;
      console.log('[GroqProvider] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[GroqProvider] Initialization failed:', error.message);
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Check if provider is available
   */
  async healthCheck() {
    if (!this.client) {
      return { healthy: false, error: 'Not initialized' };
    }

    try {
      // Simple test request
      const startTime = Date.now();
      await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      });
      const responseTime = Date.now() - startTime;

      return {
        healthy: true,
        responseTime,
        model: this.model
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  /**
   * Generate text response
   */
  async generateText(prompt, options = {}) {
    if (!this.isAvailable || !this.client) {
      throw new Error('Groq provider not available');
    }

    const startTime = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: options.model || this.model,
        messages: [
          {
            role: 'system',
            content: options.systemPrompt || 'You are a helpful AI assistant.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.5
      });

      const responseTime = Date.now() - startTime;
      const text = response.choices[0].message.content.trim();

      return {
        text,
        provider: this.name,
        model: options.model || this.model,
        responseTime,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      console.error('[GroqProvider] Generate text error:', error.message);
      throw error;
    }
  }

  /**
   * Generate structured JSON response
   */
  async generateStructuredResponse(prompt, schema, options = {}) {
    if (!this.isAvailable || !this.client) {
      throw new Error('Groq provider not available');
    }

    const startTime = Date.now();

    try {
      const systemPrompt = options.systemPrompt || 'You are a helpful AI assistant.';
      const jsonInstruction = `\n\nReturn ONLY valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}\n\nNo markdown. No explanation. JSON only.`;

      const response = await this.client.chat.completions.create({
        model: options.model || this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt + jsonInstruction
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.3
      });

      const responseTime = Date.now() - startTime;
      const raw = response.choices[0].message.content.trim();
      
      // Clean markdown code blocks if present
      const clean = raw.replace(/```json|```/g, '').trim();
      const data = JSON.parse(clean);

      return {
        data,
        provider: this.name,
        model: options.model || this.model,
        responseTime,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      console.error('[GroqProvider] Generate structured response error:', error.message);
      throw error;
    }
  }

  /**
   * Get provider info
   */
  getInfo() {
    return {
      name: this.name,
      displayName: 'Groq',
      model: this.model,
      isAvailable: this.isAvailable,
      type: 'cloud',
      features: ['text', 'structured', 'fast']
    };
  }
}

module.exports = GroqProvider;
