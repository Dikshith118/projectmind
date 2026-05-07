# 🧪 Testing Guide - AI Copilot Features

## Quick Test Checklist

Use this guide to verify all AI features are working correctly.

---

## 🚀 Setup

### **1. Start Backend**
```bash
cd server
npm run dev
```

Expected output:
```
MongoDB connected
Server running on http://localhost:4000
```

### **2. Start Frontend**
```bash
cd client
npm run dev
```

Expected output:
```
VITE v8.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

### **3. Login**
- Navigate to `http://localhost:5173/login`
- Login with existing account or register new one
- You should be redirected to Projects page

---

## ✅ Test 1: Chat Copilot (Already Working)

### **Steps:**
1. Open any project from Projects page
2. Scroll to bottom of right sidebar
3. Find "AI Copilot Chat" card
4. Type a message: "What should I do next?"
5. Click "Send"

### **Expected Result:**
- Loading animation appears (3 bouncing dots)
- AI responds with specific task recommendation
- Response references actual project data
- Message appears in chat history

### **Example Response:**
```
Based on your current progress (30% complete, 2 days behind), 
you should focus on "Implement dark mode toggle" next. This is 
a high-priority task scheduled for today with 1h estimated time.
```

### **Test Variations:**
- "Why am I behind schedule?"
- "Will I finish on time?"
- "What did I work on today?"
- "What are my high-priority tasks?"

### **Troubleshooting:**
| Issue | Solution |
|-------|----------|
| "Sorry, I had trouble..." | Check GROQ_API_KEY in server/.env |
| No response | Check backend logs for errors |
| 401 error | Re-login to get fresh JWT token |

---

## 🆕 Test 2: Deep Focus Mode

### **Steps:**
1. Open any project dashboard
2. Look for "Deep Focus Mode" card in right sidebar
3. Wait for auto-load or click "Refresh Analysis"

### **Expected Result:**
- Loading spinner appears
- Card displays:
  - ✅ Next Best Action (specific task name)
  - ✅ Reasoning (why this task)
  - ✅ 3 stat cards (Remaining, High Risk, Work Left)
  - ✅ Risk Level badge (Low/Medium/High)
  - ✅ Risk Analysis text

### **Example Output:**
```
🎯 Next Best Action
"Implement dark mode toggle"
Reasoning: "Highest priority pending task scheduled for today"

Stats:
- Remaining: 7
- High Risk: 3
- Work Left: 14h

Risk Level: Medium
"You're 2 days behind with 7 tasks remaining. Focus on high-priority items."
```

### **Test Variations:**
- Click "Refresh Analysis" multiple times
- Test with different projects (on-track vs delayed)
- Test with projects at different completion stages

### **Troubleshooting:**
| Issue | Solution |
|-------|----------|
| Component not visible | Add import to Dashboard.jsx |
| Loading forever | Check backend logs |
| Empty response | Verify project has tasks |

---

## 🆕 Test 3: Recovery Plan Generator

### **Steps:**
1. Open a project that is **behind schedule** (daysBehind > 0)
2. Look for "Recovery Plan" card in right sidebar
3. Click "Generate Recovery Plan"

### **Expected Result:**
- Button shows "Analyzing..."
- Card displays:
  - ✅ Severity badge (Mild/Moderate/Critical)
  - ✅ Recovery Actions list
  - ✅ Tasks to Deprioritize
  - ✅ Focus Areas
  - ✅ Estimated Recovery Days

### **Example Output:**
```
Severity: Moderate

🎯 Recovery Actions:
• Increase daily hours from 2 to 3
  Impact: Recover 1 day per week
• Focus on high-priority tasks only
  Impact: Ensure critical features complete

⏭️ Tasks to Deprioritize:
• Add animations to dashboard
• Implement advanced filters

🔥 Focus Areas:
• Core authentication flow
• Project creation and AI integration

Estimated Recovery Time: 3 days
```

### **Test Variations:**
- Test with project 1 day behind
- Test with project 5+ days behind
- Test with on-track project (should show "No plan needed")

### **Note:**
If project is on-track (daysBehind = 0), component won't render.

### **Troubleshooting:**
| Issue | Solution |
|-------|----------|
| Component not visible | Check project.daysBehind > 0 |
| "No plan needed" | Project is on track (expected) |
| JSON parse error | Check backend logs |

---

## 🆕 Test 4: Demo Generator

### **Steps:**
1. Open any project dashboard
2. Look for "AI Demo Generator" card
3. Click "Generate Demo Summary"

### **Expected Result:**
- Button shows "Generating..."
- Card displays 6 sections:
  - ✅ Project Overview
  - ✅ Problem Statement
  - ✅ Implemented Features (list)
  - ✅ Tech Stack (pills)
  - ✅ Future Scope (list)
  - ✅ Demo Script (numbered steps)

### **Example Output:**
```
✅ Project Overview
"ProjectMind is an AI-powered project management copilot that 
automatically tracks coding activity and helps developers stay 
on schedule."

❓ Problem Statement
"Developers struggle to maintain momentum on long-term projects 
without manual time tracking."

🎯 Implemented Features
• AI task breakdown from goals
• Automatic activity tracking
• Delay detection system

⚙️ Tech Stack
[React] [Node.js] [MongoDB] [Groq AI]

🚀 Future Scope
• Team collaboration features
• Mobile app

🎬 Demo Script
1. Show project dashboard with progress chart
2. Demonstrate AI task generation
3. Explain delay detection system
```

### **Test Variations:**
- Generate for different projects
- Click "Generate New" to regenerate
- Compare output for similar projects

### **Troubleshooting:**
| Issue | Solution |
|-------|----------|
| Empty sections | Check project has tasks |
| Generic response | AI needs more project context |
| Timeout | Increase max_tokens in controller |

---

## 🔧 API Testing (cURL)

### **Get JWT Token First**

```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Copy the `token` from response.

### **Test Chat Copilot**

```bash
curl -X POST http://localhost:4000/api/copilot/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "YOUR_PROJECT_ID",
    "message": "What should I do next?"
  }'
```

### **Test Deep Focus Mode**

```bash
curl -X POST http://localhost:4000/api/ai/next-action \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectId": "YOUR_PROJECT_ID"}'
```

### **Test Recovery Plan**

```bash
curl -X POST http://localhost:4000/api/ai/recovery-plan \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectId": "YOUR_PROJECT_ID"}'
```

### **Test Demo Generator**

```bash
curl -X POST http://localhost:4000/api/ai/demo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectId": "YOUR_PROJECT_ID"}'
```

---

## 🐛 Common Issues & Solutions

### **Issue: "Project not found"**
**Cause:** Invalid projectId
**Solution:** 
- Check project exists in MongoDB
- Verify projectId is correct
- Ensure user owns the project

### **Issue: "Token invalid or expired"**
**Cause:** JWT token expired (7 days)
**Solution:**
- Logout and login again
- Check JWT_SECRET matches in .env

### **Issue: "AI returned invalid JSON"**
**Cause:** Groq API returned malformed response
**Solution:**
- Check backend logs for raw response
- Retry the request
- Verify GROQ_API_KEY is valid

### **Issue: Component not rendering**
**Cause:** Import missing or props incorrect
**Solution:**
- Check import path is correct
- Verify projectId prop is passed
- Check browser console for errors

### **Issue: Loading forever**
**Cause:** Backend not responding
**Solution:**
- Check backend is running
- Check network tab in browser
- Verify API URL is correct

### **Issue: Empty/generic AI responses**
**Cause:** Insufficient project context
**Solution:**
- Ensure project has tasks
- Add more task details
- Check ActivityLog has entries

---

## ✅ Success Criteria

All features should:
- ✅ Load without errors
- ✅ Display loading states
- ✅ Show error messages when needed
- ✅ Return context-aware responses
- ✅ Reference actual project data
- ✅ Respond within 3-5 seconds
- ✅ Handle edge cases gracefully

---

## 📊 Performance Benchmarks

| Feature | Expected Response Time |
|---------|----------------------|
| Chat Copilot | 1-3 seconds |
| Deep Focus Mode | 2-4 seconds |
| Recovery Plan | 2-5 seconds |
| Demo Generator | 3-6 seconds |

If responses take longer:
- Check Groq API status
- Verify network connection
- Check MongoDB query performance

---

## 🎯 Test Scenarios

### **Scenario 1: New Project (0% complete)**
- Chat: Should recommend starting first task
- Deep Focus: Should show all tasks pending
- Recovery Plan: Should say "No plan needed"
- Demo: Should generate based on goal

### **Scenario 2: Mid-Project (50% complete, on-track)**
- Chat: Should reference completed tasks
- Deep Focus: Should recommend next logical task
- Recovery Plan: Should say "No plan needed"
- Demo: Should include implemented features

### **Scenario 3: Behind Schedule (30% complete, 3 days behind)**
- Chat: Should acknowledge delay
- Deep Focus: Should show high risk level
- Recovery Plan: Should generate action plan
- Demo: Should still work normally

### **Scenario 4: Near Deadline (90% complete, 1 day left)**
- Chat: Should focus on remaining tasks
- Deep Focus: Should prioritize critical items
- Recovery Plan: Depends on daysBehind
- Demo: Should show mostly complete project

---

## 🔍 Debugging Tips

### **Backend Logs**
Watch backend console for:
```
[Activity] Received X events for "Project Name"
[Mapper] Task "Task Title" → done (85%)
[Delay] Project "Project Name" — 2 days behind → delayed
COPILOT ERROR: ...
DEMO GENERATION ERROR: ...
```

### **Frontend Console**
Check browser console for:
```
POST /api/copilot/chat 200 OK
POST /api/ai/next-action 200 OK
Error: Failed to generate demo
```

### **Network Tab**
Inspect requests:
- Status: Should be 200 OK
- Response: Check JSON structure
- Headers: Verify Authorization header

---

## 📝 Test Report Template

```
Date: ___________
Tester: ___________

✅ Chat Copilot
   - Loads: [ ] Yes [ ] No
   - Responds: [ ] Yes [ ] No
   - Context-aware: [ ] Yes [ ] No
   - Notes: ___________

✅ Deep Focus Mode
   - Loads: [ ] Yes [ ] No
   - Shows next action: [ ] Yes [ ] No
   - Risk analysis: [ ] Yes [ ] No
   - Notes: ___________

✅ Recovery Plan
   - Loads: [ ] Yes [ ] No
   - Generates plan: [ ] Yes [ ] No
   - Actionable items: [ ] Yes [ ] No
   - Notes: ___________

✅ Demo Generator
   - Loads: [ ] Yes [ ] No
   - All sections: [ ] Yes [ ] No
   - Accurate content: [ ] Yes [ ] No
   - Notes: ___________

Overall Status: [ ] Pass [ ] Fail
```

---

## 🎉 All Tests Passing?

If all features work correctly:
1. ✅ Backend is production-ready
2. ✅ Frontend is integrated
3. ✅ AI features are functional
4. ✅ Ready to deploy!

**Next Steps:**
- Customize UI styling
- Add more AI features
- Deploy to production
- Monitor usage and performance

---

Happy Testing! 🚀
