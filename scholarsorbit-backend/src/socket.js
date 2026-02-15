import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import ChatRoom from './models/ChatRoom.js';
import DirectMessage from './models/DirectMessage.js';

// userId → Set<socketId>
const onlineUsers = new Map();

function getRoomId(userA, userB) {
  return [userA, userB].sort().join('_');
}

export default function initSocket(httpServer, corsOptions) {
  const io = new Server(httpServer, { cors: corsOptions });

  // Auth middleware — verify JWT on every connection
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
      // Broadcast to everyone that this user came online
      socket.broadcast.emit('user_online', userId);
    }
    onlineUsers.get(userId).add(socket.id);

    // Send current online user list to the newly connected client
    socket.emit('online_users', [...onlineUsers.keys()]);

    // Join personal room for targeted events
    socket.join(`user:${userId}`);

    // ---- JOIN PRIVATE ROOM ----
    socket.on('join_private_room', async ({ targetUserId }, ack) => {
      try {
        const roomId = getRoomId(userId, targetUserId);
        socket.join(roomId);

        // Upsert chat room in DB
        await ChatRoom.findOneAndUpdate(
          { roomId },
          {
            roomId,
            type: 'private',
            $addToSet: { participants: { $each: [userId, targetUserId] } },
          },
          { upsert: true, new: true }
        );

        if (ack) ack({ roomId });
      } catch (err) {
        console.error('join_private_room error:', err);
        if (ack) ack({ error: 'Failed to join room' });
      }
    });

    // ---- SEND MESSAGE ----
    socket.on('send_message', async ({ roomId, content }, ack) => {
      try {
        if (!content || !content.trim() || !roomId) {
          if (ack) ack({ error: 'Invalid message' });
          return;
        }

        // Verify sender is a participant
        const room = await ChatRoom.findOne({ roomId, participants: userId });
        if (!room) {
          if (ack) ack({ error: 'Not a participant' });
          return;
        }

        const message = await DirectMessage.create({
          roomId,
          senderId: userId,
          content: content.trim(),
          readBy: [userId],
        });

        const populated = {
          _id: message._id,
          roomId: message.roomId,
          senderId: message.senderId,
          content: message.content,
          createdAt: message.createdAt,
        };

        // Emit to everyone in the room (including sender)
        io.to(roomId).emit('receive_message', populated);
        if (ack) ack({ message: populated });
      } catch (err) {
        console.error('send_message error:', err);
        if (ack) ack({ error: 'Failed to send' });
      }
    });

    // ---- TYPING ----
    socket.on('typing_start', ({ roomId }) => {
      socket.to(roomId).emit('user_typing', { userId, typing: true });
    });

    socket.on('typing_stop', ({ roomId }) => {
      socket.to(roomId).emit('user_typing', { userId, typing: false });
    });

    // ---- DISCONNECT ----
    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('user_offline', userId);
        }
      }
    });
  });

  return io;
}
