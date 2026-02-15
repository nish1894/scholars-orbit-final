import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import noteRoutes from './routes/notes.js';
import chatRoutes from './routes/chat.js';
import suggestionRoutes from './routes/suggestions.js';
import resourceRoutes from './routes/resources.js';
import dmRoutes from './routes/dm.js';
import initSocket from './socket.js';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

const allowedOrigins = (
  process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((s) => s.trim())
    : []
);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (
      origin === "http://localhost:5173" ||
      origin === "https://scholars-orbit.vercel.app" ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/dm', dmRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: 'Internal server error' });
});

// Initialize Socket.IO on the HTTP server
initSocket(server, corsOptions);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
