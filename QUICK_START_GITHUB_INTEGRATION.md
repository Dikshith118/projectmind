# 🚀 Quick Start: GitHub Integration

## ⚡ 5-Minute Setup

### **Step 1: Create GitHub OAuth App** (2 min)

1. Go to https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in:
   ```
   Application name: ProjectMind
   Homepage URL: http://localhost:5173
   Callback URL: http://localhost:5173/github/callback
   ```
4. Click **"Register application"**
5. Copy **Client ID** and **Client Secret**

### **Step 2: Configure Environment** (1 min)

**Backend** (`server/.env`):
```env
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_WEBHOOK_URL=http://localhost:5000/api/github/webhook
```

**Frontend** (`client/.env`):
```env
VITE_GITHUB_CLIENT_ID=your_client_id_here
```

### **Step 3: Update App Routes** (1 min)

Edit `client/src/App.jsx`:

```jsx
import GitHubCallback from './pages/GitHubCallback';

// Add this route:
<Route path="/github/callback" element={<GitHubCallback />} />
```

### **Step 4: Add to Dashboard** (1 min)

Edit `client/src/pages/Dashboard.jsx`:

```jsx
import GitHubIntegration from '../components/GitHubIntegration';
import CommitFeed from '../components/CommitFeed';

// Add to featureCards array:
{
  id: 'github',
  icon: '🔗',
  title: 'GitHub Integration',
  desc: 'Track commits and analyze code changes with AI.',
}

// Add to feature modal section:
{activeFeature === 'github' && (
  <div className="max-w-5xl space-y-6">
    <GitHubIntegration projectId={id} />
    <CommitFeed projectId={id} />
  </div>
)}
```

### **Step 5: Restart Servers**

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

---

## ✅ Test It Out

1. **Open Dashboard**
   - Navigate to any project
   - Click "GitHub Integration" in sidebar

2. **Connect GitHub**
   - Click "Connect GitHub"
   - Authorize on GitHub
   - Select a repository
   - Click "Link Repository"

3. **View Commits**
   - Commits sync automatically
   - AI analysis appears instantly
   - View insights and patterns

---

## 🎯 What You Get

### **Automatic Tracking**
- ✅ All commits synced automatically
- ✅ Real-time updates via webhooks
- ✅ Branch-specific tracking

### **AI Analysis**
- ✅ Commit categorization (feature/bugfix/etc.)
- ✅ Task correlation with confidence scores
- ✅ Completion detection (tests, docs)
- ✅ Keyword extraction

### **Productivity Insights**
- ✅ Commit velocity (commits/day)
- ✅ Pattern detection (TDD, feature branching)
- ✅ AI-generated recommendations
- ✅ Feature completion tracking

### **Real-Time Updates**
- ✅ Live commit notifications
- ✅ Pull request events
- ✅ Integration status updates

---

## 🔧 Common Issues

### **OAuth Fails**
```
Error: redirect_uri_mismatch
```
**Fix:** Ensure callback URL in GitHub app matches exactly:
```
http://localhost:5173/github/callback
```

### **Commits Not Appearing**
**Fix:** Click "Sync Commits" button manually or check:
- Access token validity
- Repository permissions
- Server logs for errors

### **AI Analysis Missing**
**Fix:** Verify Groq API key is set:
```env
GROQ_API_KEY=your_groq_api_key
```

---

## 📚 Next Steps

### **Explore Features**
- View commit feed with AI insights
- Check commit velocity metrics
- Review detected patterns
- See task correlations

### **Advanced Setup**
- Configure webhooks for real-time updates
- Track multiple branches
- Set up production OAuth app
- Enable HTTPS for webhooks

### **Integration**
- Commits boost productivity scores
- AI uses commits for better insights
- Task progress inferred from commits
- Real-time notifications

---

## 🎓 How It Works

```
1. User connects GitHub → OAuth flow
2. Repository linked → Initial sync (100 commits)
3. Commits analyzed → AI categorization + task correlation
4. Insights generated → Velocity, patterns, recommendations
5. Real-time updates → Webhooks push new commits
```

---

## 📊 Example Output

### **Commit Analysis**
```
Commit: "feat: implement user authentication"
Category: feature
Inferred Task: "Build authentication system" (85% confidence)
Keywords: auth, user, authentication, implement
Indicators: ✓ Tests ✓ Complete
Files: 5 changed (+234, -12)
```

### **AI Insights**
```
1. Authentication feature likely completed based on commits
2. Frontend implementation velocity increased 2x this week
3. API module still missing testing commits
4. Consistent commit pattern detected (TDD approach)
5. Documentation coverage improved significantly
```

---

## 🚀 Production Deployment

### **Update OAuth App**
1. Create new GitHub OAuth app for production
2. Set production URLs:
   ```
   Homepage: https://your-domain.com
   Callback: https://your-domain.com/github/callback
   ```

### **Configure Webhooks**
```env
GITHUB_WEBHOOK_URL=https://your-domain.com/api/github/webhook
```

### **Enable HTTPS**
- Required for webhooks
- Use Let's Encrypt or similar
- Update all URLs to HTTPS

---

## 💡 Pro Tips

1. **Link Early:** Connect GitHub at project start for full history
2. **Descriptive Commits:** Better messages = better AI analysis
3. **Conventional Commits:** Use prefixes (feat:, fix:, docs:) for accurate categorization
4. **Regular Syncs:** Click sync button if webhook fails
5. **Check Insights:** Review AI recommendations weekly

---

## 📞 Need Help?

- Check `GITHUB_INTEGRATION_COMPLETE.md` for full documentation
- Review server logs for errors
- Test with manual sync first
- Verify environment variables

---

**Ready to track your commits with AI? Let's go! 🚀**
