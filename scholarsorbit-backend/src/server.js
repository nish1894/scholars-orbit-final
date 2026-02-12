import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import noteRoutes from './routes/notes.js';
import chatRoutes from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

// Middleware
app.use(
  cors({
    //only request from this frontend allowed
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// Routes

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/chat', chatRoutes);

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
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
