const axios = require('axios');

/**
 * OLLAMA AI PROVIDER
 * 
 * Handles all Ollama local model interactions with unified interface
 */
class OllamaProvider {
  constructor() {
    this.name = 'ollama';
    this.baseUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3';
    this.isAvailable = false;
  }

  /**
   * Initialize provider
   */
  async initialize() {
    try {
      // Check if Ollama is running
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 3000
      });

      // Check if our model is available
      const models = response.data.models || [];
      const modelExists = models.some(m => m.name.includes(this.model));

      if (!modelExists) {
        console.log(`[OllamaProvider] Model ${this.model} not found. Available models:`, models.map(m => m.name));
        console.log(`[OllamaProvider] Run: ollama pull ${this.model}`);
        this.isAvailable = false;
        return false;
      }

      this.isAvailable = true;
      console.log(`[OllamaProvider] Initialized successfully with model: ${this.model}`);
      return true;
    } catch (error) {
      console.log('[OllamaProvider] Not available:', error.message);
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Check if provider is available
   */
  async healthCheck() {
    try {
      const startTime = Date.now();
      
      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: this.model,
          prompt: 'test',
          stream: false
        },
        { timeout: 5000 }
      );

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
    if (!this.isAvailable) {
      throw new Error('Ollama provider not available');
    }

    const startTime = Date.now();

    try {
      const systemPrompt = options.systemPrompt || 'You are a helpful AI assistant.';
      const fullPrompt = `${systemPrompt}\n\n${prompt}`;

      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: options.model || this.model,
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.5,
            num_predict: options.maxTokens || 1000
          }
        },
        { timeout: 60000 } // 60 second timeout for local inference
      );

      const responseTime = Date.now() - startTime;
      const text = response.data.response.trim();

      return {
        text,
        provider: this.name,
        model: options.model || this.model,
        responseTime,
        usage: {
          promptTokens: response.data.prompt_eval_count || 0,
          completionTokens: response.data.eval_count || 0,
          totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0)
        }
      };
    } catch (error) {
      console.error('[OllamaProvider] Generate text error:', error.message);
      throw error;
    }
  }

  /**
   * Generate structured JSON response
   */
  async generateStructuredResponse(prompt, schema, options = {}) {
    if (!this.isAvailable) {
      throw new Error('Ollama provider not available');
    }

    const startTime = Date.now();

    try {
      const systemPrompt = options.systemPrompt || 'You are a helpful AI assistant.';
      const jsonInstruction = `\n\nReturn ONLY valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}\n\nNo markdown. No explanation. JSON only.`;
      const fullPrompt = `${systemPrompt}${jsonInstruction}\n\n${prompt}`;

      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: options.model || this.model,
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.3,
            num_predict: options.maxTokens || 2000
          }
        },
        { timeout: 60000 }
      );

      const responseTime = Date.now() - startTime;
      const raw = response.data.response.trim();
      
      // Clean markdown code blocks if present
      const clean = raw.replace(/```json|```/g, '').trim();
      const data = JSON.parse(clean);

      return {
        data,
        provider: this.name,
        model: options.model || this.model,
        responseTime,
        usage: {
          promptTokens: response.data.prompt_eval_count || 0,
          completionTokens: response.data.eval_count || 0,
          totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0)
        }
      };
    } catch (error) {
      console.error('[OllamaProvider] Generate structured response error:', error.message);
      throw error;
    }
  }

  /**
   * Get provider info
   */
  getInfo() {
    return {
      name: this.name,
      displayName: 'Ollama (Local)',
      model: this.model,
      isAvailable: this.isAvailable,
      type: 'local',
      features: ['text', 'structured', 'private', 'offline']
    };
  }
}

module.exports = OllamaProvider;
