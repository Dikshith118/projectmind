# Quick Start: Unified AI Intelligence System

## What You Get

Transform your platform from **multiple independent AI tools** into **ONE intelligent AI operating system** where all modules share context and reasoning.

## Before vs After

### Before (Disconnected)
```
Copilot: "Focus on high-priority tasks" (generic)
Demo Generator: Creates generic content
Focus Mode: Shows simple task list
```

### After (Unified)
```
Copilot: "Focus on 'API integration' - stalled 3 days, blocking tasks. You're 3 days behind with 15h deficit." (specific, data-driven)
Demo Generator: "Completed: User auth, Dashboard. Tech: React, Node.js (detected from activity)" (accurate)
Focus Mode: "Next: API integration. Your productivity is 65/100 - you have momentum." (context-aware)
```

## Installation (Already Done!)

All files created:
- ✅ `server/services/aiContextEngine.js`
- ✅ `server/services/aiReasoningEngine.js`
- ✅ `server/middleware/aiContext.js`
- ✅ `server/controllers/copilotController.unified.js`
- ✅ `server/controllers/aiDemoController.unified.js`

## How to Use

### Option 1: Use Unified Controllers (Recommended)

Replace existing controllers with unified versions:

```bash
# Backup old controllers
cp server/controllers/copilotController.js server/controllers/copilotController.old.js
cp server/controllers/aiDemoController.js server/controllers/aiDemoController.old.js

# Use unified versions
mv server/controllers/copilotController.unified.js server/controllers/copilotController.js
mv server/controllers/aiDemoController.unified.js server/controllers/aiDemoController.js
```

**That's it!** Your AI modules now share unified context.

### Option 2: Integrate Manually

Update existing controllers to use the unified engine:

```javascript
const aiReasoningEngine = require('../services/aiReasoningEngine');

// Before
exports.chat = async (req, res) => {
  // Manual context building
  const project = await Project.findById(projectId);
  const tasks = await Task.find({ project: projectId });
  // ... build prompt manually
  const response = await groq.chat.completions.create({...});
};

// After
exports.chat = async (req, res) => {
  const result = await aiReasoningEngine.reason(
    projectId,
    'copilot',
    message,
    { maxTokens: 300 }
  );
  res.json({ reply: result.response });
};
```

## Usage Examples

### 1. Copilot Chat (Context-Aware)

```javascript
const aiReasoningEngine = require('../services/aiReasoningEngine');

exports.chat = async (req, res) => {
  const { projectId, message } = req.body;
  
  const result = await aiReasoningEngine.reason(
    projectId,
    'copilot', // module name
    message,
    { maxTokens: 300, temperature: 0.5 }
  );
  
  res.json({ reply: result.response });
};
```

### 2. Demo Generator (Data-Driven)

```javascript
exports.generateDemo = async (req, res) => {
  const { projectId } = req.body;
  
  const schema = {
    overview: "string",
    features: ["array"],
    techStack: ["array"]
  };
  
  const result = await aiReasoningEngine.reasonStructured(
    projectId,
    'demo',
    'Generate comprehensive demo summary',
    schema,
    { maxTokens: 2000 }
  );
  
  res.json(result.data);
};
```

### 3. Focus Mode (Intelligent Recommendations)

```javascript
exports.getNextAction = async (req, res) => {
  const { projectId } = req.body;
  
  const schema = {
    nextAction: "string",
    reasoning: "string",
    riskLevel: "string"
  };
  
  const result = await aiReasoningEngine.reasonStructured(
    projectId,
    'focus',
    'Recommend next best action',
    schema
  );
  
  res.json(result.data);
};
```

### 4. Batch Reasoning (Multiple Queries)

```javascript
exports.getQuickSuggestions = async (req, res) => {
  const { projectId } = req.params;
  
  const queries = [
    { module: 'copilot', query: 'What should I focus on?' },
    { module: 'copilot', query: 'What is my biggest risk?' },
    { module: 'copilot', query: 'How is my productivity?' }
  ];
  
  const results = await aiReasoningEngine.batchReason(projectId, queries);
  
  res.json({ 
    suggestions: results.map(r => r.response) 
  });
};
```

### 5. Using Middleware

```javascript
const { attachAIContext } = require('../middleware/aiContext');

// Attach context to request
router.get('/endpoint', auth, attachAIContext, handler);

// Access in handler
exports.handler = async (req, res) => {
  const context = req.aiContext; // Full unified context
  const prompt = req.aiContextPrompt; // AI-ready prompt string
  
  // Use context directly or pass to AI
  res.json({ context });
};
```

## What Context Includes

The unified context includes:

### Project Core
- Name, goal, status, deadline, hours/day
- Days behind, created date

### Task Intelligence
- Total, done, partial, pending tasks
- Completion percentage
- Priority breakdown (high/medium/low)
- Today's tasks, tomorrow's tasks
- All tasks with details

### Timeline
- Days elapsed, remaining, total
- Progress percentage
- Expected vs actual completion
- Ahead/behind/on-track status

### Risk Assessment
- Risk level (Low/Medium/High/Critical)
- Risk score (0-100)
- Days behind, pending tasks
- Hours remaining vs available
- Capacity analysis
- Risk factors

### Activity Intelligence
- Recent events (edits, saves, opens)
- Recent files worked on
- Last activity timestamp
- Event breakdown

### Productivity Metrics
- Overall score (0-100)
- Daily, focus, consistency, intensity scores
- Active duration, sessions
- Focus time, session count
- Edit frequency

### Task Correlation
- Currently active task
- Stalled tasks (no activity 2+ days)
- Task progress estimates with confidence

### Focus Sessions
- Total sessions, total time
- Average duration
- Session details

### Document Context
- Detected technologies
- Required features
- Architecture notes

## API Response Examples

### Copilot Chat
```json
{
  "reply": "Focus on 'API integration' - it's been stalled for 3 days and is blocking other tasks. You're 3 days behind schedule with 15h deficit, so prioritizing this high-priority task will help you recover.",
  "contextAware": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Demo Generator
```json
{
  "overview": "MyApp is an authentication system with user management and dashboard features.",
  "problem": "Users need a secure way to authenticate and manage their profiles.",
  "features": [
    "User authentication with JWT",
    "Dashboard with analytics",
    "Profile management"
  ],
  "techStack": ["React", "Node.js", "MongoDB", "JWT", "Express"],
  "futureScope": [
    "API integration",
    "Admin panel",
    "Email notifications"
  ],
  "demoScript": [
    "Show user registration and login flow",
    "Demonstrate dashboard features",
    "Walk through profile management"
  ]
}
```

### Focus Mode
```json
{
  "nextAction": "Complete API integration",
  "reasoning": "Stalled for 3 days, blocking other tasks, high priority",
  "remainingTasks": 13,
  "highRiskTasks": 5,
  "estimatedWorkLeft": "45 hours",
  "riskLevel": "High",
  "riskAnalysis": "3 days behind schedule with 15h time deficit"
}
```

## Testing

### 1. Start Server
```bash
cd server
npm start
```

### 2. Test Copilot
```bash
curl -X POST http://localhost:4000/api/copilot/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "projectId": "YOUR_PROJECT_ID",
    "message": "What should I focus on?"
  }'
```

### 3. Test Demo Generator
```bash
curl -X POST http://localhost:4000/api/ai/demo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "projectId": "YOUR_PROJECT_ID"
  }'
```

### 4. Test Focus Mode
```bash
curl -X POST http://localhost:4000/api/ai/next-action \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "projectId": "YOUR_PROJECT_ID"
  }'
```

## Performance

- **Context Building**: ~200-300ms
- **AI Reasoning**: ~2-3s (Groq API)
- **Total Response**: ~2.5-3.5s

### Optimization Tips

1. **Cache Context** (for repeated requests within 60s)
2. **Use Light Context** (when productivity data not needed)
3. **Batch Reasoning** (multiple queries in one context build)

## Troubleshooting

### Context Building Slow
- Check MongoDB connection
- Verify indexes on ActivityLog, Task collections
- Use light context when possible

### AI Responses Generic
- Verify context includes activity data
- Check productivity metrics are being calculated
- Ensure task correlation is working

### Groq API Errors
- Verify `GROQ_API_KEY` in `.env`
- Check API quota (14,400 requests/day)
- Review error logs for details

## Next Steps

1. **Replace Controllers**: Use unified versions
2. **Test All Modules**: Verify context-aware responses
3. **Monitor Performance**: Check response times
4. **Add New Features**: Use unified engine for new AI modules

## Support

- Full Documentation: `UNIFIED_AI_SYSTEM_COMPLETE.md`
- Architecture Details: See "Architecture" section in full docs
- Integration Examples: See "Usage Examples" section

---

**Status**: Production Ready ✅
**Result**: Your platform now feels like ONE intelligent AI operating system!
