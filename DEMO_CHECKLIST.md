# 🎯 ProjectMind - Demo Day Checklist

## ⚡ Quick Start Commands

### Terminal 1 - Backend
```bash
cd projectmind/server
npm install
npm run dev
```
**Expected:** `Server running on http://localhost:4000` + `MongoDB connected`

### Terminal 2 - Frontend
```bash
cd projectmind/client
npm install
npm run dev
```
**Expected:** `Local: http://localhost:5173`

---

## ✅ Pre-Demo Setup (5 minutes before)

### 1. Environment Check
- [ ] Backend .env has MONGODB_URI, JWT_SECRET, GROQ_API_KEY
- [ ] Frontend .env has VITE_API_URL=http://localhost:4000
- [ ] MongoDB Atlas cluster is running
- [ ] Groq API key is valid

### 2. Server Health Check
```bash
curl http://localhost:4000/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "message": "ProjectMind server is running",
  "db": "connected"
}
```

### 3. Browser Setup
- [ ] Open Chrome/Edge (for voice input support)
- [ ] Clear localStorage: `localStorage.clear()`
- [ ] Open DevTools Console (F12)
- [ ] Navigate to http://localhost:5173

---

## 🎬 Demo Flow (5 minutes)

### **Scene 1: Registration (30 sec)**
1. Go to `/register`
2. Fill form:
   - Name: "Demo User"
   - Email: "demo@projectmind.ai"
   - Password: "demo123"
3. Click "Create account"
4. **Show:** Auto-redirect to projects page

**Key Point:** "JWT authentication with secure token storage"

---

### **Scene 2: Create Project (1 min)**
1. Click "New Project" button
2. Fill form:
   - **Name:** "Build Portfolio Website"
   - **Goal:** "Create a modern portfolio with 5 pages, blog section, contact form, and dark mode"
   - **Deadline:** [7 days from today]
   - **Hours/day:** 3
3. Click "Generate Plan with AI"
4. **Show:** Loading state "AI is generating your plan..."
5. Wait 5-10 seconds for AI response
6. **Show:** Project card appears with tasks

**Key Point:** "AI breaks down your goal into daily tasks using Groq's Llama 3.3"

---

### **Scene 3: Dashboard Tour (1 min)**
1. Click on the project card
2. **Point out:**
   - ✅ Project summary (completion %, risk level)
   - ✅ Progress burndown graph (planned vs actual)
   - ✅ Task list with priorities
   - ✅ AI Copilot chat on the right

**Key Point:** "Real-time tracking with AI-powered insights"

---

### **Scene 4: AI Copilot Demo (1 min)**
1. In chat, type: **"What should I do right now?"**
2. **Show:** AI responds with specific task recommendation
3. Click quick question: **"Why am I behind?"**
4. **Show:** AI explains based on actual data
5. Click 🎤 microphone button
6. **Show:** Red glowing effect + "Listening..."
7. Speak: **"Summarize my project"**
8. **Show:** Text appears in input, AI responds

**Key Point:** "Context-aware AI with voice input support"

---

### **Scene 5: Reschedule Demo (30 sec)**
1. Click "Optimize Plan with AI" button
2. Confirm dialog
3. **Show:** AI redistributes remaining tasks
4. **Show:** Project status updates to "on-track"

**Key Point:** "AI automatically adjusts your schedule when you fall behind"

---

### **Scene 6: VSCode Extension (30 sec - OPTIONAL)**
1. Show VSCode with extension installed
2. Show settings: Project ID + Token
3. **Explain:** "Tracks your coding activity automatically"
4. **Explain:** "Maps file edits to tasks and updates progress"

**Key Point:** "Seamless integration with your development workflow"

---

## 🎤 Demo Script

### Opening (15 sec)
> "Hi, I'm presenting **ProjectMind** - an AI-powered productivity copilot that helps developers manage long-term projects by breaking them into daily tasks, tracking progress automatically, and keeping you on schedule."

### Problem Statement (15 sec)
> "As developers, we often struggle with long-term projects - we start strong but lose momentum, miss deadlines, and don't know what to work on next. ProjectMind solves this."

### Solution Demo (4 min)
[Follow Scene 1-6 above]

### Closing (15 sec)
> "ProjectMind combines AI planning, real-time tracking, and intelligent rescheduling to help you stay consistent and finish projects on time. Thank you!"

---

## 🚨 Backup Plans

### If Groq API is Slow
- **Plan A:** Use pre-created project (create one before demo)
- **Plan B:** Show local AI responses (copilot has fallback logic)
- **Plan C:** Skip project creation, jump to dashboard tour

### If Voice Input Doesn't Work
- **Plan A:** Use Chrome/Edge instead of Firefox/Safari
- **Plan B:** Show alert message: "Voice input not supported in this browser"
- **Plan C:** Skip voice demo, focus on text chat

### If MongoDB Connection Fails
- **Plan A:** Check MONGODB_URI in .env
- **Plan B:** Use local MongoDB: `mongodb://localhost:27017/projectmind`
- **Plan C:** Show screenshots/video recording

### If Frontend Won't Load
- **Plan A:** Clear npm cache: `npm cache clean --force`
- **Plan B:** Delete node_modules and reinstall
- **Plan C:** Use production build: `npm run build && npm run preview`

---

## 📊 Key Metrics to Highlight

- ✅ **AI Task Generation:** 10-20 tasks in 5-10 seconds
- ✅ **Completion Tracking:** Real-time percentage updates
- ✅ **Risk Detection:** Automatic delay calculation
- ✅ **Voice Input:** Browser SpeechRecognition API
- ✅ **Activity Tracking:** VSCode extension with 60s batching
- ✅ **Smart Rescheduling:** AI redistributes tasks across remaining days

---

## 🎯 Questions You Might Get

### Q: "What AI model do you use?"
**A:** "We use Groq's Llama 3.3-70b for fast, high-quality responses. It's free and handles task planning, chat, and rescheduling."

### Q: "How does activity tracking work?"
**A:** "Our VSCode extension tracks file edits, saves, and opens. It maps these activities to tasks using file path patterns and updates task status automatically."

### Q: "Can I use this for non-coding projects?"
**A:** "Absolutely! While it's optimized for developers, you can use it for any long-term goal - writing a book, learning a skill, or planning an event."

### Q: "Is this production-ready?"
**A:** "It's a hackathon MVP with core features working. For production, we'd add team collaboration, mobile app, and more integrations."

### Q: "What's your tech stack?"
**A:** "React + Vite frontend, Express + MongoDB backend, Groq AI for intelligence, and a VSCode extension for activity tracking."

---

## ✅ Final Pre-Demo Checklist

**5 Minutes Before:**
- [ ] Both servers running (backend + frontend)
- [ ] Health check passes
- [ ] Browser open to http://localhost:5173
- [ ] DevTools console open (to show no errors)
- [ ] Demo script printed/visible
- [ ] Backup project created (in case AI is slow)
- [ ] Phone on silent
- [ ] Water bottle nearby

**1 Minute Before:**
- [ ] Clear localStorage
- [ ] Refresh page
- [ ] Take a deep breath
- [ ] Smile 😊

---

## 🎉 Post-Demo

### If Demo Goes Well:
- [ ] Share GitHub repo link
- [ ] Mention future features
- [ ] Thank judges/audience
- [ ] Collect feedback

### If Demo Has Issues:
- [ ] Stay calm and explain the issue
- [ ] Show screenshots/video as backup
- [ ] Explain what should happen
- [ ] Emphasize working features

---

## 📞 Emergency Contacts

- **MongoDB Issues:** Check Atlas dashboard
- **Groq API Issues:** Check https://console.groq.com
- **CORS Issues:** Verify CLIENT_URL in backend .env
- **Port Conflicts:** Kill process: `npx kill-port 4000 5173`

---

**Good luck! You've got this! 🚀**

---

**Last Updated:** $(date)  
**Project:** ProjectMind  
**Demo Duration:** 5 minutes  
**Confidence Level:** 95%
