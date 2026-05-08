# � ProjectMind - Complete System Overview

## 📋 Executive Summary

**ProjectMind** is an AI-powered project management platform that transforms traditional task tracking into an intelligent productivity system. The platform uses **Groq AI (llama-3.3-70b-versatile)** to provide real-time insights, transparent reasoning, and unified intelligence across all features.

---

## � Core Value Proposition

Instead of just tracking tasks, ProjectMind:
- **Understands** your project context deeply
- **Predicts** risks and delays before they happen
- **Explains** every AI decision with transparent reasoning
- **Adapts** recommendations based on real-time activity
- **Unifies** all AI features into one intelligent system

---

## 🏗️ System Architecture

### **1. Unified AI Intelligence Layer**

All AI features share a central intelligence engine:

```
┌─────────────────────────────────────────────────────┐
│         AI CONTEXT ENGINE (Central Brain)           │
│  • Project data    • Tasks & progress               │
│  • Activity logs   • Productivity metrics           │
│  • Risk analysis   • Focus sessions                 │
│  • Documents       • Task correlations              │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│         AI REASONING ENGINE (Unified Logic)         │
│  • Module-specific prompts                          │
│  • Context-aware responses                          │
│  • Structured & conversational outputs              │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│         AI EXPLANATION ENGINE (Transparency)        │
│  • Reasoning breakdowns                             │
│  • Contributing factors                             │
│  • Confidence scoring                               │
│  • Evidence tracking                                │
└─────────────────────────────────────────────────────┘
```

**Key Files:**
- `server/services/aiContextEngine.js` - Builds unified project context
- `server/services/aiReasoningEngine.js` - Central AI reasoning
- `server/services/aiExplanationEngine.js` - Generates explanations
- `server/services/confidenceScorer.js` - Calculates confidence levels

---

### **2. Activity Intelligence Pipeline**

Transforms raw activity logs into actionable insights:

```
Activity Logs → Analysis → Correlation → Scoring → Insights
     ↓              ↓            ↓           ↓          ↓
  Edits/Saves   Focus      Task-File    Daily/Focus  AI-Generated
  Opens/Commits Sessions   Mappings     Consistency  Recommendations
```

**Components:**
- **Activity Analyzer** (`activityAnalyzer.js`)
  - Detects focus sessions (30+ min uninterrupted work)
  - Identifies idle periods
  - Calculates coding intensity (edits/min)

- **Task Correlation Engine** (`taskCorrelationEngine.js`)
  - Maps file edits to tasks
  - Estimates task progress (0-100%)
  - Detects stalled tasks (no activity for 3+ days)

- **Productivity Scorer** (`productivityScorer.js`)
  - Daily score (active time, sessions)
  - Focus score (deep work sessions)
  - Consistency score (active days ratio)
  - Intensity score (edit frequency)
  - **Overall Score:** Weighted average (0-100)

- **Insight Generator** (`insightGenerator.js`)
  - Groq AI-powered insights
  - Identifies patterns and bottlenecks
  - Provides actionable recommendations

---

### **3. Real-Time Intelligence System**

Live updates across the entire platform using Socket.IO:

**Backend Broadcasting:**
- `realtimeEventBroadcaster.js` - 15+ event types
  - Activity events (edit, save, commit)
  - Task updates (completion, status changes)
  - Risk level changes
  - AI insights
  - Focus session start/end
  - Productivity score updates

**Frontend Integration:**
- `useRealtimeProject.js` - React hook for real-time data
- `LiveActivityFeed.jsx` - Animated activity stream
- `LiveProductivityPulse.jsx` - Real-time metrics with pulse animation
- `RealtimeNotifications.jsx` - Toast notifications
- `ConnectionStatus.jsx` - Live/offline indicator

**Features:**
- Automatic reconnection
- Room-based isolation (per project)
- Typing indicators
- Heartbeat monitoring
- Connected clients count

---

### **4. Explainable AI System**

Every AI decision includes transparent reasoning:

**Explanation Types:**

1. **Risk Assessment**
   - Factors: Schedule delay, high-priority tasks, time deficit, productivity
   - Evidence: Days behind, pending tasks, hours deficit
   - Confidence: 50-100% based on data quality
   - Recommendation: Immediate actions needed

2. **Productivity Score**
   - Factors: Daily activity, focus quality, consistency, intensity
   - Evidence: Active minutes, focus sessions, edit frequency
   - Confidence: 60-100% based on data completeness
   - Recommendation: Improvement strategies

3. **Task Priority**
   - Factors: Assigned priority, blocking tasks, schedule pressure, overdue status
   - Evidence: Priority level, dependencies, days overdue
   - Confidence: 85-95%
   - Recommendation: Focus timing

4. **Focus Recommendation**
   - Factors: High priority, stalled work, blocking tasks, deadline pressure
   - Evidence: Priority, stalled days, blocked tasks count
   - Confidence: 80-95%
   - Recommendation: Next best action

5. **Recovery Plan**
   - Factors: Schedule delay, time deficit, remaining work, productivity
   - Evidence: Days behind, hours deficit, pending tasks
   - Confidence: 60-75%
   - Actions: Specific recovery steps

**UI Components:**
- `ExplainableInsightCard.jsx` - Expandable reasoning cards
  - Confidence badges (color-coded: green 90+, cyan 75+, yellow 60+, orange 40+, red <40)
  - Contributing factors with weights
  - Evidence list
  - Recommendations
  - Confidence factors

- `AIExplanationsDashboard.jsx` - Comprehensive explanations view
  - Risk explanation
  - Productivity explanation
  - Focus recommendation
  - All explanations in one place

---

## 🎨 User Interface

### **Dashboard Layout**

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar                Main Content                         │
│  ┌──────────┐          ┌──────────────────────────────┐    │
│  │ PM Logo  │          │  Project Header              │    │
│  │          │          │  • Name, Progress, Risk      │    │
│  │ Status   │          │  • Speedometer & Risk Level  │    │
│  │ ●●● Live │          └──────────────────────────────┘    │
│  │          │                                               │
│  │ Features │          ┌──────────────────────────────┐    │
│  │ • PPT    │          │  Progress Burndown Chart     │    │
│  │ • Focus  │          └──────────────────────────────┘    │
│  │ • Meeting│                                               │
│  │ • Analytics        ┌──────────────────────────────┐    │
│  │ • Reasoning│        │  Tasks (Today/All/Real-Time) │    │
│  │          │          │  • Task list with status     │    │
│  │ Calendar │          │  • Priority badges           │    │
│  │          │          └──────────────────────────────┘    │
│  │ Back     │                                               │
│  └──────────┘          ┌──────────────────────────────┐    │
│                        │  AI Copilot Chat             │    │
│                        │  • Context-aware responses   │    │
│                        └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### **Feature Modals**

Each feature opens in a full-screen overlay:

1. **📄 Project Presentation Assistant**
   - Auto-generates demo summary on open
   - Summary view (judge-friendly bullet points)
   - Full PPT view (overview, problem, features, tech stack, future scope, demo script)
   - Export as Markdown/Text

2. **🌙 Deep Focus Mode**
   - Distraction-free task execution
   - AI-recommended next task
   - Timer and progress tracking

3. **🤝 AI Meeting Assistant**
   - Meeting management
   - Absence notes
   - Meeting summaries

4. **📊 Activity Intelligence**
   - Productivity metrics (4 scores + overall)
   - AI insights (3-5 actionable recommendations)
   - Activity feed (recent edits, saves, commits)
   - Task inference (AI-detected task progress)

5. **🧠 AI Reasoning & Explanations**
   - Risk assessment explanation
   - Productivity score explanation
   - Focus recommendation explanation
   - Expandable cards with detailed reasoning

---

## 🔧 Technical Stack

### **Backend**
- **Runtime:** Node.js + Express
- **Database:** MongoDB (Mongoose ODM)
- **AI:** Groq API (llama-3.3-70b-versatile)
- **Real-Time:** Socket.IO
- **Authentication:** JWT

### **Frontend**
- **Framework:** React 18
- **Routing:** React Router v6
- **State:** Zustand (auth), React hooks
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Build:** Vite

### **Key Dependencies**
```json
{
  "groq-sdk": "^0.8.0",
  "socket.io": "^4.8.1",
  "socket.io-client": "^4.8.1",
  "mongoose": "^8.8.4",
  "express": "^4.21.2",
  "jsonwebtoken": "^9.0.2"
}
```

---

## 📊 Data Models

### **Project**
```javascript
{
  name: String,
  goal: String,
  deadline: Date,
  hoursPerDay: Number,
  daysBehind: Number,
  status: 'active' | 'completed',
  uploadedDocuments: Boolean,
  documentContext: Object,
  createdAt: Date
}
```

### **Task**
```javascript
{
  project: ObjectId,
  day: Number,
  title: String,
  status: 'pending' | 'partial' | 'done' | 'skipped',
  priority: 'high' | 'medium' | 'low',
  estimatedH: Number,
  dependencies: [ObjectId]
}
```

### **ActivityLog**
```javascript
{
  project: ObjectId,
  user: ObjectId,
  event: 'edit' | 'save' | 'open' | 'commit',
  file: String,
  timestamp: Date,
  metadata: Object
}
```

### **TaskMapping**
```javascript
{
  project: ObjectId,
  task: ObjectId,
  paths: [String],
  createdAt: Date
}
```

---

## 🚀 Key Features

### **1. Intelligent Task Planning**
- AI generates task breakdown from project goal
- Estimates time per task
- Maps tasks to file paths
- Identifies dependencies

### **2. Activity Tracking**
- Automatic file edit tracking
- Focus session detection
- Idle period identification
- Coding intensity measurement

### **3. Productivity Analytics**
- 4 scoring dimensions (daily, focus, consistency, intensity)
- Overall productivity score (0-100)
- Historical trends
- AI-generated insights

### **4. Risk Management**
- Real-time risk level calculation (Low/Medium/High/Critical)
- Days behind tracking
- Time deficit analysis
- High-priority task monitoring

### **5. AI Copilot**
- Context-aware conversational AI
- Answers questions about project status
- Provides specific, data-driven insights
- References actual task names and metrics

### **6. Real-Time Updates**
- Live activity feed
- Real-time productivity metrics
- Instant notifications
- Connected clients indicator

### **7. Transparent AI**
- Every decision explained
- Contributing factors with weights
- Evidence lists
- Confidence scores (0-100%)
- Actionable recommendations

### **8. Demo Generator**
- Auto-generates project presentation
- Judge-friendly summary
- Full PPT content
- Export capabilities

### **9. Deep Focus Mode**
- Distraction-free interface
- AI task recommendations
- Progress tracking

### **10. Meeting Assistant**
- Meeting management
- Absence tracking
- AI summaries

---

## 🎯 AI Intelligence Features

### **Unified Context Awareness**
All AI modules share the same project intelligence:
- ✅ Project details (name, goal, deadline, hours/day)
- ✅ Task status (done, pending, partial, skipped)
- ✅ Timeline (days elapsed, remaining, progress %)
- ✅ Risk assessment (level, score, factors)
- ✅ Recent activity (edits, saves, commits, files)
- ✅ Productivity metrics (4 scores + overall)
- ✅ Task correlation (progress estimates, stalled tasks)
- ✅ Focus sessions (count, duration, total time)
- ✅ Uploaded documents (detected tech, features)

### **Module-Specific Prompts**
Each AI feature has specialized instructions:
- **Copilot:** Conversational, concise, data-driven
- **Demo Generator:** Professional, comprehensive, realistic
- **Focus Mode:** Actionable, priority-aware, dependency-conscious
- **Planning:** Realistic estimates, tech-aware, milestone-focused
- **Recovery:** Root cause analysis, achievable strategies
- **Insights:** Pattern identification, encouraging, specific

### **Reasoning Transparency**
Every AI output includes:
- **Reasoning:** Why this decision was made
- **Factors:** What contributed (with weights)
- **Evidence:** Specific data points
- **Confidence:** How certain (0-100%)
- **Recommendation:** What to do next

---

## 📈 Productivity Scoring Algorithm

### **Overall Score Calculation**
```
Overall = (Daily × 30%) + (Focus × 30%) + (Consistency × 25%) + (Intensity × 15%)
```

### **1. Daily Score (30% weight)**
- Active duration (minutes coding today)
- Number of sessions
- Scoring: 0-100 based on target hours

### **2. Focus Score (30% weight)**
- Total focus sessions (30+ min uninterrupted)
- Total focus time (minutes)
- Scoring: 0-100 based on deep work quality

### **3. Consistency Score (25% weight)**
- Active days / Total days
- Scoring: 0-100 based on regularity

### **4. Intensity Score (15% weight)**
- Current edit frequency (edits/min)
- Baseline edit frequency (average)
- Scoring: 0-100 based on coding velocity

### **Interpretation**
- **80-100:** Excellent - Highly productive
- **60-79:** Good - On track
- **40-59:** Fair - Room for improvement
- **0-39:** Low - Needs attention

---

## 🔐 Security & Performance

### **Security**
- JWT authentication
- Password hashing (bcrypt)
- Protected API routes
- Input validation
- CORS configuration

### **Performance**
- Efficient MongoDB queries
- Indexed collections
- Socket.IO room isolation
- Lazy loading components
- Optimized re-renders

### **Scalability**
- Stateless backend
- Horizontal scaling ready
- Database connection pooling
- Socket.IO adapter support

---

## 🎨 Design System

### **Color Palette**
- **Primary:** Violet (#8b5cf6) to Fuchsia (#d946ef) gradients
- **Accent:** Cyan (#06b6d4) for AI features
- **Success:** Emerald (#10b981)
- **Warning:** Yellow (#eab308)
- **Error:** Red (#ef4444)
- **Background:** Slate-950 (#020617)

### **Typography**
- **Font:** System fonts (optimized for performance)
- **Weights:** Regular (400), Bold (700), Black (900)
- **Sizes:** xs (0.75rem) to 6xl (3.75rem)

### **Components**
- **Glass Cards:** `bg-white/5 border border-white/10 backdrop-blur`
- **Buttons:** Rounded-2xl with hover states
- **Badges:** Rounded-full with color coding
- **Charts:** Dark theme with violet/cyan colors

---

## 📁 Project Structure

```
projectmind/
├── client/                    # React frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js     # Axios instance
│   │   ├── components/
│   │   │   ├── ActivityFeed.jsx
│   │   │   ├── AIExplanationsDashboard.jsx
│   │   │   ├── AIInsights.jsx
│   │   │   ├── ConnectionStatus.jsx
│   │   │   ├── CopilotChat.jsx
│   │   │   ├── DeadlineCalendar.jsx
│   │   │   ├── DeepFocusMode.jsx
│   │   │   ├── DemoGenerator.jsx
│   │   │   ├── ExplainableInsightCard.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── FocusMode.jsx
│   │   │   ├── LiveActivityFeed.jsx
│   │   │   ├── LiveProductivityPulse.jsx
│   │   │   ├── MeetingAssistant.jsx
│   │   │   ├── ProductivityMetrics.jsx
│   │   │   ├── RealtimeNotifications.jsx
│   │   │   ├── RecoveryPlan.jsx
│   │   │   ├── SpeedoMeter.jsx
│   │   │   └── TaskInference.jsx
│   │   ├── hooks/
│   │   │   ├── useAIFeatures.js
│   │   │   └── useRealtimeProject.js
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Projects.jsx
│   │   │   └── Register.jsx
│   │   ├── store/
│   │   │   └── authStore.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Express backend
│   ├── controllers/
│   │   ├── activityController.js
│   │   ├── aiDemoController.unified.js
│   │   ├── copilotController.unified.js
│   │   └── explainableAIController.js
│   ├── middleware/
│   │   └── aiContext.js
│   ├── models/
│   │   ├── ActivityLog.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   ├── TaskMapping.js
│   │   └── User.js
│   ├── routes/
│   │   ├── activity.js
│   │   ├── auth.js
│   │   ├── copilot.js
│   │   ├── demo.js
│   │   ├── explainableAI.js
│   │   └── projects.js
│   ├── services/
│   │   ├── activityAnalyzer.js
│   │   ├── aiContextEngine.js
│   │   ├── aiExplanationEngine.js
│   │   ├── aiReasoningEngine.js
│   │   ├── confidenceScorer.js
│   │   ├── insightGenerator.js
│   │   ├── productivityScorer.js
│   │   ├── realtimeEventBroadcaster.js
│   │   └── taskCorrelationEngine.js
│   ├── index.js              # Server entry + Socket.IO
│   └── package.json
│
└── Documentation/
    ├── AI_ACTIVITY_INTELLIGENCE_COMPLETE.md
    ├── UNIFIED_AI_SYSTEM_COMPLETE.md
    ├── REALTIME_AI_WORKSPACE_COMPLETE.md
    ├── EXPLAINABLE_AI_SYSTEM_COMPLETE.md
    └── PROJECT_COMPLETE_OVERVIEW.md (this file)
```

---

## � API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### **Projects**
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `POST /api/projects/:id/reschedule` - Regenerate schedule
- `GET /api/projects/:id/progress` - Get progress data

### **Activity**
- `POST /api/activity/log` - Log activity event
- `GET /api/activity/:projectId/recent` - Get recent activity
- `GET /api/activity/:projectId/productivity` - Get productivity report
- `GET /api/activity/:projectId/insights` - Get AI insights
- `GET /api/activity/:projectId/task-inference` - Get task progress estimates

### **AI Copilot**
- `POST /api/copilot/chat` - Chat with AI copilot

### **Demo Generator**
- `POST /api/ai/demo` - Generate demo content

### **Explainable AI**
- `GET /api/explain/:projectId/risk` - Get risk explanation
- `GET /api/explain/:projectId/productivity` - Get productivity explanation
- `GET /api/explain/:projectId/task/:taskId/priority` - Get task priority explanation
- `GET /api/explain/:projectId/focus` - Get focus recommendation
- `GET /api/explain/:projectId/recovery` - Get recovery plan
- `GET /api/explain/:projectId/all` - Get all explanations

### **Socket.IO Events**

**Client → Server:**
- `authenticate` - Authenticate socket connection
- `join_project` - Join project room
- `leave_project` - Leave project room
- `typing` - User is typing
- `request_productivity_update` - Request metrics refresh
- `request_insights` - Request AI insights

**Server → Client:**
- `authenticated` - Authentication successful
- `activity_logged` - New activity event
- `task_updated` - Task status changed
- `risk_changed` - Risk level changed
- `ai_insight` - New AI insight
- `focus_session_started` - Focus session began
- `focus_session_ended` - Focus session ended
- `productivity_updated` - Productivity scores updated
- `task_inferred` - Task progress estimated
- `notification` - General notification

---

## 🎓 How It Works

### **1. Project Creation**
1. User creates project with goal, deadline, hours/day
2. Optional: Upload documents (PRD, specs)
3. AI analyzes goal and documents
4. AI generates task breakdown with estimates
5. Tasks mapped to file paths for tracking

### **2. Activity Tracking**
1. User works on project files
2. IDE/editor logs activity events (edit, save, open, commit)
3. Activity sent to backend via API
4. Backend broadcasts to Socket.IO room
5. Real-time updates appear in dashboard

### **3. Productivity Analysis**
1. Activity analyzer processes logs
2. Detects focus sessions (30+ min uninterrupted)
3. Calculates 4 productivity scores
4. Generates overall score (weighted average)
5. AI generates insights from patterns

### **4. Task Correlation**
1. Task correlation engine maps files to tasks
2. Estimates progress based on activity
3. Detects stalled tasks (no activity 3+ days)
4. Identifies active task (most recent edits)

### **5. Risk Assessment**
1. Calculates days behind schedule
2. Analyzes pending high-priority tasks
3. Computes time deficit (hours needed vs available)
4. Factors in productivity score
5. Assigns risk level (Low/Medium/High/Critical)

### **6. AI Reasoning**
1. Context engine builds unified project context
2. Reasoning engine generates AI response
3. Explanation engine adds reasoning breakdown
4. Confidence scorer calculates certainty
5. Response includes factors, evidence, recommendations

### **7. Real-Time Updates**
1. Backend event occurs (activity, task update, etc.)
2. Event broadcaster emits to Socket.IO room
3. Connected clients receive event
4. React hooks update state
5. UI updates instantly with animations

---

## 🎯 Use Cases

### **For Students**
- Track semester project progress
- Get AI recommendations for next steps
- Understand productivity patterns
- Generate demo presentations
- Stay on track with deadlines

### **For Developers**
- Monitor coding activity
- Identify bottlenecks
- Optimize focus sessions
- Track feature completion
- Explain project status to stakeholders

### **For Teams**
- Real-time collaboration visibility
- Shared project intelligence
- Transparent AI decisions
- Meeting management
- Progress reporting

---

## 🔮 Future Enhancements

### **Planned Features**
- [ ] GitHub integration (auto-track commits)
- [ ] VS Code extension (seamless activity logging)
- [ ] Team collaboration (multi-user projects)
- [ ] Advanced analytics (weekly/monthly reports)
- [ ] Custom AI prompts (user-defined reasoning)
- [ ] Mobile app (iOS/Android)
- [ ] Slack/Discord notifications
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Voice commands (AI voice assistant)
- [ ] Gamification (achievements, streaks)

### **Technical Improvements**
- [ ] Redis caching (faster queries)
- [ ] PostgreSQL option (relational data)
- [ ] GraphQL API (flexible queries)
- [ ] Microservices architecture (scalability)
- [ ] Docker deployment (containerization)
- [ ] CI/CD pipeline (automated testing)
- [ ] Load testing (performance benchmarks)
- [ ] A/B testing (feature experiments)

---

## 📚 Documentation

### **Quick Start Guides**
- `QUICK_START_ACTIVITY_INTELLIGENCE.md` - Activity tracking setup
- `QUICK_START_UNIFIED_AI.md` - AI system overview
- `QUICK_START_REALTIME_WORKSPACE.md` - Real-time features

### **Implementation Details**
- `AI_ACTIVITY_INTELLIGENCE_COMPLETE.md` - Activity pipeline
- `UNIFIED_AI_SYSTEM_COMPLETE.md` - AI architecture
- `REALTIME_AI_WORKSPACE_COMPLETE.md` - Real-time system
- `EXPLAINABLE_AI_SYSTEM_COMPLETE.md` - Transparency features

### **Feature Summaries**
- `AI_COPILOT_SUMMARY.md` - Copilot chat
- `DEMO_GENERATOR_IMPLEMENTATION.md` - Demo generator
- `DEEP_FOCUS_MODE_ENHANCEMENT_COMPLETE.md` - Focus mode
- `DEADLINE_CALENDAR_FEATURE.md` - Calendar widget
- `AI_MEETING_ASSISTANT_UPGRADE_COMPLETE.md` - Meeting assistant

---

## 🎉 Key Achievements

### **✅ Unified Intelligence**
- All AI features share one context engine
- Platform feels like ONE intelligent system
- No redundant context building

### **✅ Transparent AI**
- Every decision explained with reasoning
- Contributing factors with weights
- Confidence scores (0-100%)
- Evidence lists

### **✅ Real-Time Intelligence**
- Live activity feed
- Instant productivity updates
- Real-time notifications
- Connected clients indicator

### **✅ Comprehensive Analytics**
- 4 productivity dimensions
- Overall score (0-100)
- AI-generated insights
- Task progress inference

### **✅ Professional UI**
- Premium dark theme
- Smooth animations
- Responsive design
- Expandable reasoning cards

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+
- MongoDB 6+
- Groq API key (free tier: 14,400 requests/day)

### **Installation**

1. **Clone repository**
```bash
git clone <repository-url>
cd projectmind
```

2. **Install dependencies**
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

3. **Configure environment**

Create `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/projectmind
JWT_SECRET=your-secret-key
GROQ_API_KEY=your-groq-api-key
PORT=5000
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

4. **Start development servers**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

5. **Open browser**
```
http://localhost:5173
```

### **First Steps**
1. Register account
2. Create project (name, goal, deadline, hours/day)
3. Optional: Upload documents
4. AI generates task breakdown
5. Start working and logging activity
6. Watch real-time updates in dashboard

---

## 📞 Support

For questions, issues, or feature requests:
- Check documentation files
- Review code comments
- Inspect browser console
- Check server logs

---

## 📄 License

This project is part of a hackathon/academic submission.

---

## 🙏 Acknowledgments

- **Groq AI** - Free, fast AI inference
- **Socket.IO** - Real-time communication
- **MongoDB** - Flexible data storage
- **React** - Modern UI framework
- **Tailwind CSS** - Utility-first styling

---

## 📊 System Statistics

- **Total Files:** 50+ source files
- **Lines of Code:** 10,000+ lines
- **AI Models:** 1 (llama-3.3-70b-versatile)
- **API Endpoints:** 20+
- **Socket Events:** 15+
- **React Components:** 25+
- **Backend Services:** 9
- **Features:** 10 major features

---

## 🎯 Core Philosophy

> **"One Intelligent AI Operating System, Not Multiple Separate Tools"**

ProjectMind is designed to feel like a single, cohesive AI assistant that understands your entire project context. Every feature—from the copilot chat to the demo generator to the focus mode—shares the same intelligence, making recommendations that are consistent, context-aware, and transparent.

---

**Built with ❤️ using AI-first principles**

*Last Updated: [Current Date]*
*Version: 1.0.0*
