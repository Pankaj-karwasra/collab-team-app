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

const corsOptions = {
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.IO Setup
const io = new Server(server, { cors: corsOptions });

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