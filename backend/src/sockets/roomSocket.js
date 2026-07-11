import Room from '../models/Room.js';
import User from '../models/User.js';
import { verifyToken } from '../utils/token.js';

export function registerRoomSockets(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No auth token'));
      const payload = verifyToken(token);
      const user = await User.findById(payload.sub);
      if (!user) return next(new Error('User not found'));
      socket.userId = user._id.toString();
      socket.username = user.username;
      socket.avatar = user.avatar;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    let currentRoomCode = null;

    socket.on('room:join', async ({ code }) => {
      try {
        const room = await Room.findOne({ code: code?.toUpperCase() });
        if (!room) return socket.emit('room:error', { message: 'Room not found' });

        currentRoomCode = room.code;
        socket.join(room.code);

        const already = room.members.find((m) => String(m.user) === socket.userId);
        if (!already) {
          if (room.members.length >= room.maxPlayers) return socket.emit('room:error', { message: 'Room is full' });
          room.members.push({ user: socket.userId, username: socket.username, avatar: socket.avatar, score: 0, status: 'ready' });
          room.messages.push({ sys: true, msg: `${socket.username} joined the room` });
          await room.save();
        }

        io.to(room.code).emit('room:state', room.toObject());
        socket.to(room.code).emit('room:toast', { message: `${socket.username} joined the room` });
      } catch (err) {
        socket.emit('room:error', { message: 'Failed to join room' });
      }
    });

    socket.on('room:chat', async ({ code, msg }) => {
      if (!msg || !msg.trim()) return;
      try {
        const room = await Room.findOne({ code: code?.toUpperCase() });
        if (!room) return;
        const entry = { sys: false, username: socket.username, msg: msg.trim().slice(0, 300), at: new Date() };
        room.messages.push(entry);
        await room.save();
        io.to(room.code).emit('room:chat', entry);
      } catch (err) {
        socket.emit('room:error', { message: 'Failed to send message' });
      }
    });

    socket.on('room:score', async ({ code, score }) => {
      try {
        const room = await Room.findOne({ code: code?.toUpperCase() });
        if (!room) return;
        const member = room.members.find((m) => String(m.user) === socket.userId);
        if (member) {
          member.score = score;
          await room.save();
          io.to(room.code).emit('room:state', room.toObject());
        }
      } catch (err) {
        // silent - score sync is best-effort
      }
    });

    socket.on('room:start', async ({ code }) => {
      try {
        const room = await Room.findOne({ code: code?.toUpperCase() });
        if (!room) return;
        room.status = 'active';
        await room.save();
        io.to(room.code).emit('room:started', { cat: room.cat });
      } catch (err) {
        socket.emit('room:error', { message: 'Failed to start game' });
      }
    });

    socket.on('disconnect', () => {
      if (currentRoomCode) socket.to(currentRoomCode).emit('room:toast', { message: `${socket.username} disconnected` });
    });
  });
}
