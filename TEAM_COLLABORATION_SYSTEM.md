# 👥 Team Collaboration - Multi-User Intelligence System

## 📋 Overview

Transform ProjectMind from single-user to collaborative AI team intelligence platform with multi-user projects, role-based access, team analytics, and collaborative AI features.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  TEAM COLLABORATION LAYER                        │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │   Team       │  │   Roles &    │  │   Invitations      │  │
│  │   Management │  │   Permissions│  │   System           │  │
│  └──────────────┘  └──────────────┘  └────────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │   Team       │  │   Contributor│  │   Sprint           │  │
│  │   Analytics  │  │   Tracking   │  │   Intelligence     │  │
│  └──────────────┘  └──────────────┘  └────────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │   Shared     │  │   Team       │  │   Collaborative    │  │
│  │   AI Context │  │   Copilot    │  │   Realtime         │  │
│  └──────────────┘  └──────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EXISTING AI CORE                              │
│                                                                  │
│  • Unified AI Context Engine (Enhanced for Teams)               │
│  • AI Reasoning Engine (Team-aware)                             │
│  • Productivity Scorer (Multi-user)                             │
│  • Real-time System (Collaborative)                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 New Files to Create

### **Backend Models**

```
server/models/
├── Team.js                    # Team entity
├── ProjectMember.js           # Project membership
├── Invitation.js              # Team invitations
├── Sprint.js                  # Sprint tracking
└── TeamActivity.js            # Team activity log
```

### **Backend Services**

```
server/services/
├── teamService.js             # Team management
├── invitationService.js       # Invitation handling
├── roleService.js             # Role & permissions
├── teamAnalytics.js           # Team analytics
├── contributorTracker.js      # Contribution tracking
├── sprintAnalyzer.js          # Sprint intelligence
├── workloadBalancer.js        # Workload analysis
└── collaborativeAI.js         # Team AI features
```

### **Backend Controllers**

```
server/controllers/
├── teamController.js          # Team CRUD
├── memberController.js        # Member management
├── invitationController.js    # Invitation handling
├── teamAnalyticsController.js # Team analytics
└── sprintController.js        # Sprint management
```

### **Backend Middleware**

```
server/middleware/
├── teamAuth.js                # Team authentication
├── roleCheck.js               # Role verification
└── membershipCheck.js         # Membership validation
```

### **Backend Routes**

```
server/routes/
├── teams.js                   # Team routes
├── members.js                 # Member routes
├── invitations.js             # Invitation routes
├── teamAnalytics.js           # Analytics routes
└── sprints.js                 # Sprint routes
```

### **Frontend Components**

```
client/src/components/
├── TeamDashboard.jsx          # Team overview
├── TeamMembers.jsx            # Member list
├── InviteModal.jsx            # Invite members
├── RoleManager.jsx            # Role management
├── TeamActivityFeed.jsx       # Team activity
├── ContributorChart.jsx       # Contribution viz
├── TeamProductivity.jsx       # Team metrics
├── SprintBoard.jsx            # Sprint view
├── WorkloadChart.jsx          # Workload viz
├── TeamPresence.jsx           # Online members
└── CollaborativeCopilot.jsx   # Team AI chat
```

### **Frontend Hooks**

```
client/src/hooks/
├── useTeam.js                 # Team state
├── useTeamMembers.js          # Members state
├── useTeamActivity.js         # Team activity
└── useTeamRealtime.js         # Team realtime
```

---

## 🗄️ Database Models

### **1. Team Model**

```javascript
// server/models/Team.js
const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  description: String,

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'developer', 'viewer'],
      default: 'developer'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],

  settings: {
    allowInvitations: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    defaultRole: {
      type: String,
      enum: ['developer', 'viewer'],
      default: 'developer'
    }
  },

  stats: {
    totalProjects: {
      type: Number,
      default: 0
    },
    totalMembers: {
      type: Number,
      default: 1
    },
    activeMembers: {
      type: Number,
      default: 1
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
TeamSchema.index({ owner: 1 });
TeamSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Team', TeamSchema);
```

### **2. ProjectMember Model**

```javascript
// server/models/ProjectMember.js
const mongoose = require('mongoose');

const ProjectMemberSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  role: {
    type: String,
    enum: ['owner', 'admin', 'developer', 'viewer'],
    required: true
  },

  permissions: {
    canEdit: {
      type: Boolean,
      default: true
    },
    canDelete: {
      type: Boolean,
      default: false
    },
    canInvite: {
      type: Boolean,
      default: false
    },
    canManageMembers: {
      type: Boolean,
      default: false
    }
  },

  // Contribution tracking
  contributions: {
    tasksCompleted: {
      type: Number,
      default: 0
    },
    commitsCount: {
      type: Number,
      default: 0
    },
    linesAdded: {
      type: Number,
      default: 0
    },
    linesDeleted: {
      type: Number,
      default: 0
    },
    activeDays: {
      type: Number,
      default: 0
    },
    lastActiveAt: Date
  },

  // Productivity
  productivity: {
    overallScore: {
      type: Number,
      default: 0
    },
    dailyScore: {
      type: Number,
      default: 0
    },
    focusScore: {
      type: Number,
      default: 0
    },
    consistencyScore: {
      type: Number,
      default: 0
    }
  },

  joinedAt: {
    type: Date,
    default: Date.now
  },

  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  status: {
    type: String,
    enum: ['active', 'inactive', 'removed'],
    default: 'active'
  }
});

// Indexes
ProjectMemberSchema.index({ project: 1, user: 1 }, { unique: true });
ProjectMemberSchema.index({ user: 1 });
ProjectMemberSchema.index({ project: 1, role: 1 });

module.exports = mongoose.model('ProjectMember', ProjectMemberSchema);
```

### **3. Invitation Model**

```javascript
// server/models/Invitation.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const InvitationSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },

  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },

  role: {
    type: String,
    enum: ['admin', 'developer', 'viewer'],
    default: 'developer'
  },

  token: {
    type: String,
    required: true,
    unique: true
  },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending'
  },

  expiresAt: {
    type: Date,
    required: true
  },

  acceptedAt: Date,
  declinedAt: Date,

  message: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique token
InvitationSchema.pre('save', function(next) {
  if (!this.token) {
    this.token = crypto.randomBytes(32).toString('hex');
  }
  if (!this.expiresAt) {
    // Expire in 7 days
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Indexes
InvitationSchema.index({ project: 1, email: 1 });
InvitationSchema.index({ token: 1 });
InvitationSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model('Invitation', InvitationSchema);
```

---

## 🔧 Core Services

Due to length constraints, I'll create the key service structures:

### **Team Service**

```javascript
// server/services/teamService.js
class TeamService {
  async createTeam(ownerId, teamData) {
    // Create team
    // Add owner as first member
    // Return team
  }

  async addMember(teamId, userId, role, invitedBy) {
    // Verify permissions
    // Add member to team
    // Create ProjectMember records
    // Broadcast event
  }

  async removeMember(teamId, userId, removedBy) {
    // Verify permissions
    // Remove from team
    // Remove ProjectMember records
    // Broadcast event
  }

  async updateMemberRole(teamId, userId, newRole, updatedBy) {
    // Verify permissions
    // Update role
    // Update permissions
    // Broadcast event
  }

  async getTeamMembers(teamId) {
    // Get all members
    // Include user details
    // Include contributions
    // Return enriched data
  }
}
```

---

## 📊 Team Analytics

### **Contributor Tracker**

```javascript
// server/services/contributorTracker.js
class ContributorTracker {
  async trackContribution(projectId, userId, contributionData) {
    // Update ProjectMember contributions
    // Calculate productivity scores
    // Update team stats
    // Broadcast updates
  }

  async getContributorStats(projectId, userId) {
    // Get member contributions
    // Calculate percentages
    // Compare with team average
    // Return stats
  }

  async getTeamContributions(projectId) {
    // Get all member contributions
    // Rank by activity
    // Calculate team totals
    // Return leaderboard
  }
}
```

---

## 🎯 Integration with Existing Systems

### **AI Context Engine Enhancement**

```javascript
// Update: server/services/aiContextEngine.js
async buildUnifiedContext(projectId, options = {}) {
  const context = await this.buildBaseContext(projectId);
  
  // Add team context
  if (options.includeTeam) {
    context.team = await this._buildTeamContext(projectId);
  }
  
  return context;
}

async _buildTeamContext(projectId) {
  const members = await ProjectMember.find({ project: projectId });
  
  return {
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'active').length,
    roles: this._groupByRole(members),
    contributions: this._aggregateContributions(members),
    productivity: this._aggregateProductivity(members)
  };
}
```

---

**Continue to implementation files for complete code.**
