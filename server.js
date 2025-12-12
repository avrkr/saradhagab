require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Allow all for now or specific frontend
  credentials: true
}));
app.use(helmet());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);


app.get('/', (req, res) => {
  res.send('Saradhaga Backend is running');
}); 

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ["GET", "POST"]
  }
});

const socketToRoom = {};
const socketToUser = {}; // Map socket.id to user object

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-room', (roomId, user) => {
    socket.join(roomId);
    socketToRoom[socket.id] = roomId;
    socketToUser[socket.id] = user; // Store user info
    
    // Get all other users in the room
    const usersInRoom = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
      .filter(id => id !== socket.id)
      .map(id => ({
        socketId: id,
        user: socketToUser[id]
      }));

    socket.emit('all-users', usersInRoom);
  });

  socket.on('sending-signal', (payload) => {
    const callerID = socket.id;
    io.to(payload.userToSignal).emit('user-joined', { 
      signal: payload.signal, 
      callerID: callerID,
      callerUser: socketToUser[callerID] // Send caller info
    });
  });

  socket.on('returning-signal', (payload) => {
    io.to(payload.callerID).emit('receiving-returned-signal', { signal: payload.signal, id: socket.id });
  });

  socket.on('send-message', (message) => {
    const roomId = socketToRoom[socket.id];
    if (roomId) {
      io.to(roomId).emit('new-message', message);
    }
  });

  socket.on('react-message', (data) => {
    const roomId = socketToRoom[socket.id];
    if (roomId) {
      io.to(roomId).emit('react-message', data);
    }
  });

  socket.on('hype-room', (roomId) => {
    io.to(roomId).emit('hype-room');
  });

  socket.on('disconnect', () => {
    const roomId = socketToRoom[socket.id];
    if (roomId) {
      socket.to(roomId).emit('user-left', socket.id);
      delete socketToRoom[socket.id];
      delete socketToUser[socket.id];
    }
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
