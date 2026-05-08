require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
const http     = require('http');
const { Server } = require('socket.io');

// Load models
require('./models/User');
require('./models/Project');
require('./models/Task');
require('./models/ActivityLog');
require('./models/TaskMapping');
require('./models/ProjectMember');
require('./models/TeamInvitation');
require('./models/TaskActivity');

const app  = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Initialize realtime event broadcaster
const realtimeEventBroadcaster = require('./services/realtimeEventBroadcaster');
realtimeEventBroadcaster.initialize(io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('[Socket.IO] Client connected:', socket.id);

  // Store user info
  socket.userId = null;
  socket.projectId = null;

  // Authenticate socket connection
  socket.on('authenticate', (data) => {
    socket.userId = data.userId;
    console.log(`[Socket.IO] User ${data.userId} authenticated on socket ${socket.id}`);
  });

  // Join project room
  socket.on('join:project', (projectId) => {
    // Leave previous project room if any
    if (socket.projectId) {
      socket.leave(`project:${socket.projectId}`);
    }

    socket.projectId = projectId;
    socket.join(`project:${projectId}`);
    
    console.log(`[Socket.IO] Client ${socket.id} joined project:${projectId}`);

    // Broadcast user presence
    if (socket.userId) {
      realtimeEventBroadcaster.broadcastUserPresence(projectId, socket.userId, 'online');
    }

    // Send current connected clients count
    const clientsCount = realtimeEventBroadcaster.getConnectedClients(projectId);
    socket.emit('project:clients', { count: clientsCount });
  });

  // Leave project room
  socket.on('leave:project', (projectId) => {
    socket.leave(`project:${projectId}`);
    console.log(`[Socket.IO] Client ${socket.id} left project:${projectId}`);

    // Broadcast user presence
    if (socket.userId) {
      realtimeEventBroadcaster.broadcastUserPresence(projectId, socket.userId, 'offline');
    }

    socket.projectId = null;
  });

  // Typing indicator
  socket.on('typing:start', () => {
    if (socket.projectId && socket.userId) {
      realtimeEventBroadcaster.broadcastTyping(socket.projectId, socket.userId, true);
    }
  });

  socket.on('typing:stop', () => {
    if (socket.projectId && socket.userId) {
      realtimeEventBroadcaster.broadcastTyping(socket.projectId, socket.userId, false);
    }
  });

  // Request real-time updates
  socket.on('request:productivity', async (projectId) => {
    try {
      const productivityScorer = require('./services/productivityScorer');
      const metrics = await productivityScorer.getProductivityReport(projectId, 7);
      socket.emit('productivity:update', { data: metrics, timestamp: new Date() });
    } catch (err) {
      console.error('[Socket.IO] Productivity request error:', err.message);
    }
  });

  socket.on('request:insights', async (projectId) => {
    try {
      const insightGenerator = require('./services/insightGenerator');
      const Project = require('./models/Project');
      const project = await Project.findById(projectId);
      if (project) {
        const insights = await insightGenerator.generateInsights(projectId, project.name);
        socket.emit('ai:insight', { data: insights, timestamp: new Date() });
      }
    } catch (err) {
      console.error('[Socket.IO] Insights request error:', err.message);
    }
  });

  // Heartbeat for connection monitoring
  socket.on('heartbeat', () => {
    socket.emit('heartbeat:ack', { timestamp: Date.now() });
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('[Socket.IO] Client disconnected:', socket.id);

    // Broadcast user offline
    if (socket.projectId && socket.userId) {
      realtimeEventBroadcaster.broadcastUserPresence(socket.projectId, socket.userId, 'offline');
    }
  });
});

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/copilot', require('./routes/copilot'));
app.use('/api/ai', require('./routes/aiFeatures'));
app.use('/api/ai', require('./routes/aiProvider'));
app.use('/api/github', require('./routes/github'));
app.use('/api/tasks', require('./routes/taskExecution'));
app.use('/api/team', require('./routes/team'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ProjectMind server is running',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    socketio: 'active'
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    
    // Initialize AI Provider system
    const aiProvider = require('./services/aiProvider');
    await aiProvider.initialize();
    
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('Socket.IO ready for real-time updates');
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });