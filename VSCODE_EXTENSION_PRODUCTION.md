# 💻 VS Code Extension - Production Architecture

## 📋 Overview

Transform the basic VS Code extension into a production-grade developer intelligence system that seamlessly integrates with ProjectMind.

---

## 🏗️ Extension Architecture

```
┌─────────────────────────────────────────────────────────┐
│              VS CODE EXTENSION                          │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Auth       │  │   Activity   │  │   Sync      │ │
│  │   Manager    │  │   Tracker    │  │   Manager   │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Event      │  │   Queue      │  │   Storage   │ │
│  │   Collector  │  │   Manager    │  │   Manager   │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   UI         │  │   Commands   │  │   Status    │ │
│  │   Manager    │  │   Handler    │  │   Bar       │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│              PROJECTMIND BACKEND                        │
│                                                         │
│  • JWT Authentication                                   │
│  • Activity Logging API                                 │
│  • WebSocket Connection                                 │
│  • Project Sync                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Extension Folder Structure

```
vscode-extension/
├── src/
│   ├── extension.ts              # Main entry point
│   ├── managers/
│   │   ├── AuthManager.ts        # JWT authentication
│   │   ├── SyncManager.ts        # Backend sync
│   │   ├── QueueManager.ts       # Offline queue
│   │   ├── StorageManager.ts     # Local storage
│   │   └── ProjectManager.ts     # Project detection
│   ├── trackers/
│   │   ├── ActivityTracker.ts    # Activity events
│   │   ├── EditorTracker.ts      # Editor changes
│   │   ├── FileTracker.ts        # File operations
│   │   ├── GitTracker.ts         # Git events
│   │   ├── TerminalTracker.ts    # Terminal activity
│   │   └── IdleTracker.ts        # Idle detection
│   ├── collectors/
│   │   ├── EventCollector.ts     # Event aggregation
│   │   └── SessionCollector.ts   # Session tracking
│   ├── intelligence/
│   │   ├── FocusDetector.ts      # Focus sessions
│   │   ├── HotspotAnalyzer.ts    # Code hotspots
│   │   └── StreakTracker.ts      # Coding streaks
│   ├── ui/
│   │   ├── StatusBarProvider.ts  # Status bar
│   │   ├── WebviewProvider.ts    # Webview panels
│   │   └── NotificationManager.ts# Notifications
│   ├── commands/
│   │   ├── AuthCommands.ts       # Auth commands
│   │   ├── ProjectCommands.ts    # Project commands
│   │   └── SyncCommands.ts       # Sync commands
│   ├── api/
│   │   ├── ApiClient.ts          # HTTP client
│   │   └── WebSocketClient.ts    # WS client
│   ├── types/
│   │   └── index.ts              # TypeScript types
│   └── utils/
│       ├── logger.ts             # Logging
│       ├── crypto.ts             # Encryption
│       └── helpers.ts            # Utilities
├── resources/
│   ├── icons/                    # Extension icons
│   └── webview/                  # Webview assets
├── package.json                  # Extension manifest
├── tsconfig.json                 # TypeScript config
└── README.md                     # Extension docs
```

---

## 🔧 Core Components

### **1. Authentication Manager**

```typescript
// src/managers/AuthManager.ts
import * as vscode from 'vscode';
import { StorageManager } from './StorageManager';
import { ApiClient } from '../api/ApiClient';

export class AuthManager {
  private storage: StorageManager;
  private apiClient: ApiClient;
  private token: string | null = null;

  constructor(context: vscode.ExtensionContext) {
    this.storage = new StorageManager(context);
    this.apiClient = new ApiClient();
  }

  async initialize(): Promise<boolean> {
    // Load token from secure storage
    this.token = await this.storage.getSecureToken();
    
    if (this.token) {
      // Verify token validity
      const isValid = await this.verifyToken();
      if (isValid) {
        return true;
      }
    }

    // Prompt for authentication
    return await this.promptLogin();
  }

  async promptLogin(): Promise<boolean> {
    const action = await vscode.window.showInformationMessage(
      'ProjectMind: Please sign in to track your activity',
      'Sign In',
      'Later'
    );

    if (action === 'Sign In') {
      return await this.showLoginWebview();
    }

    return false;
  }

  async showLoginWebview(): Promise<boolean> {
    // Open webview for login
    // User enters email/password
    // Extension receives JWT token
    // Store token securely
    // Return success
  }

  async verifyToken(): Promise<boolean> {
    try {
      const response = await this.apiClient.get('/api/auth/verify', {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  async logout(): Promise<void> {
    this.token = null;
    await this.storage.clearSecureToken();
  }
}
```

### **2. Activity Tracker**

```typescript
// src/trackers/ActivityTracker.ts
import * as vscode from 'vscode';
import { EventCollector } from '../collectors/EventCollector';

export interface ActivityEvent {
  type: 'edit' | 'save' | 'open' | 'close' | 'focus' | 'terminal' | 'git';
  file: string;
  timestamp: number;
  metadata?: any;
}

export class ActivityTracker {
  private collector: EventCollector;
  private disposables: vscode.Disposable[] = [];

  constructor(collector: EventCollector) {
    this.collector = collector;
  }

  start(): void {
    // Track document changes (edits)
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.contentChanges.length > 0) {
          this.collector.addEvent({
            type: 'edit',
            file: e.document.fileName,
            timestamp: Date.now(),
            metadata: {
              changes: e.contentChanges.length,
              language: e.document.languageId
            }
          });
        }
      })
    );

    // Track document saves
    this.disposables.push(
      vscode.workspace.onDidSaveTextDocument((doc) => {
        this.collector.addEvent({
          type: 'save',
          file: doc.fileName,
          timestamp: Date.now(),
          metadata: {
            language: doc.languageId,
            lineCount: doc.lineCount
          }
        });
      })
    );

    // Track document opens
    this.disposables.push(
      vscode.workspace.onDidOpenTextDocument((doc) => {
        this.collector.addEvent({
          type: 'open',
          file: doc.fileName,
          timestamp: Date.now()
        });
      })
    );

    // Track document closes
    this.disposables.push(
      vscode.workspace.onDidCloseTextDocument((doc) => {
        this.collector.addEvent({
          type: 'close',
          file: doc.fileName,
          timestamp: Date.now()
        });
      })
    );

    // Track active editor changes
    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
          this.collector.addEvent({
            type: 'focus',
            file: editor.document.fileName,
            timestamp: Date.now()
          });
        }
      })
    );
  }

  stop(): void {
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
  }
}
```

### **3. Sync Manager**

```typescript
// src/managers/SyncManager.ts
import { ApiClient } from '../api/ApiClient';
import { QueueManager } from './QueueManager';
import { AuthManager } from './AuthManager';
import { ActivityEvent } from '../trackers/ActivityTracker';

export class SyncManager {
  private apiClient: ApiClient;
  private queueManager: QueueManager;
  private authManager: AuthManager;
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline: boolean = true;

  constructor(
    apiClient: ApiClient,
    queueManager: QueueManager,
    authManager: AuthManager
  ) {
    this.apiClient = apiClient;
    this.queueManager = queueManager;
    this.authManager = authManager;
  }

  start(): void {
    // Sync every 30 seconds
    this.syncInterval = setInterval(() => {
      this.syncEvents();
    }, 30000);

    // Monitor online status
    this.monitorConnection();
  }

  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncEvents(): Promise<void> {
    if (!this.isOnline) {
      console.log('[Sync] Offline - queuing events');
      return;
    }

    const token = this.authManager.getToken();
    if (!token) {
      console.log('[Sync] Not authenticated');
      return;
    }

    // Get queued events
    const events = await this.queueManager.getEvents();
    if (events.length === 0) {
      return;
    }

    try {
      // Batch send events
      await this.apiClient.post('/api/activity/batch', {
        events
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Clear sent events
      await this.queueManager.clearEvents(events.map(e => e.id));
      
      console.log(`[Sync] Sent ${events.length} events`);
    } catch (error) {
      console.error('[Sync] Failed:', error);
      // Events remain in queue for retry
    }
  }

  private monitorConnection(): void {
    // Check connection periodically
    setInterval(async () => {
      try {
        await this.apiClient.get('/api/health');
        this.isOnline = true;
      } catch {
        this.isOnline = false;
      }
    }, 10000);
  }
}
```

---

## 📦 Implementation Files

Due to length constraints, I'll create separate detailed files for each component.

See:
- `VSCODE_EXTENSION_COMPONENTS.md` - All component implementations
- `VSCODE_EXTENSION_SETUP.md` - Setup and configuration
- `VSCODE_EXTENSION_DEPLOYMENT.md` - Publishing guide

---

## 🚀 Key Features

### **Seamless Authentication**
- JWT-based auth
- Secure token storage
- Auto-refresh
- Webview login

### **Rich Activity Tracking**
- Edit events
- Save events
- File operations
- Git commits
- Terminal activity
- Focus changes

### **Offline Support**
- Local event queue
- Automatic retry
- Batch sync
- Connection monitoring

### **Intelligence Features**
- Focus session detection
- Coding streak tracking
- Implementation hotspots
- Active module inference

### **Professional UI**
- Status bar integration
- Command palette
- Notifications
- Settings panel

---

**Continue to component files for complete implementation.**
