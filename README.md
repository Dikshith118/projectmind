# 🚀 ProjectMind - AI-Native Productivity Operating System

**An intelligent project management platform with hybrid cloud + local AI orchestration.**

---

## 🎯 Overview

ProjectMind is a comprehensive productivity platform that combines:
- **AI-Powered Intelligence** - Copilot, insights, planning, and recovery
- **Real-Time Collaboration** - Live updates via Socket.IO
- **Activity Tracking** - VS Code extension for automatic progress tracking
- **GitHub Integration** - Commit analysis and proof-of-work intelligence
- **Multi-Provider AI** - Cloud (Groq) + Local (Ollama) with automatic fallback

---

## ✨ Key Features

### **AI Intelligence**
- 🤖 **AI Copilot** - Conversational assistant for project questions
- 📊 **Productivity Insights** - AI-powered analytics and recommendations
- 🎯 **Task Planning** - Intelligent task breakdown and scheduling
- 🔄 **Recovery Plans** - Get back on track when behind schedule
- 💡 **Explainable AI** - Transparent reasoning for all AI decisions
- 🎨 **Demo Generator** - Automatic project presentation creation

### **Activity Intelligence**
- ⏱️ **Focus Sessions** - Automatic detection of deep work periods
- 📈 **Productivity Scoring** - Daily, focus, consistency, and intensity metrics
- 🔗 **Task Correlation** - Map file edits to tasks automatically
- 🚨 **Stalled Task Detection** - Identify tasks that need attention

### **Real-Time Features**
- 🔴 **Live Activity Feed** - Real-time project updates
- 📢 **Notifications** - Instant alerts for important events
- 💓 **Productivity Pulse** - Live productivity metrics
- 👥 **Presence Indicators** - See who's working on the project

### **GitHub Integration**
- 📝 **Commit Analysis** - AI categorization and insights
- 🔗 **Task Correlation** - Link commits to tasks automatically
- 📊 **Velocity Tracking** - Monitor development speed
- 🎯 **Feature Completion** - Detect when features are done

### **Multi-Provider AI**
- ☁️ **Cloud AI (Groq)** - Fast, powerful, 14.4k requests/day
- 🏠 **Local AI (Ollama)** - Private, offline-capable
- 🔄 **Automatic Fallback** - 99.9% uptime guarantee
- 📊 **Real-Time Monitoring** - Health, stats, performance

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16+
- MongoDB
- Groq API key (free at [groq.com](https://groq.com))
- Optional: Ollama for local AI

### **1. Clone & Install**

```bash
# Clone repository
git clone <your-repo-url>
cd projectmind

# Install backend
cd server
npm install

# Install frontend
cd ../client
npm install
```

### **2. Configure Environment**

Create `server/.env`:

```env
# Server
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/projectmind
JWT_SECRET=your_64_char_random_string_here
CLIENT_URL=http://localhost:5173

# AI Provider (Cloud)
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_groq_api_key_here

# AI Provider (Local - Optional)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# GitHub Integration (Optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_WEBHOOK_SECRET=your_webhook_secret
```

### **3. Start Services**

```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend
cd client
npm run dev
```

### **4. Optional: Install Ollama (Local AI)**

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model
ollama pull llama3

# Start Ollama
ollama serve
```

### **5. Access Application**

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:4000
- **Health Check:** http://localhost:4000/health

---

## 📚 Documentation

### **Core Features**
- [AI Activity Intelligence](./AI_ACTIVITY_INTELLIGENCE_COMPLETE.md) - Activity tracking and productivity scoring
- [Explainable AI System](./EXPLAINABLE_AI_SYSTEM_COMPLETE.md) - Transparent AI reasoning
- [GitHub Integration](./GITHUB_INTEGRATION_COMPLETE.md) - Commit analysis and insights
- [Multi-Provider AI](./MULTI_PROVIDER_AI_COMPLETE.md) - Hybrid cloud + local AI

### **Quick Start Guides**
- [Multi-Provider AI Setup](./QUICK_START_MULTI_PROVIDER_AI.md) - 5-minute AI provider setup
- [GitHub Integration Setup](./QUICK_START_GITHUB_INTEGRATION.md) - Connect GitHub repositories

### **Architecture**
- [System Architecture](./ARCHITECTURE_DIAGRAM.md) - Overall system design
- [Master Architecture](./FINAL_SYSTEMS_MASTER_ARCHITECTURE.md) - Complete architecture overview
- [Implementation Roadmap](./FINAL_IMPLEMENTATION_ROADMAP.md) - Development roadmap

### **Deployment**
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Production deployment guide
- [VS Code Extension](./VSCODE_EXTENSION_PRODUCTION.md) - Activity tracking extension

### **User Guides**
- [Complete User Guide](./USER_GUIDE_COMPLETE.md) - End-to-end user documentation
- [Complete System Summary](./COMPLETE_SYSTEM_SUMMARY.md) - System overview

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)                │
│  Dashboard • Projects • AI Copilot • Real-Time Updates  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Express + MongoDB)                 │
│  REST API • Socket.IO • Authentication • Controllers    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              UNIFIED AI PROVIDER LAYER                   │
│  • generateText() • generateStructuredResponse()        │
│  • Automatic Fallback • Health Monitoring               │
└─────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                   ↓
┌──────────────────┐              ┌──────────────────┐
│  GROQ PROVIDER   │              │ OLLAMA PROVIDER  │
│  (Cloud AI)      │              │  (Local AI)      │
└──────────────────┘              └──────────────────┘
```

---

## 🛠️ Tech Stack

### **Frontend**
- React 18
- Vite
- Tailwind CSS
- Recharts (data visualization)
- Socket.IO Client (real-time)

### **Backend**
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO (real-time)
- JWT Authentication
- Groq SDK (AI)
- Axios (HTTP client)

### **AI Providers**
- Groq (Cloud AI)
- Ollama (Local AI)

### **Integrations**
- GitHub API
- VS Code Extension API

---

## 📊 Project Structure

```
projectmind/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   └── store/         # State management
│   └── package.json
│
├── server/                # Express backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   │   ├── providers/    # AI providers
│   │   ├── aiProvider.js # Unified AI layer
│   │   └── ...
│   └── package.json
│
├── vscode-extension/     # VS Code activity tracker
│   ├── extension.js      # Extension entry point
│   └── tracker.js        # Activity tracking logic
│
└── docs/                 # Documentation
    ├── *.md              # Feature documentation
    └── QUICK_START_*.md  # Quick start guides
```

---

## 🔧 Configuration

### **Environment Variables**

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `CLIENT_URL` | Frontend URL | Yes |
| `AI_PROVIDER` | Default AI provider (groq/ollama) | Yes |
| `GROQ_API_KEY` | Groq API key | Yes |
| `OLLAMA_URL` | Ollama endpoint | No |
| `OLLAMA_MODEL` | Ollama model name | No |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | No |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | No |

---

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test

# E2E tests
npm run test:e2e
```

---

## 🚢 Deployment

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed deployment instructions.

**Quick Deploy:**

```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
NODE_ENV=production npm start
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Groq** - Fast cloud AI inference
- **Ollama** - Local AI models
- **MongoDB** - Database
- **Socket.IO** - Real-time communication

---

## 📞 Support

- **Documentation:** See `/docs` folder
- **Issues:** Open a GitHub issue
- **Email:** support@projectmind.com

---

**Built with ❤️ by the ProjectMind Team**

🚀 **Version 2.0.0** - Multi-Provider AI Architecture
