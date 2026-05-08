/**
 * PLATFORM INFERENCE SERVICE
 * 
 * Intelligently recommends platforms, tools, and workflows
 * based on task analysis and project context.
 */

class PlatformInferenceService {
  
  /**
   * Platform database with categories and metadata
   */
  getPlatformDatabase() {
    return {
      // Development Tools
      vscode: {
        id: 'vscode',
        name: 'VS Code',
        category: 'IDE',
        icon: '💻',
        description: 'Code editor for development',
        url: 'https://code.visualstudio.com',
        keywords: ['code', 'develop', 'programming', 'implement', 'build', 'create', 'write'],
        technologies: ['javascript', 'typescript', 'python', 'react', 'node', 'express', 'html', 'css']
      },
      github: {
        id: 'github',
        name: 'GitHub',
        category: 'Version Control',
        icon: '🐙',
        description: 'Version control and collaboration',
        url: 'https://github.com',
        keywords: ['git', 'version', 'commit', 'push', 'pull', 'repository', 'repo', 'branch'],
        technologies: ['git']
      },
      terminal: {
        id: 'terminal',
        name: 'Terminal',
        category: 'CLI',
        icon: '⚡',
        description: 'Command line interface',
        url: null,
        keywords: ['command', 'cli', 'shell', 'bash', 'script', 'install', 'setup', 'configure'],
        technologies: ['bash', 'shell', 'npm', 'yarn']
      },

      // Frontend Tools
      figma: {
        id: 'figma',
        name: 'Figma',
        category: 'Design',
        icon: '🎨',
        description: 'UI/UX design and prototyping',
        url: 'https://figma.com',
        keywords: ['design', 'ui', 'ux', 'prototype', 'mockup', 'wireframe', 'interface'],
        technologies: ['design', 'ui', 'ux']
      },
      chrome_devtools: {
        id: 'chrome_devtools',
        name: 'Chrome DevTools',
        category: 'Browser Tools',
        icon: '🔍',
        description: 'Browser debugging and testing',
        url: 'https://developer.chrome.com/docs/devtools',
        keywords: ['debug', 'inspect', 'console', 'browser', 'frontend', 'test'],
        technologies: ['html', 'css', 'javascript', 'react', 'vue', 'angular']
      },

      // Backend Tools
      postman: {
        id: 'postman',
        name: 'Postman',
        category: 'API Testing',
        icon: '📮',
        description: 'API development and testing',
        url: 'https://postman.com',
        keywords: ['api', 'rest', 'endpoint', 'request', 'response', 'test', 'backend'],
        technologies: ['api', 'rest', 'graphql', 'http']
      },
      thunder_client: {
        id: 'thunder_client',
        name: 'Thunder Client',
        category: 'API Testing',
        icon: '⚡',
        description: 'Lightweight API testing in VS Code',
        url: 'https://www.thunderclient.com',
        keywords: ['api', 'rest', 'test', 'endpoint'],
        technologies: ['api', 'rest']
      },

      // Database Tools
      mongodb_atlas: {
        id: 'mongodb_atlas',
        name: 'MongoDB Atlas',
        category: 'Database',
        icon: '🍃',
        description: 'Cloud MongoDB database',
        url: 'https://cloud.mongodb.com',
        keywords: ['database', 'mongodb', 'nosql', 'data', 'schema', 'collection'],
        technologies: ['mongodb', 'mongoose', 'database', 'nosql']
      },
      mongodb_compass: {
        id: 'mongodb_compass',
        name: 'MongoDB Compass',
        category: 'Database',
        icon: '🧭',
        description: 'MongoDB GUI client',
        url: 'https://www.mongodb.com/products/compass',
        keywords: ['database', 'mongodb', 'query', 'browse', 'data'],
        technologies: ['mongodb', 'database']
      },
      drawio: {
        id: 'drawio',
        name: 'Draw.io',
        category: 'Diagramming',
        icon: '📊',
        description: 'Database schema and diagrams',
        url: 'https://app.diagrams.net',
        keywords: ['diagram', 'schema', 'architecture', 'design', 'flowchart', 'erd'],
        technologies: ['design', 'architecture']
      },

      // Deployment Platforms
      aws: {
        id: 'aws',
        name: 'AWS',
        category: 'Cloud Platform',
        icon: '☁️',
        description: 'Amazon Web Services cloud',
        url: 'https://aws.amazon.com',
        keywords: ['deploy', 'cloud', 'hosting', 'server', 'production', 'aws', 'ec2', 's3'],
        technologies: ['cloud', 'deployment', 'hosting']
      },
      railway: {
        id: 'railway',
        name: 'Railway',
        category: 'Cloud Platform',
        icon: '🚂',
        description: 'Simple deployment platform',
        url: 'https://railway.app',
        keywords: ['deploy', 'hosting', 'cloud', 'production'],
        technologies: ['deployment', 'hosting']
      },
      render: {
        id: 'render',
        name: 'Render',
        category: 'Cloud Platform',
        icon: '🎯',
        description: 'Modern cloud platform',
        url: 'https://render.com',
        keywords: ['deploy', 'hosting', 'cloud', 'production'],
        technologies: ['deployment', 'hosting']
      },
      docker: {
        id: 'docker',
        name: 'Docker',
        category: 'Containerization',
        icon: '🐳',
        description: 'Container platform',
        url: 'https://docker.com',
        keywords: ['container', 'docker', 'deploy', 'devops', 'kubernetes'],
        technologies: ['docker', 'container', 'devops']
      },

      // IoT Tools
      arduino_ide: {
        id: 'arduino_ide',
        name: 'Arduino IDE',
        category: 'IoT Development',
        icon: '🔌',
        description: 'Arduino development environment',
        url: 'https://www.arduino.cc/en/software',
        keywords: ['arduino', 'iot', 'embedded', 'hardware', 'sensor', 'esp32', 'esp8266'],
        technologies: ['arduino', 'c++', 'embedded', 'iot']
      },
      platformio: {
        id: 'platformio',
        name: 'PlatformIO',
        category: 'IoT Development',
        icon: '⚙️',
        description: 'Professional IoT development',
        url: 'https://platformio.org',
        keywords: ['iot', 'embedded', 'esp32', 'arduino', 'hardware'],
        technologies: ['iot', 'embedded', 'arduino']
      },

      // AI/ML Tools
      ollama: {
        id: 'ollama',
        name: 'Ollama',
        category: 'AI/ML',
        icon: '🤖',
        description: 'Local AI models',
        url: 'https://ollama.com',
        keywords: ['ai', 'ml', 'machine learning', 'llm', 'model', 'ollama'],
        technologies: ['ai', 'ml', 'llm', 'python']
      },
      jupyter: {
        id: 'jupyter',
        name: 'Jupyter Notebook',
        category: 'AI/ML',
        icon: '📓',
        description: 'Interactive data science',
        url: 'https://jupyter.org',
        keywords: ['ai', 'ml', 'data science', 'python', 'notebook', 'analysis'],
        technologies: ['python', 'ai', 'ml', 'data']
      },
      colab: {
        id: 'colab',
        name: 'Google Colab',
        category: 'AI/ML',
        icon: '🔬',
        description: 'Cloud-based notebooks',
        url: 'https://colab.research.google.com',
        keywords: ['ai', 'ml', 'python', 'notebook', 'gpu', 'training'],
        technologies: ['python', 'ai', 'ml']
      },

      // Documentation Tools
      canva: {
        id: 'canva',
        name: 'Canva',
        category: 'Documentation',
        icon: '🎨',
        description: 'Visual documentation and design',
        url: 'https://canva.com',
        keywords: ['documentation', 'design', 'presentation', 'visual', 'graphics'],
        technologies: ['design', 'documentation']
      },
      google_docs: {
        id: 'google_docs',
        name: 'Google Docs',
        category: 'Documentation',
        icon: '📝',
        description: 'Collaborative documentation',
        url: 'https://docs.google.com',
        keywords: ['documentation', 'docs', 'write', 'document', 'readme'],
        technologies: ['documentation']
      },
      notion: {
        id: 'notion',
        name: 'Notion',
        category: 'Documentation',
        icon: '📚',
        description: 'All-in-one workspace',
        url: 'https://notion.so',
        keywords: ['documentation', 'notes', 'wiki', 'knowledge'],
        technologies: ['documentation']
      }
    };
  }

  /**
   * Infer recommended platforms for a task
   */
  async inferPlatforms(task, projectContext = {}) {
    const platforms = this.getPlatformDatabase();
    const recommendations = [];

    // Analyze task
    const taskText = `${task.title} ${task.description || ''}`.toLowerCase();
    const detectedTechnologies = projectContext.technologies || [];
    const projectType = projectContext.type || '';

    // Score each platform
    for (const [key, platform] of Object.entries(platforms)) {
      let score = 0;

      // Keyword matching
      platform.keywords.forEach(keyword => {
        if (taskText.includes(keyword)) {
          score += 10;
        }
      });

      // Technology matching
      platform.technologies.forEach(tech => {
        if (detectedTechnologies.some(dt => dt.toLowerCase().includes(tech))) {
          score += 15;
        }
        if (taskText.includes(tech)) {
          score += 10;
        }
      });

      // Category-based scoring
      if (task.category) {
        const category = task.category.toLowerCase();
        if (platform.category.toLowerCase().includes(category)) {
          score += 20;
        }
      }

      // Priority boost for essential tools
      if (['vscode', 'github', 'terminal'].includes(platform.id)) {
        score += 5;
      }

      if (score > 0) {
        recommendations.push({
          ...platform,
          score,
          relevance: this._calculateRelevance(score)
        });
      }
    }

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ score, ...platform }) => platform);
  }

  /**
   * Calculate relevance level
   */
  _calculateRelevance(score) {
    if (score >= 30) return 'high';
    if (score >= 15) return 'medium';
    return 'low';
  }

  /**
   * Get execution workflow for task
   */
  async generateExecutionWorkflow(task, platforms) {
    const steps = [];

    // Analyze task type and generate workflow
    const taskText = `${task.title} ${task.description || ''}`.toLowerCase();

    // Setup phase
    if (taskText.includes('setup') || taskText.includes('install') || taskText.includes('configure')) {
      steps.push({
        phase: 'Setup',
        order: 1,
        actions: [
          'Open Terminal',
          'Install required dependencies',
          'Configure environment variables',
          'Verify installation'
        ]
      });
    }

    // Development phase
    if (taskText.includes('develop') || taskText.includes('implement') || taskText.includes('build') || taskText.includes('create')) {
      steps.push({
        phase: 'Development',
        order: 2,
        actions: [
          'Open VS Code',
          'Create/modify files',
          'Write code implementation',
          'Test locally'
        ]
      });
    }

    // Testing phase
    if (taskText.includes('test') || taskText.includes('debug') || taskText.includes('api')) {
      steps.push({
        phase: 'Testing',
        order: 3,
        actions: [
          'Open testing tools (Postman/DevTools)',
          'Run test cases',
          'Debug issues',
          'Verify functionality'
        ]
      });
    }

    // Deployment phase
    if (taskText.includes('deploy') || taskText.includes('production') || taskText.includes('hosting')) {
      steps.push({
        phase: 'Deployment',
        order: 4,
        actions: [
          'Commit changes to GitHub',
          'Configure deployment platform',
          'Deploy to production',
          'Verify deployment'
        ]
      });
    }

    // Documentation phase
    if (taskText.includes('document') || taskText.includes('readme') || taskText.includes('docs')) {
      steps.push({
        phase: 'Documentation',
        order: 5,
        actions: [
          'Open documentation tool',
          'Write documentation',
          'Add examples and screenshots',
          'Review and publish'
        ]
      });
    }

    // Default workflow if no specific phases detected
    if (steps.length === 0) {
      steps.push({
        phase: 'Execution',
        order: 1,
        actions: [
          'Open required tools',
          'Complete task requirements',
          'Test and verify',
          'Mark as complete'
        ]
      });
    }

    return steps.sort((a, b) => a.order - b.order);
  }

  /**
   * Detect blockers and dependencies
   */
  async detectBlockers(task, allTasks = []) {
    const blockers = [];
    const warnings = [];

    // Check dependencies
    if (task.dependencies && task.dependencies.length > 0) {
      const incompleteDeps = allTasks.filter(t => 
        task.dependencies.includes(t._id.toString()) && t.status !== 'done'
      );

      if (incompleteDeps.length > 0) {
        blockers.push({
          type: 'dependency',
          severity: 'high',
          message: `${incompleteDeps.length} dependent task(s) must be completed first`,
          tasks: incompleteDeps.map(t => ({ id: t._id, title: t.title }))
        });
      }
    }

    // Check for setup requirements
    const taskText = `${task.title} ${task.description || ''}`.toLowerCase();
    
    if (taskText.includes('frontend') && !allTasks.some(t => 
      t.status === 'done' && t.title.toLowerCase().includes('backend')
    )) {
      warnings.push({
        type: 'sequence',
        severity: 'medium',
        message: 'Consider completing backend API before frontend integration'
      });
    }

    if (taskText.includes('deploy') && !allTasks.some(t =>
      t.status === 'done' && t.title.toLowerCase().includes('test')
    )) {
      warnings.push({
        type: 'quality',
        severity: 'medium',
        message: 'Recommended to complete testing before deployment'
      });
    }

    return { blockers, warnings };
  }

}

module.exports = new PlatformInferenceService();
