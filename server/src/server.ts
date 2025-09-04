import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { initDatabase } from './database';
import { contentRoutes } from './routes/content';
import { detectContentType } from './contentParser';

export const startServer = async () => {
  const app = express();
 const server = http.createServer(app);
  
  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../../client/build')));
 app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  
  // Initialize database
  await initDatabase();
  
  // Socket.IO setup
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  
  // Store IO instance for use in routes
  app.set('io', io);
  
  // Routes
  app.use('/api/content', contentRoutes(io, detectContentType));
  
  // Serve React app for all other routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
  });
  
  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('User connected');
    
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
  
  const PORT = process.env.PORT || 3001;
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};
