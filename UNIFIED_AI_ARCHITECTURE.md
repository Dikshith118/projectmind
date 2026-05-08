# Unified AI Intelligence System - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROJECTMIND AI PLATFORM                       │
│                  (ONE Intelligent AI System)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   UNIFIED AI CONTEXT ENGINE                      │
│                  (Central Intelligence Layer)                    │
│                                                                   │
│  Builds comprehensive project context from:                      │
│  • Project data (MongoDB)                                        │
│  • Task intelligence (Task model)                                │
│  • Activity logs (ActivityLog model)                             │
│  • Productivity metrics (activityAnalyzer)                       │
│  • Task correlation (taskCorrelationEngine)                      │
│  • Focus sessions (activityAnalyzer)                             │
│  • Document context (uploaded files)                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  UNIFIED AI REASONING ENGINE                     │
│                   (Central AI Brain)                             │
│                                                                   │
│  Provides consistent AI reasoning across all modules:            │
│  • Natural language responses                                    │
│  • Structured JSON outputs                                       │
│  • Module-specific system prompts                                │
│  • Batch reasoning                                               │
│  • Groq AI integration (llama-3.3-70b-versatile)                │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│    AI COPILOT MODULE      │   │  DEMO GENERATOR MODULE    │
│                           │   │                           │
│  • Context-aware chat     │   │  • Data-driven demos      │
│  • Quick suggestions      │   │  • Accurate features      │
│  • Specific insights      │   │  • Real tech stack        │
└───────────────────────────┘   └───────────────────────────┘
                │                           │
                ▼                           ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│   DEEP FOCUS MODE         │   │   AI PLANNING MODULE      │
│                           │   │                           │
│  • Smart recommendations  │   │  • Intelligent schedules  │
│  • Priority analysis      │   │  • Realistic estimates    │
│  • Next best action       │   │  • File path mapping      │
└───────────────────────────┘   └───────────────────────────┘
                │                           │
                ▼                           ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│  PRODUCTIVITY INSIGHTS    │   │   RECOVERY PLANNER        │
│                           │   │                           │
│  • Pattern analysis       │   │  • Delay analysis         │
│  • Actionable feedback    │   │  • Action plans           │
│  • Trend detection        │   │  • Priority adjustments   │
└───────────────────────────┘   └───────────────────────────┘
```

## Data Flow

### 1. Context Building Flow

```
User Request
    │
    ▼
API Endpoint (with auth)
    │
    ▼
AI Context Middleware (optional)
    │
    ├─► MongoDB Queries
    │   ├─► Project.findById()
    │   ├─► Task.find()
    │   ├─► ActivityLog.find()
    │   └─► TaskMapping.find()
    │
    ├─► Activity Analysis
    │   ├─► activityAnalyzer.detectFocusSessions()
    │   ├─► activityAnalyzer.calculateActiveDuration()
    │   └─► activityAnalyzer.getFileActivityDistribution()
    │
    ├─► Productivity Scoring
    │   └─► productivityScorer.getProductivityReport()
    │
    ├─► Task Correlation
    │   ├─► taskCorrelationEngine.estimateTaskProgress()
    │   ├─► taskCorrelationEngine.detectStalledTasks()
    │   └─► taskCorrelationEngine.getActiveTask()
    │
    ▼
Unified Context Object
    │
    ▼
AI-Ready Prompt String
    │
    ▼
AI Reasoning Engine
    │
    ▼
Groq API (llama-3.3-70b-versatile)
    │
    ▼
AI Response
    │
    ▼
JSON Response to Client
```

### 2. Module Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      USER REQUEST                            │
│  "What should I focus on?"                                   │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  COPILOT CONTROLLER                          │
│  aiReasoningEngine.reason(projectId, 'copilot', message)    │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                AI REASONING ENGINE                           │
│  1. Build unified context                                    │
│  2. Get module system prompt (copilot)                       │
│  3. Generate full prompt                                     │
│  4. Call Groq API                                            │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  AI CONTEXT ENGINE                           │
│  buildUnifiedContext(projectId)                              │
│  ├─► Project core                                            │
│  ├─► Task intelligence                                       │
│  ├─► Timeline analysis                                       │
│  ├─► Risk assessment                                         │
│  ├─► Activity intelligence                                   │
│  ├─► Productivity metrics                                    │
│  ├─► Task correlation                                        │
│  └─► Focus sessions                                          │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    GROQ AI API                               │
│  Model: llama-3.3-70b-versatile                              │
│  System: Copilot role + Full context                         │
│  User: "What should I focus on?"                             │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI RESPONSE                                │
│  "Focus on 'API integration' - stalled 3 days, blocking     │
│   tasks. You're 3 days behind with 15h deficit."            │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  JSON RESPONSE                               │
│  { reply: "...", contextAware: true }                        │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### AI Context Engine

```javascript
class AIContextEngine {
  // Main method
  async buildUnifiedContext(projectId, options)
  
  // Private builders
  _buildProjectCore(project)
  _buildTaskIntelligence(tasks, project)
  _buildTimeline(project, tasks)
  _buildRiskAssessment(project, tasks)
  _buildActivityIntelligence(recentActivity)
  _buildProductivityIntelligence(productivity)
  
  // Helpers
  _identifyRiskFactors(...)
  _interpretProductivityScore(score)
  
  // Prompt generation
  generatePromptContext(unifiedContext)
}
```

### AI Reasoning Engine

```javascript
class AIReasoningEngine {
  // Main reasoning methods
  async reason(projectId, module, query, options)
  async reasonStructured(projectId, module, query, schema, options)
  async quickReason(module, query, minimalContext)
  async batchReason(projectId, queries)
  
  // Private helpers
  _getModuleSystemPrompt(module, context)
}
```

### Middleware

```javascript
// Full context
exports.attachAIContext = async (req, res, next)

// Lightweight context
exports.attachLightContext = async (req, res, next)

// Ownership validation
exports.validateProjectOwnership = async (req, res, next)
```

## Context Structure

```javascript
{
  // Project Core
  project: {
    id: ObjectId,
    name: String,
    goal: String,
    status: String,
    deadline: Date,
    hoursPerDay: Number,
    daysBehind: Number,
    createdAt: Date,
    documentContext: Object
  },
  
  // Task Intelligence
  tasks: {
    total: Number,
    done: Number,
    partial: Number,
    pending: Number,
    skipped: Number,
    completionPct: Number,
    byPriority: {
      high: Number,
      medium: Number,
      low: Number
    },
    currentDay: Number,
    todaysTasks: Array,
    tomorrowsTasks: Array,
    allTasks: Array
  },
  
  // Timeline
  timeline: {
    totalDays: Number,
    daysElapsed: Number,
    daysRemaining: Number,
    progressPct: Number,
    expectedCompletionPct: Number,
    actualCompletionPct: Number,
    progressDelta: Number,
    isAhead: Boolean,
    isBehind: Boolean,
    isOnTrack: Boolean,
    deadline: String,
    createdAt: String
  },
  
  // Risk Assessment
  risk: {
    level: String, // Low/Medium/High/Critical
    score: Number, // 0-100
    daysBehind: Number,
    daysRemaining: Number,
    pendingTasks: Number,
    highPriorityPending: Number,
    totalHoursRemaining: Number,
    availableHours: Number,
    hoursDeficit: Number,
    isOverCapacity: Boolean,
    factors: Array
  },
  
  // Activity Intelligence
  activity: {
    hasActivity: Boolean,
    totalEvents: Number,
    eventBreakdown: {
      edits: Number,
      saves: Number,
      opens: Number,
      commits: Number
    },
    recentFiles: Array,
    lastActivity: {
      file: String,
      event: String,
      timestamp: Date,
      minutesAgo: Number
    }
  },
  
  // Productivity Metrics
  productivity: {
    overallScore: Number, // 0-100
    daily: {
      score: Number,
      activeDuration: Number,
      sessions: Number
    },
    focus: {
      score: Number,
      totalSessions: Number,
      totalTime: Number
    },
    consistency: {
      score: Number,
      activeDays: Number,
      totalDays: Number
    },
    intensity: {
      score: Number,
      editFrequency: Number
    },
    interpretation: String
  },
  
  // Task Correlation
  taskCorrelation: {
    progress: Array, // Task progress estimates
    stalled: Array,  // Stalled tasks
    active: Object   // Currently active task
  },
  
  // Focus Sessions
  focusSessions: {
    totalFocusSessions: Number,
    totalFocusTime: Number,
    averageDuration: Number,
    sessions: Array
  },
  
  // Documents
  documents: {
    hasDocuments: Boolean,
    documentContext: Object
  },
  
  // Metadata
  metadata: {
    contextBuiltAt: Date,
    projectId: ObjectId,
    includesActivity: Boolean,
    includesProductivity: Boolean,
    includesTaskCorrelation: Boolean
  }
}
```

## Module System Prompts

### Copilot
```
You are ProjectMind AI Copilot - a conversational assistant.

YOUR ROLE:
- Answer questions about project status
- Provide specific, data-driven insights
- Reference actual task names and metrics
- Be concise (2-3 sentences max)

AWARENESS:
- Current project status, timeline, risks
- Recent activity and productivity patterns
- Task status (done, pending, stalled)
- Focus sessions and work patterns
```

### Demo Generator
```
You are ProjectMind Demo Generator.

YOUR ROLE:
- Generate professional presentations
- Highlight completed features
- Infer tech stack from activity
- Create realistic problem statements

AWARENESS:
- Completed vs pending features
- Actual progress and timeline
- Technologies being used
- Current state and risks
```

### Deep Focus Mode
```
You are ProjectMind Focus Mode AI.

YOUR ROLE:
- Recommend next best action
- Analyze task dependencies
- Consider productivity patterns
- Provide actionable recommendations

AWARENESS:
- Task urgency and importance
- User's productivity patterns
- Recent activity and focus sessions
- Project risks and constraints
```

## Performance Characteristics

### Context Building
- **Time**: 200-300ms
- **DB Queries**: 5-10 queries
- **Analysis**: Activity, productivity, correlation
- **Output**: Unified context object

### AI Reasoning
- **Time**: 2-3s
- **API**: Groq (llama-3.3-70b-versatile)
- **Input**: Context + Module prompt + User query
- **Output**: Natural language or JSON

### Total Response
- **Time**: 2.5-3.5s
- **Cacheable**: Context (60s TTL)
- **Optimizable**: Light context, batch reasoning

## Scalability

### Current Capacity
- **Groq API**: 14,400 requests/day (FREE)
- **Context Building**: ~300ms per request
- **Concurrent Requests**: Limited by MongoDB + Groq API

### Optimization Strategies
1. **Context Caching**: Cache for 30-60s
2. **Light Context**: Skip productivity when not needed
3. **Batch Reasoning**: Multiple queries, one context
4. **Connection Pooling**: MongoDB connection pool
5. **Rate Limiting**: Prevent API abuse

## Security

### Authentication
- JWT tokens required for all endpoints
- Project ownership validation
- User-specific context

### Data Privacy
- All data stays in your MongoDB
- Groq API receives aggregated metrics only
- No file contents sent to AI
- No PII in prompts

### Error Handling
- Graceful fallbacks for missing data
- Timeout handling for AI calls
- Validation for all inputs
- Detailed error logging

## Monitoring

### Key Metrics
- Context building time
- AI response time
- Groq API usage
- Error rates
- Cache hit rates

### Logging
```javascript
console.log('[AIContextEngine] Building context for project:', projectId);
console.log('[AIReasoningEngine] Reasoning for module:', module);
console.log('[Context] Productivity data not available yet');
```

## Future Enhancements

1. **Context Caching Layer**: Redis for distributed caching
2. **Streaming Responses**: Stream AI responses for faster UX
3. **Multi-Model Support**: Support multiple AI providers
4. **Context Versioning**: Track context changes over time
5. **A/B Testing**: Test different prompts and models
6. **Analytics Dashboard**: Visualize AI usage and performance

---

**Architecture**: Unified AI Intelligence System
**Status**: Production Ready ✅
**Result**: ONE intelligent AI operating system
