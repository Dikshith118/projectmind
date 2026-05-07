# 🏗️ ProjectMind AI Copilot - Architecture Diagram

## Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  CopilotChat.jsx │  │ DeepFocusMode.jsx│  │ RecoveryPlan.jsx │  │
│  │  ✅ Already      │  │  🆕 New          │  │  🆕 New          │  │
│  │     Working      │  │                  │  │                  │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                     │             │
│           └─────────────────────┼─────────────────────┘             │
│                                 │                                   │
│                    ┌────────────▼────────────┐                      │
│                    │  useAIFeatures Hook     │                      │
│                    │  🆕 New                 │                      │
│                    └────────────┬────────────┘                      │
│                                 │                                   │
│                    ┌────────────▼────────────┐                      │
│                    │   API Client (Axios)    │                      │
│                    │   ✅ Already Working    │                      │
│                    └────────────┬────────────┘                      │
│                                 │                                   │
└─────────────────────────────────┼───────────────────────────────────┘
                                  │
                                  │ HTTP + JWT Token
                                  │
┌─────────────────────────────────▼───────────────────────────────────┐
│                         BACKEND (Express)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    JWT Auth Middleware                        │   │
│  │                    ✅ Already Working                         │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
│                             │                                        │
│  ┌──────────────────────────▼───────────────────────────────────┐   │
│  │                         ROUTES                                │   │
│  ├───────────────────────────────────────────────────────────────┤   │
│  │  /api/copilot/chat        ✅ Already Working                 │   │
│  │  /api/ai/demo             🆕 New                              │   │
│  │  /api/ai/next-action      🆕 New                              │   │
│  │  /api/ai/recovery-plan    🆕 New                              │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
│                             │                                        │
│  ┌──────────────────────────▼───────────────────────────────────┐   │
│  │                      CONTROLLERS                              │   │
│  ├───────────────────────────────────────────────────────────────┤   │
│  │  copilotController.js     ✅ Already Working                 │   │
│  │    └─ chat()                                                  │   │
│  │                                                               │   │
│  │  aiDemoController.js      🆕 New                              │   │
│  │    ├─ generateDemo()                                          │   │
│  │    ├─ getNextAction()                                         │   │
│  │    └─ generateRecoveryPlan()                                  │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
│                             │                                        │
│                             ├──────────────┐                         │
│                             │              │                         │
│  ┌──────────────────────────▼─┐  ┌─────────▼──────────────────┐    │
│  │    MongoDB Queries         │  │   Groq AI Service          │    │
│  │    ✅ Already Working      │  │   ✅ Already Working       │    │
│  ├────────────────────────────┤  ├────────────────────────────┤    │
│  │  • Project.find()          │  │  • llama-3.3-70b-versatile │    │
│  │  • Task.find()             │  │  • JSON responses          │    │
│  │  • ActivityLog.find()      │  │  • Context-aware prompts   │    │
│  └────────────────────────────┘  └────────────────────────────┘    │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
                                  │
                                  │
┌─────────────────────────────────▼───────────────────────────────────┐
│                         DATABASE (MongoDB)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Projects   │  │    Tasks     │  │ ActivityLogs │              │
│  │              │  │              │  │              │              │
│  │  • name      │  │  • title     │  │  • file      │              │
│  │  • goal      │  │  • status    │  │  • event     │              │
│  │  • deadline  │  │  • priority  │  │  • timestamp │              │
│  │  • status    │  │  • day       │  │  • duration  │              │
│  │  • daysBehind│  │  • estimatedH│  │              │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### **1. Chat Copilot Flow** ✅ Already Working

```
User Types Message
       │
       ▼
CopilotChat Component
       │
       ▼
POST /api/copilot/chat
       │
       ▼
JWT Auth Middleware
       │
       ▼
copilotController.chat()
       │
       ├──► Fetch Project from MongoDB
       ├──► Fetch Tasks from MongoDB
       ├──► Fetch ActivityLogs from MongoDB
       │
       ▼
Build AI Context
       │
       ▼
Call Groq API (llama-3.3-70b)
       │
       ▼
Parse AI Response
       │
       ▼
Return to Frontend
       │
       ▼
Display in Chat UI
```

### **2. Deep Focus Mode Flow** 🆕 New

```
User Clicks "Refresh Analysis"
       │
       ▼
DeepFocusMode Component
       │
       ▼
useAIFeatures.getNextAction()
       │
       ▼
POST /api/ai/next-action
       │
       ▼
JWT Auth Middleware
       │
       ▼
aiDemoController.getNextAction()
       │
       ├──► Fetch Project
       ├──► Fetch Tasks (pending/partial)
       ├──► Calculate completion %
       ├──► Calculate days left
       │
       ▼
Build AI Prompt with Context
       │
       ▼
Call Groq API
       │
       ▼
Parse JSON Response
       │
       ▼
Return {
  nextAction,
  reasoning,
  riskLevel,
  remainingTasks,
  ...
}
       │
       ▼
Display in UI
```

### **3. Recovery Plan Flow** 🆕 New

```
User Clicks "Generate Recovery Plan"
       │
       ▼
RecoveryPlan Component
       │
       ▼
useAIFeatures.generateRecoveryPlan()
       │
       ▼
POST /api/ai/recovery-plan
       │
       ▼
JWT Auth Middleware
       │
       ▼
aiDemoController.generateRecoveryPlan()
       │
       ├──► Check if daysBehind > 0
       │    │
       │    ├─ No ──► Return "No plan needed"
       │    │
       │    └─ Yes ──► Continue
       │
       ├──► Fetch Project
       ├──► Fetch Pending Tasks
       ├──► Calculate days left
       │
       ▼
Build Recovery Prompt
       │
       ▼
Call Groq AI
       │
       ▼
Parse JSON Response
       │
       ▼
Return {
  severity,
  actions[],
  tasksToSkip[],
  focusAreas[],
  estimatedRecoveryDays
}
       │
       ▼
Display Recovery Plan
```

### **4. Demo Generator Flow** 🆕 New

```
User Clicks "Generate Demo Summary"
       │
       ▼
DemoGenerator Component
       │
       ▼
useAIFeatures.generateDemo()
       │
       ▼
POST /api/ai/demo
       │
       ▼
JWT Auth Middleware
       │
       ▼
aiDemoController.generateDemo()
       │
       ├──► Fetch Project
       ├──► Fetch All Tasks
       │
       ▼
Build Demo Prompt
       │
       ▼
Call Groq AI
       │
       ▼
Parse JSON Response
       │
       ▼
Return {
  overview,
  problem,
  features[],
  techStack[],
  futureScope[],
  demoScript[]
}
       │
       ▼
Display Demo Summary
```

---

## Component Hierarchy

```
Dashboard.jsx
│
├─ Sidebar (Left)
│  ├─ Logo
│  ├─ Navigation
│  └─ Back Button
│
├─ Main Content
│  ├─ Hero Section
│  ├─ Stats Cards
│  ├─ Progress Chart
│  └─ Task List
│
└─ Sidebar (Right)
   ├─ AI Copilot Card ✅
   ├─ DeepFocusMode 🆕
   ├─ RecoveryPlan 🆕 (conditional)
   ├─ Project Health ✅
   ├─ Delay Warning ✅ (conditional)
   ├─ CopilotChat ✅
   └─ DemoGenerator 🆕
```

---

## API Request/Response Examples

### **Chat Copilot**

**Request:**
```json
POST /api/copilot/chat
Authorization: Bearer <jwt_token>

{
  "projectId": "507f1f77bcf86cd799439011",
  "message": "What should I do next?"
}
```

**Response:**
```json
{
  "reply": "Based on your current progress (30% complete, 2 days behind), you should focus on 'Implement dark mode toggle' next. This is a high-priority task scheduled for today."
}
```

### **Deep Focus Mode**

**Request:**
```json
POST /api/ai/next-action
Authorization: Bearer <jwt_token>

{
  "projectId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "nextAction": "Implement dark mode toggle",
  "reasoning": "Highest priority pending task for today",
  "remainingTasks": 7,
  "highRiskTasks": 3,
  "estimatedWorkLeft": "14h",
  "riskLevel": "Medium",
  "riskAnalysis": "2 days behind with 7 tasks remaining"
}
```

### **Recovery Plan**

**Request:**
```json
POST /api/ai/recovery-plan
Authorization: Bearer <jwt_token>

{
  "projectId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "needed": true,
  "severity": "Moderate",
  "actions": [
    {
      "action": "Increase daily hours from 2 to 3",
      "impact": "Recover 1 day per week"
    }
  ],
  "tasksToSkip": ["Add animations"],
  "focusAreas": ["Core auth flow"],
  "estimatedRecoveryDays": 3
}
```

### **Demo Generator**

**Request:**
```json
POST /api/ai/demo
Authorization: Bearer <jwt_token>

{
  "projectId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "overview": "ProjectMind is an AI-powered project copilot...",
  "problem": "Developers struggle with long-term momentum...",
  "features": ["AI task breakdown", "Auto tracking"],
  "techStack": ["React", "Node.js", "MongoDB"],
  "futureScope": ["Team collaboration"],
  "demoScript": ["Show dashboard", "Demo AI generation"]
}
```

---

## Technology Stack

```
┌─────────────────────────────────────────┐
│           FRONTEND                      │
├─────────────────────────────────────────┤
│  React 19                               │
│  Vite                                   │
│  Tailwind CSS                           │
│  Recharts (charts)                      │
│  Zustand (state)                        │
│  React Router                           │
│  Axios (HTTP)                           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           BACKEND                       │
├─────────────────────────────────────────┤
│  Node.js                                │
│  Express 5                              │
│  Mongoose (MongoDB ODM)                 │
│  JWT (jsonwebtoken)                     │
│  bcryptjs (password hashing)            │
│  Groq SDK (AI)                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           DATABASE                      │
├─────────────────────────────────────────┤
│  MongoDB Atlas                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           AI SERVICE                    │
├─────────────────────────────────────────┤
│  Groq API                               │
│  Model: llama-3.3-70b-versatile         │
└─────────────────────────────────────────┘
```

---

## File Structure

```
projectmind/
│
├── client/                          # Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── CopilotChat.jsx      ✅ Chat UI
│   │   │   ├── DeepFocusMode.jsx    🆕 Next action UI
│   │   │   ├── RecoveryPlan.jsx     🆕 Recovery UI
│   │   │   └── DemoGenerator.jsx    🆕 Demo UI
│   │   ├── hooks/
│   │   │   └── useAIFeatures.js     🆕 API hook
│   │   ├── pages/
│   │   │   └── Dashboard.jsx        ✅ Main dashboard
│   │   ├── store/
│   │   │   └── authStore.js         ✅ Auth state
│   │   └── api/
│   │       └── client.js            ✅ Axios client
│   └── package.json
│
├── server/                          # Backend
│   ├── controllers/
│   │   ├── copilotController.js     ✅ Chat logic
│   │   └── aiDemoController.js      🆕 New AI features
│   ├── routes/
│   │   ├── copilot.js               ✅ Chat route
│   │   └── aiFeatures.js            🆕 New AI routes
│   ├── services/
│   │   └── claudeService.js         ✅ Groq AI
│   ├── models/
│   │   ├── Project.js               ✅ Project schema
│   │   ├── Task.js                  ✅ Task schema
│   │   └── ActivityLog.js           ✅ Activity schema
│   ├── middleware/
│   │   └── auth.js                  ✅ JWT auth
│   └── index.js                     ✅ Server entry
│
└── docs/                            # Documentation
    ├── AI_COPILOT_API.md            📚 API reference
    ├── INTEGRATION_GUIDE.md         📚 Integration guide
    ├── AI_COPILOT_SUMMARY.md        📚 Summary
    └── ARCHITECTURE_DIAGRAM.md      📚 This file
```

---

## Security Flow

```
User Request
     │
     ▼
Frontend sends JWT token in header:
Authorization: Bearer <token>
     │
     ▼
Backend receives request
     │
     ▼
JWT Auth Middleware
     │
     ├─ Verify token signature
     ├─ Check expiration
     └─ Extract userId
     │
     ├─ Valid ──► Continue to controller
     │
     └─ Invalid ──► Return 401 Unauthorized
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         PRODUCTION SETUP                │
├─────────────────────────────────────────┤
│                                         │
│  Frontend (Vercel/Netlify)              │
│       │                                 │
│       ├─ Static React build             │
│       └─ Environment: VITE_API_URL      │
│                                         │
│  Backend (Railway/Render/Heroku)        │
│       │                                 │
│       ├─ Node.js server                 │
│       └─ Environment:                   │
│           • MONGODB_URI                 │
│           • JWT_SECRET                  │
│           • GROQ_API_KEY                │
│           • CLIENT_URL                  │
│                                         │
│  Database (MongoDB Atlas)               │
│       │                                 │
│       └─ Cloud-hosted MongoDB           │
│                                         │
└─────────────────────────────────────────┘
```

---

This architecture is **production-ready** and follows industry best practices! 🚀
