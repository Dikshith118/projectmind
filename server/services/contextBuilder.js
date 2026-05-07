/**
 * Intelligently preprocess and structure document context for AI planning
 * @param {string} extractedText - Raw text extracted from document
 * @returns {Object} - Structured context object
 */
function buildIntelligentContext(extractedText) {
  if (!extractedText || extractedText.trim().length === 0) {
    return {
      summary: '',
      detectedTechnologies: [],
      detectedFeatures: [],
      architectureNotes: '',
      apiRequirements: '',
      deploymentNotes: ''
    };
  }

  const text = extractedText.toLowerCase();
  const lines = extractedText.split('\n').filter(line => line.trim().length > 0);

  // Detect technologies
  const techKeywords = {
    frontend: ['react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'tailwind', 'bootstrap', 'css', 'html', 'javascript', 'typescript'],
    backend: ['node.js', 'express', 'fastify', 'nest.js', 'django', 'flask', 'spring', 'laravel', 'rails', 'asp.net'],
    database: ['mongodb', 'postgresql', 'mysql', 'redis', 'sqlite', 'dynamodb', 'firebase', 'supabase'],
    cloud: ['aws', 'azure', 'gcp', 'heroku', 'vercel', 'netlify', 'digitalocean'],
    auth: ['jwt', 'oauth', 'auth0', 'passport', 'firebase auth', 'cognito'],
    testing: ['jest', 'mocha', 'cypress', 'playwright', 'vitest', 'testing library'],
    devops: ['docker', 'kubernetes', 'ci/cd', 'github actions', 'jenkins', 'gitlab ci']
  };

  const detectedTechnologies = [];
  for (const [category, keywords] of Object.entries(techKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        detectedTechnologies.push({ category, tech: keyword });
      }
    }
  }

  // Detect features
  const featureKeywords = [
    'authentication', 'authorization', 'login', 'signup', 'dashboard',
    'api', 'rest api', 'graphql', 'websocket', 'real-time',
    'payment', 'stripe', 'checkout', 'subscription',
    'email', 'notification', 'messaging', 'chat',
    'search', 'filter', 'pagination', 'crud',
    'admin panel', 'user management', 'role-based',
    'file upload', 'image processing', 'video',
    'analytics', 'reporting', 'charts', 'dashboard'
  ];

  const detectedFeatures = featureKeywords.filter(keyword => text.includes(keyword));

  // Extract architecture-related sections
  const architectureLines = lines.filter(line => {
    const lower = line.toLowerCase();
    return lower.includes('architecture') || 
           lower.includes('design') || 
           lower.includes('structure') ||
           lower.includes('component') ||
           lower.includes('module');
  });

  // Extract API-related sections
  const apiLines = lines.filter(line => {
    const lower = line.toLowerCase();
    return lower.includes('api') || 
           lower.includes('endpoint') || 
           lower.includes('route') ||
           lower.includes('request') ||
           lower.includes('response');
  });

  // Extract deployment-related sections
  const deploymentLines = lines.filter(line => {
    const lower = line.toLowerCase();
    return lower.includes('deploy') || 
           lower.includes('hosting') || 
           lower.includes('server') ||
           lower.includes('production') ||
           lower.includes('environment');
  });

  // Create intelligent summary (first 500 chars of meaningful content)
  const meaningfulLines = lines.filter(line => {
    const lower = line.toLowerCase();
    return !lower.includes('page') && 
           !lower.includes('slide') && 
           line.length > 20;
  });

  const summary = meaningfulLines.slice(0, 10).join(' ').substring(0, 500);

  return {
    summary: summary || extractedText.substring(0, 500),
    detectedTechnologies: [...new Set(detectedTechnologies)],
    detectedFeatures: [...new Set(detectedFeatures)],
    architectureNotes: architectureLines.slice(0, 5).join('\n'),
    apiRequirements: apiLines.slice(0, 5).join('\n'),
    deploymentNotes: deploymentLines.slice(0, 3).join('\n'),
    hasContent: extractedText.trim().length > 0
  };
}

/**
 * Combine project brief and document context into AI-ready prompt context
 * @param {string} projectBrief - User's project description
 * @param {Object} documentContext - Structured context from uploaded documents
 * @returns {string} - Combined context for AI
 */
function combineContextForAI(projectBrief, documentContext) {
  if (!documentContext || !documentContext.hasContent) {
    return projectBrief;
  }

  let combinedContext = `PROJECT BRIEF:\n${projectBrief}\n\n`;

  if (documentContext.summary) {
    combinedContext += `DOCUMENT SUMMARY:\n${documentContext.summary}\n\n`;
  }

  if (documentContext.detectedTechnologies.length > 0) {
    const techByCategory = {};
    documentContext.detectedTechnologies.forEach(({ category, tech }) => {
      if (!techByCategory[category]) techByCategory[category] = [];
      techByCategory[category].push(tech);
    });

    combinedContext += `DETECTED TECHNOLOGIES:\n`;
    for (const [category, techs] of Object.entries(techByCategory)) {
      combinedContext += `- ${category}: ${techs.join(', ')}\n`;
    }
    combinedContext += '\n';
  }

  if (documentContext.detectedFeatures.length > 0) {
    combinedContext += `REQUIRED FEATURES:\n${documentContext.detectedFeatures.map(f => `- ${f}`).join('\n')}\n\n`;
  }

  if (documentContext.architectureNotes) {
    combinedContext += `ARCHITECTURE NOTES:\n${documentContext.architectureNotes}\n\n`;
  }

  if (documentContext.apiRequirements) {
    combinedContext += `API REQUIREMENTS:\n${documentContext.apiRequirements}\n\n`;
  }

  if (documentContext.deploymentNotes) {
    combinedContext += `DEPLOYMENT NOTES:\n${documentContext.deploymentNotes}\n\n`;
  }

  return combinedContext;
}

module.exports = {
  buildIntelligentContext,
  combineContextForAI
};
