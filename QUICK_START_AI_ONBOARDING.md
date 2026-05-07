# 🚀 Quick Start: AI-Powered Project Onboarding

## ⚡ What's New?

Your ProjectMind app now has **intelligent document-aware project creation**!

Upload project documents (PDF, DOCX, TXT, PPTX) and AI will:
- Extract key information
- Detect technologies
- Identify features
- Generate smarter task plans
- Provide insights and recommendations

---

## 🎯 How to Use

### 1. Start the Application

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run dev
```

### 2. Create a New Project

1. Navigate to **Projects** page
2. Click **"New Project"** button
3. Fill in the form:
   - **Project name:** e.g., "E-commerce Platform"
   - **Project Brief:** Describe your project in detail
   - **Deadline:** Select target date
   - **Hours per day:** Available work hours

### 3. Upload Supporting Documents (Optional)

**Drag & drop or click to upload:**
- 📄 Requirements PDF
- 📝 Architecture DOCX
- 📃 API specs TXT
- 📊 Feature presentations PPTX

**What AI extracts:**
- Technologies (React, Node.js, MongoDB, etc.)
- Features (authentication, API, payments, etc.)
- Architecture notes
- API requirements
- Deployment information

### 4. Generate Plan

Click **"Generate Plan with AI"**

AI will:
- Analyze your brief + documents
- Detect tech stack
- Create intelligent task breakdown
- Assign categories and priorities
- Map file structures
- Identify risks
- Create milestones

### 5. View AI Insights

After generation, you'll see:
- ✅ Detected technologies (badges)
- ✅ Complexity level
- ✅ Key milestones
- ✅ Auto-redirect to projects

---

## 📝 Example Usage

### Scenario: Building a SaaS Dashboard

**Project Brief:**
```
Build a SaaS analytics dashboard with user authentication,
real-time data visualization, and subscription management.
Users should be able to create custom reports and export data.
```

**Upload Document:** `requirements.pdf` containing:
- React + TypeScript frontend
- Node.js + Express backend
- MongoDB database
- Stripe integration
- JWT authentication
- Chart.js for visualizations

**AI Output:**
- Detects: React, Node.js, MongoDB, Stripe, JWT, Chart.js
- Creates tasks for:
  - Project setup
  - Authentication system
  - Database schema
  - Stripe integration
  - Chart components
  - API endpoints
  - Testing
  - Deployment
- Identifies risks: "Payment integration requires PCI compliance"
- Suggests: "Use Stripe Elements for secure payment forms"

---

## 🎨 UI Features

### File Upload Zone
- Modern drag & drop interface
- Supported formats displayed
- File preview with icon and size
- Remove file option
- Premium dark theme

### AI Insights Panel
- Technology badges (cyan theme)
- Complexity indicator
- Milestone timeline
- Auto-dismiss after 5 seconds

---

## 🔧 Technical Details

### Supported File Types
- **PDF** - Requirements, specifications
- **DOCX** - Documentation, architecture
- **TXT** - Plain text notes, configs
- **PPTX** - Presentations, feature decks

### File Limits
- Max size: 10MB
- One file per project creation
- Automatic cleanup after processing

### AI Model
- **Groq API** with `llama-3.3-70b-versatile`
- Fast, accurate, free tier available
- Enhanced prompts with document context

---

## 🐛 Troubleshooting

### File Upload Issues

**Problem:** "Invalid file type"
- **Solution:** Only PDF, DOCX, TXT, PPTX are supported

**Problem:** "File too large"
- **Solution:** Compress file or split into smaller documents (max 10MB)

**Problem:** File not uploading
- **Solution:** Check browser console, verify backend is running

### AI Generation Issues

**Problem:** "AI returned invalid JSON"
- **Solution:** Try again, AI occasionally needs retry

**Problem:** Generic tasks generated
- **Solution:** Provide more detailed project brief and upload documents

**Problem:** No insights displayed
- **Solution:** Check backend logs, verify Groq API key is set

---

## 📊 Best Practices

### Writing Effective Project Briefs

✅ **Good:**
```
Build a task management app with:
- User authentication (JWT)
- Real-time updates (WebSocket)
- Drag & drop task boards
- File attachments
- Email notifications
- Mobile responsive design
Tech stack: React, Node.js, MongoDB, Socket.io
```

❌ **Bad:**
```
Make a todo app
```

### Preparing Documents for Upload

✅ **Include:**
- Technology requirements
- Feature descriptions
- API specifications
- Architecture diagrams (as text)
- Deployment requirements

❌ **Avoid:**
- Scanned images (text won't extract)
- Overly formatted documents
- Irrelevant content
- Duplicate information

---

## 🎯 Tips for Better Results

1. **Be Specific:** Detailed briefs = better task breakdown
2. **Upload Docs:** Documents significantly improve AI accuracy
3. **Tech Stack:** Mention specific technologies you want to use
4. **Features:** List all required features clearly
5. **Constraints:** Mention deadlines, team size, budget if relevant

---

## 🔐 Security Notes

- Files are processed and immediately deleted
- No files stored permanently
- JWT authentication required
- User ownership verified
- Secure file naming

---

## 📞 Need Help?

Check the full documentation: `AI_PROJECT_ONBOARDING_COMPLETE.md`

---

**Status:** ✅ Ready to use
**Last Updated:** May 7, 2026
