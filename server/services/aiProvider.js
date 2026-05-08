const GroqProvider = require('./providers/GroqProvider');
const OllamaProvider = require('./providers/OllamaProvider');

/**
 * UNIFIED AI PROVIDER
 * 
 * Central AI orchestration layer that manages multiple AI providers
 * with intelligent fallback and provider switching.
 * 
 * Supports:
 * - Groq (cloud, fast)
 * - Ollama (local, private)
 * 
 * Features:
 * - Automatic provider selection
 * - Intelligent fallback
 * - Performance logging
 * - Health monitoring
 */
class AIProvider {
  constructor() {
    this.providers = {
      groq: new GroqProvider(),
      ollama: new OllamaProvider()
    };

    this.activeProvider = null;
    this.fallbackEnabled = true;
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      fallbackActivations: 0,
      providerUsage: {
        groq: 0,
        ollama: 0
      }
    };
  }

  /**
   * Initialize all providers
   */
  async initialize() {
    console.log('[AIProvider] Initializing AI provider system...');

    // Initialize all providers
    const initResults = await Promise.all([
      this.providers.groq.initialize(),
      this.providers.ollama.initialize()
    ]);

    // Determine active provider from environment
    const preferredProvider = process.env.AI_PROVIDER || 'groq';
    
    if (preferredProvider === 'ollama' && this.providers.ollama.isAvailable) {
      this.activeProvider = 'ollama';
      console.log('[AIProvider] ✓ Active provider: Ollama (local)');
    } else if (this.providers.groq.isAvailable) {
      this.activeProvider = 'groq';
      console.log('[AIProvider] ✓ Active provider: Groq (cloud)');
    } else if (this.providers.ollama.isAvailable) {
      this.activeProvider = 'ollama';
      console.log('[AIProvider] ✓ Active provider: Ollama (fallback)');
    } else {
      console.error('[AIProvider] ✗ No AI providers available!');
      this.activeProvider = null;
    }

    // Log available providers
    const available = Object.entries(this.providers)
      .filter(([_, p]) => p.isAvailable)
      .map(([name]) => name);
    
    console.log('[AIProvider] Available providers:', available.join(', ') || 'none');
    console.log('[AIProvider] Fallback enabled:', this.fallbackEnabled);

    return this.activeProvider !== null;
  }

  /**
   * Generate text response with automatic fallback
   */
  async generateText(prompt, options = {}) {
    this.stats.totalRequests++;

    if (!this.activeProvider) {
      throw new Error('No AI providers available');
    }

    const startTime = Date.now();
    let lastError = null;

    // Try active provider first
    try {
      console.log(`[AIProvider] Using ${this.activeProvider} provider`);
      
      const provider = this.providers[this.activeProvider];
      const result = await provider.generateText(prompt, options);
      
      this.stats.successfulRequests++;
      this.stats.providerUsage[this.activeProvider]++;
      
      const totalTime = Date.now() - startTime;
      console.log(`[AIProvider] ✓ ${this.activeProvider} response in ${totalTime}ms`);
      
      return result;
    } catch (error) {
      console.error(`[AIProvider] ✗ ${this.activeProvider} failed:`, error.message);
      lastError = error;
    }

    // Try fallback if enabled
    if (this.fallbackEnabled) {
      const fallbackProvider = this._getFallbackProvider();
      
      if (fallbackProvider && this.providers[fallbackProvider].isAvailable) {
        try {
          console.log(`[AIProvider] 🔄 Falling back to ${fallbackProvider}`);
          this.stats.fallbackActivations++;
          
          const provider = this.providers[fallbackProvider];
          const result = await provider.generateText(prompt, options);
          
          this.stats.successfulRequests++;
          this.stats.providerUsage[fallbackProvider]++;
          
          const totalTime = Date.now() - startTime;
          console.log(`[AIProvider] ✓ ${fallbackProvider} fallback response in ${totalTime}ms`);
          
          return result;
        } catch (fallbackError) {
          console.error(`[AIProvider] ✗ ${fallbackProvider} fallback failed:`, fallbackError.message);
          lastError = fallbackError;
        }
      }
    }

    // All providers failed
    this.stats.failedRequests++;
    throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
  }

  /**
   * Generate structured JSON response with automatic fallback
   */
  async generateStructuredResponse(prompt, schema, options = {}) {
    this.stats.totalRequests++;

    if (!this.activeProvider) {
      throw new Error('No AI providers available');
    }

    const startTime = Date.now();
    let lastError = null;

    // Try active provider first
    try {
      console.log(`[AIProvider] Using ${this.activeProvider} provider (structured)`);
      
      const provider = this.providers[this.activeProvider];
      const result = await provider.generateStructuredResponse(prompt, schema, options);
      
      this.stats.successfulRequests++;
      this.stats.providerUsage[this.activeProvider]++;
      
      const totalTime = Date.now() - startTime;
      console.log(`[AIProvider] ✓ ${this.activeProvider} structured response in ${totalTime}ms`);
      
      return result;
    } catch (error) {
      console.error(`[AIProvider] ✗ ${this.activeProvider} failed:`, error.message);
      lastError = error;
    }

    // Try fallback if enabled
    if (this.fallbackEnabled) {
      const fallbackProvider = this._getFallbackProvider();
      
      if (fallbackProvider && this.providers[fallbackProvider].isAvailable) {
        try {
          console.log(`[AIProvider] 🔄 Falling back to ${fallbackProvider} (structured)`);
          this.stats.fallbackActivations++;
          
          const provider = this.providers[fallbackProvider];
          const result = await provider.generateStructuredResponse(prompt, schema, options);
          
          this.stats.successfulRequests++;
          this.stats.providerUsage[fallbackProvider]++;
          
          const totalTime = Date.now() - startTime;
          console.log(`[AIProvider] ✓ ${fallbackProvider} fallback structured response in ${totalTime}ms`);
          
          return result;
        } catch (fallbackError) {
          console.error(`[AIProvider] ✗ ${fallbackProvider} fallback failed:`, fallbackError.message);
          lastError = fallbackError;
        }
      }
    }

    // All providers failed
    this.stats.failedRequests++;
    throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
  }

  /**
   * Get fallback provider
   */
  _getFallbackProvider() {
    if (this.activeProvider === 'groq') {
      return 'ollama';
    } else if (this.activeProvider === 'ollama') {
      return 'groq';
    }
    return null;
  }

  /**
   * Get provider status
   */
  async getStatus() {
    const healthChecks = await Promise.all([
      this.providers.groq.healthCheck().catch(e => ({ healthy: false, error: e.message })),
      this.providers.ollama.healthCheck().catch(e => ({ healthy: false, error: e.message }))
    ]);

    return {
      activeProvider: this.activeProvider,
      fallbackEnabled: this.fallbackEnabled,
      providers: {
        groq: {
          ...this.providers.groq.getInfo(),
          health: healthChecks[0]
        },
        ollama: {
          ...this.providers.ollama.getInfo(),
          health: healthChecks[1]
        }
      },
      stats: this.stats
    };
  }

  /**
   * Switch active provider
   */
  async switchProvider(providerName) {
    if (!this.providers[providerName]) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    if (!this.providers[providerName].isAvailable) {
      throw new Error(`Provider ${providerName} is not available`);
    }

    this.activeProvider = providerName;
    console.log(`[AIProvider] Switched to ${providerName} provider`);
    
    return this.getStatus();
  }

  /**
   * Enable/disable fallback
   */
  setFallbackEnabled(enabled) {
    this.fallbackEnabled = enabled;
    console.log(`[AIProvider] Fallback ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalRequests > 0 
        ? ((this.stats.successfulRequests / this.stats.totalRequests) * 100).toFixed(2) + '%'
        : '0%',
      fallbackRate: this.stats.totalRequests > 0
        ? ((this.stats.fallbackActivations / this.stats.totalRequests) * 100).toFixed(2) + '%'
        : '0%'
    };
  }
}

// Export singleton instance
module.exports = new AIProvider();
