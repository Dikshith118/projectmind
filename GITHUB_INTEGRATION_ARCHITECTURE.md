# 🏗️ GitHub Integration Architecture

## 📐 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │ GitHubIntegration│  │   CommitFeed     │  │   Dashboard      │ │
│  │   Component      │  │   Component      │  │   Integration    │ │
│  │                  │  │                  │  │                  │ │
│  │ • OAuth Button   │  │ • Commit List    │  │ • Feature Card   │ │
│  │ • Repo Selector  │  │ • AI Insights    │  │ • Status Badge   │ │
│  │ • Status Display │  │ • Patterns       │  │ • Quick Actions  │ │
│  │ • Sync Button    │  │ • Velocity Chart │  │                  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         API LAYER                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    GitHub Controller                          │  │
│  │                                                               │  │
│  │  • oauthCallback()      • getCommits()                       │  │
│  │  • linkRepository()     • getCommitInsights()                │  │
│  │  • getUserRepositories()• syncCommits()                      │  │
│  │  • getIntegrationStatus()• unlinkRepository()               │  │
│  │  • handleWebhook()                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  GitHub Service  │  │ Commit Analyzer  │  │ Realtime Events  │ │
│  │                  │  │                  │  │                  │ │
│  │ • OAuth Flow     │  │ • AI Analysis    │  │ • Broadcast      │ │
│  │ • API Calls      │  │ • Categorization │  │ • Notifications  │ │
│  │ • Webhooks       │  │ • Task Corr.     │  │ • Socket.IO      │ │
│  │ • Token Mgmt     │  │ • Insights Gen.  │  │                  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │GitHubIntegration │  │  GitHubCommit    │  │  Task / Project  │ │
│  │     Model        │  │     Model        │  │     Models       │ │
│  │                  │  │                  │  │                  │ │
│  │ • OAuth Tokens   │  │ • Commit Data    │  │ • Task Info      │ │
│  │ • Repo Info      │  │ • AI Analysis    │  │ • Project Data   │ │
│  │ • Sync Status    │  │ • Correlation    │  │ • Mappings       │ │
│  │ • Webhooks       │  │ • Stats          │  │                  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │   GitHub API     │  │    Groq AI       │  │    MongoDB       │ │
│  │                  │  │                  │  │                  │ │
│  │ • OAuth          │  │ • Commit Analysis│  │ • Data Storage   │ │
│  │ • Repos          │  │ • Task Corr.     │  │ • Indexing       │ │
│  │ • Commits        │  │ • Insights Gen.  │  │ • Queries        │ │
│  │ • Webhooks       │  │                  │  │                  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### **1. OAuth Flow**

```
User                Frontend            Backend            GitHub
 │                     │                   │                  │
 │  Click "Connect"    │                   │                  │
 ├────────────────────>│                   │                  │
 │                     │                   │                  │
 │                     │  Redirect to      │                  │
 │                     │  GitHub OAuth     │                  │
 │                     ├──────────────────────────────────────>│
 │                     │                   │                  │
 │  Authorize App      │                   │                  │
 ├─────────────────────────────────────────────────────────────>│
 │                     │                   │                  │
 │                     │  Callback with    │                  │
 │                     │  code             │                  │
 │<────────────────────┤                   │                  │
 │                     │                   │                  │
 │                     │  POST /oauth/     │                  │
 │                     │  callback         │                  │
 │                     ├──────────────────>│                  │
 │                     │                   │                  │
 │                     │                   │  Exchange code   │
 │                     │                   │  for token       │
 │                     │                   ├─────────────────>│
 │                     │                   │                  │
 │                     │                   │  Access Token    │
 │                     │                   │<─────────────────┤
 │                     │                   │                  │
 │                     │  Token + User     │                  │
 │                     │  Info             │                  │
 │                     │<──────────────────┤                  │
 │                     │                   │                  │
 │  Show Repo          │                   │                  │
 │  Selector           │                   │                  │
 │<────────────────────┤                   │                  │
```

### **2. Repository Linking**

```
Frontend            Backend            GitHub API         Database
   │                   │                    │                 │
   │  POST /link       │                    │                 │
   ├──────────────────>│                    │                 │
   │                   │                    │                 │
   │                   │  Get Repo Details  │                 │
   │                   ├───────────────────>│                 │
   │                   │                    │                 │
   │                   │  Repo Info         │                 │
   │                   │<───────────────────┤                 │
   │                   │                    │                 │
   │                   │  Save Integration  │                 │
   │                   ├────────────────────────────────────>│
   │                   │                    │                 │
   │                   │  Fetch Commits     │                 │
   │                   ├───────────────────>│                 │
   │                   │                    │                 │
   │                   │  Commits (100)     │                 │
   │                   │<───────────────────┤                 │
   │                   │                    │                 │
   │                   │  Analyze Each      │                 │
   │                   │  Commit (AI)       │                 │
   │                   │                    │                 │
   │                   │  Save Commits      │                 │
   │                   ├────────────────────────────────────>│
   │                   │                    │                 │
   │  Success          │                    │                 │
   │<──────────────────┤                    │                 │
```

### **3. Commit Sync (Manual)**

```
Frontend            Backend            GitHub API         AI Service
   │                   │                    │                 │
   │  POST /sync       │                    │                 │
   ├──────────────────>│                    │                 │
   │                   │                    │                 │
   │                   │  Get Commits       │                 │
   │                   │  (since last sync) │                 │
   │                   ├───────────────────>│                 │
   │                   │                    │                 │
   │                   │  New Commits       │                 │
   │                   │<───────────────────┤                 │
   │                   │                    │                 │
   │                   │  For each commit:  │                 │
   │                   │  Get full details  │                 │
   │                   ├───────────────────>│                 │
   │                   │                    │                 │
   │                   │  Commit + Files    │                 │
   │                   │<───────────────────┤                 │
   │                   │                    │                 │
   │                   │  Analyze Commit    │                 │
   │                   ├────────────────────────────────────>│
   │                   │                    │                 │
   │                   │  AI Analysis       │                 │
   │                   │<────────────────────────────────────┤
   │                   │                    │                 │
   │                   │  Save to DB        │                 │
   │                   │  Broadcast Event   │                 │
   │                   │                    │                 │
   │  Sync Complete    │                    │                 │
   │<──────────────────┤                    │                 │
```

### **4. Webhook Flow (Real-Time)**

```
GitHub              Backend            AI Service         Database
   │                   │                    │                 │
   │  Push Event       │                    │                 │
   ├──────────────────>│                    │                 │
   │                   │                    │                 │
   │                   │  Verify Signature  │                 │
   │                   │                    │                 │
   │                   │  Extract Commits   │                 │
   │                   │                    │                 │
   │                   │  For each commit:  │                 │
   │                   │  Fetch details     │                 │
   │                   ├───────────────────>│                 │
   │                   │                    │                 │
   │                   │  Analyze           │                 │
   │                   ├────────────────────────────────────>│
   │                   │                    │                 │
   │                   │  AI Analysis       │                 │
   │                   │<────────────────────────────────────┤
   │                   │                    │                 │
   │                   │  Save Commit       │                 │
   │                   ├────────────────────────────────────>│
   │                   │                    │                 │
   │                   │  Broadcast         │                 │
   │                   │  Real-time Event   │                 │
   │                   │                    │                 │
   │  200 OK           │                    │                 │
   │<──────────────────┤                    │                 │
```

### **5. AI Commit Analysis**

```
Commit Data         Commit Analyzer      Groq AI          Task DB
     │                     │                  │               │
     │  Analyze Commit     │                  │               │
     ├────────────────────>│                  │               │
     │                     │                  │               │
     │                     │  Categorize      │               │
     │                     │  (regex rules)   │               │
     │                     │                  │               │
     │                     │  Extract         │               │
     │                     │  Keywords        │               │
     │                     │                  │               │
     │                     │  Detect          │               │
     │                     │  Completion      │               │
     │                     │                  │               │
     │                     │  Get Tasks       │               │
     │                     ├─────────────────────────────────>│
     │                     │                  │               │
     │                     │  Task List       │               │
     │                     │<─────────────────────────────────┤
     │                     │                  │               │
     │                     │  Correlate       │               │
     │                     │  with Tasks      │               │
     │                     ├─────────────────>│               │
     │                     │                  │               │
     │                     │  Task Match +    │               │
     │                     │  Confidence      │               │
     │                     │<─────────────────┤               │
     │                     │                  │               │
     │  Analysis Result    │                  │               │
     │<────────────────────┤                  │               │
```

---

## 🗄️ Database Schema

### **GitHubIntegration Collection**

```javascript
{
  _id: ObjectId,
  user: ObjectId → User,
  project: ObjectId → Project,
  
  // GitHub OAuth
  githubUserId: String,
  githubUsername: String,
  accessToken: String (encrypted),
  refreshToken: String,
  tokenExpiresAt: Date,
  
  // Repository
  repoOwner: String,
  repoName: String,
  repoFullName: String,
  repoUrl: String,
  defaultBranch: String,
  trackedBranches: [String],
  
  // Webhook
  webhookId: String,
  webhookSecret: String,
  
  // Sync
  lastSyncAt: Date,
  lastCommitSha: String,
  lastCommitDate: Date,
  syncEnabled: Boolean,
  
  // Stats
  totalCommits: Number,
  totalPullRequests: Number,
  
  createdAt: Date,
  updatedAt: Date
}
```

### **GitHubCommit Collection**

```javascript
{
  _id: ObjectId,
  project: ObjectId → Project,
  integration: ObjectId → GitHubIntegration,
  
  // Commit Info
  sha: String (unique, indexed),
  message: String,
  author: {
    name: String,
    email: String,
    username: String,
    avatarUrl: String
  },
  committedAt: Date (indexed),
  branch: String,
  
  // Changes
  additions: Number,
  deletions: Number,
  totalChanges: Number,
  filesChanged: [{
    filename: String,
    status: String,
    additions: Number,
    deletions: Number,
    changes: Number
  }],
  
  // AI Analysis
  aiAnalysis: {
    inferredTask: ObjectId → Task,
    confidence: Number (0-100),
    category: String (enum),
    keywords: [String],
    completionIndicators: {
      hasTests: Boolean,
      hasDocs: Boolean,
      isComplete: Boolean
    },
    analyzedAt: Date
  },
  
  // Task Correlation
  correlatedTasks: [{
    task: ObjectId → Task,
    confidence: Number,
    reason: String
  }],
  
  // Pull Request
  pullRequest: {
    number: Number,
    title: String,
    state: String,
    url: String
  },
  
  // Metadata
  url: String,
  htmlUrl: String,
  processed: Boolean,
  createdAt: Date
}
```

### **Indexes**

```javascript
// GitHubIntegration
{ user: 1, project: 1 }
{ githubUserId: 1 }
{ repoFullName: 1 }

// GitHubCommit
{ sha: 1 } (unique)
{ project: 1, committedAt: -1 }
{ 'aiAnalysis.inferredTask': 1 }
{ processed: 1 }
```

---

## 🔐 Security Architecture

### **OAuth Security**
```
┌─────────────────────────────────────────┐
│         OAuth Security Layers           │
├─────────────────────────────────────────┤
│ 1. GitHub OAuth 2.0                     │
│    • Authorization code flow            │
│    • State parameter validation         │
│    • HTTPS only                         │
├─────────────────────────────────────────┤
│ 2. Token Storage                        │
│    • Encrypted in database              │
│    • Never exposed to frontend          │
│    • Secure token refresh               │
├─────────────────────────────────────────┤
│ 3. API Authentication                   │
│    • JWT required for all endpoints     │
│    • User-project ownership validation  │
│    • Rate limiting                      │
└─────────────────────────────────────────┘
```

### **Webhook Security**
```
┌─────────────────────────────────────────┐
│        Webhook Security Layers          │
├─────────────────────────────────────────┤
│ 1. Signature Verification               │
│    • HMAC SHA-256                       │
│    • Secret per integration             │
│    • Timing-safe comparison             │
├─────────────────────────────────────────┤
│ 2. Payload Validation                   │
│    • Schema validation                  │
│    • Repository verification            │
│    • Event type filtering               │
├─────────────────────────────────────────┤
│ 3. Rate Limiting                        │
│    • Per-repository limits              │
│    • Duplicate event detection          │
│    • Backoff on errors                  │
└─────────────────────────────────────────┘
```

---

## 🚀 Performance Optimizations

### **Commit Fetching**
- Incremental sync (only new commits)
- Pagination (100 commits per request)
- Parallel processing
- Caching frequently accessed data

### **AI Analysis**
- Batch processing
- Async analysis
- Result caching
- Confidence thresholds

### **Database Queries**
- Indexed fields (sha, project, committedAt)
- Projection (only needed fields)
- Aggregation pipelines
- Connection pooling

### **Real-Time Updates**
- Socket.IO rooms (per-project isolation)
- Event batching
- Selective broadcasting
- Client-side debouncing

---

## 📊 Monitoring & Logging

### **Key Metrics**
- OAuth success rate
- Commit sync latency
- AI analysis time
- Webhook delivery rate
- API error rate

### **Logging Points**
- OAuth flow steps
- Commit sync operations
- AI analysis results
- Webhook events
- Error conditions

---

**Architecture designed for scalability, security, and real-time intelligence.**
