const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Import Routes
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const messageRoutes = require('./routes/messages');
const teamRoutes = require('./routes/teams');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin'); 

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// --- FIXED CORS SETUP ---
// 1. Define all allowed domains (Localhost + Your Vercel Links)
const allowedOrigins = [
  "http://localhost:5173",
  "https://collab-team-lrrjjxs2z-pankaj-karwasras-projects.vercel.app", // Your preview link
  "https://collab-team-app.vercel.app" // Your main production link (optional but recommended)
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.IO Setup with FIXED CORS
const io = new Server(server, { 
  cors: {
    origin: allowedOrigins, // Use the same list here
    methods: ["GET", "POST"],
    credentials: true
  } 
});

// Middleware: Attach IO to every request
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);
  
  socket.on('join_team', (teamId) => {
    socket.join(teamId);
    console.log(`Socket ${socket.id} joined team: ${teamId}`);
  });
});

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});