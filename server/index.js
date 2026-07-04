import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  submitChoice,
  submitSwap,
  resolvePoisonChoice,
  resolveSecretTunnelOrder,
  resolveRiotChoice,
  resolveReinforcementsChoice,
  publicState,
} from './game/gameEngine.js';
import {
  createRoom,
  joinRoom,
  getRoom,
  attachSocket,
  detachSocket,
  findSeatBySocket,
  broadcastState,
  resetRoomGame,
  listPublicRooms,
} from './rooms.js';

const PORT = process.env.PORT || 4000;
// Comma-separated list, e.g. "http://localhost:5173,https://your-app.vercel.app"
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();
app.use(cors({ origin: CLIENT_ORIGINS }));
app.get('/health', (req, res) => res.json({ ok: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: CLIENT_ORIGINS } });

function seatContext(socket) {
  const found = findSeatBySocket(socket.id);
  if (!found) return null;
  const room = getRoom(found.roomId);
  if (!room) return null;
  return { ...found, room };
}

io.on('connection', (socket) => {
  socket.on('room:create', ({ name, side, token, visibility }, ack) => {
    try {
      if (!['prisoners', 'guards'].includes(side)) throw new Error('Invalid side');
      const roomId = createRoom(side, name?.trim() || 'Player', token, visibility);
      attachSocket(roomId, side, socket.id);
      socket.join(roomId);
      ack?.({ ok: true, roomId, side });
      broadcastState(io, roomId);
    } catch (err) {
      ack?.({ ok: false, reason: err.message });
    }
  });

  socket.on('lobby:list', (_payload, ack) => {
    ack?.({ ok: true, rooms: listPublicRooms() });
  });

  socket.on('room:join', ({ roomId, name, token, preferredSide }, ack) => {
    const result = joinRoom(roomId?.trim().toUpperCase(), name?.trim() || 'Player', token, preferredSide);
    if (!result.ok) {
      ack?.(result);
      return;
    }
    attachSocket(roomId.trim().toUpperCase(), result.side, socket.id);
    socket.join(roomId.trim().toUpperCase());
    const room = getRoom(roomId.trim().toUpperCase());
    if (room.game.players.prisoners?.connected && room.game.players.guards?.connected && room.game.status === 'waiting_for_players') {
      room.game.status = 'choosing';
    }
    ack?.({ ok: true, roomId: roomId.trim().toUpperCase(), side: result.side });
    broadcastState(io, roomId.trim().toUpperCase());
  });

  socket.on('game:chooseUnit', ({ unitClass, disguiseAs }, ack) => {
    const ctx = seatContext(socket);
    if (!ctx) return ack?.({ ok: false, reason: 'not_seated' });
    try {
      submitChoice(ctx.room.game, ctx.side, unitClass, disguiseAs);
      ack?.({ ok: true });
      broadcastState(io, ctx.roomId);
    } catch (err) {
      ack?.({ ok: false, reason: err.message });
    }
  });

  socket.on('game:swap', ({ unitClass }, ack) => {
    const ctx = seatContext(socket);
    if (!ctx) return ack?.({ ok: false, reason: 'not_seated' });
    try {
      submitSwap(ctx.room.game, ctx.side, unitClass || null);
      ack?.({ ok: true });
      broadcastState(io, ctx.roomId);
    } catch (err) {
      ack?.({ ok: false, reason: err.message });
    }
  });

  socket.on('game:poisonChoice', ({ chosenClass }, ack) => {
    const ctx = seatContext(socket);
    if (!ctx) return ack?.({ ok: false, reason: 'not_seated' });
    if (ctx.side !== 'guards') return ack?.({ ok: false, reason: 'not_your_choice' });
    try {
      resolvePoisonChoice(ctx.room.game, chosenClass);
      ack?.({ ok: true });
      broadcastState(io, ctx.roomId);
    } catch (err) {
      ack?.({ ok: false, reason: err.message });
    }
  });

  socket.on('game:secretTunnelOrder', ({ order }, ack) => {
    const ctx = seatContext(socket);
    if (!ctx) return ack?.({ ok: false, reason: 'not_seated' });
    if (ctx.side !== 'prisoners') return ack?.({ ok: false, reason: 'not_your_choice' });
    try {
      resolveSecretTunnelOrder(ctx.room.game, order);
      ack?.({ ok: true });
      broadcastState(io, ctx.roomId);
    } catch (err) {
      ack?.({ ok: false, reason: err.message });
    }
  });

  socket.on('game:riotChoice', ({ guardClass }, ack) => {
    const ctx = seatContext(socket);
    if (!ctx) return ack?.({ ok: false, reason: 'not_seated' });
    if (ctx.side !== 'prisoners') return ack?.({ ok: false, reason: 'not_your_choice' });
    try {
      resolveRiotChoice(ctx.room.game, guardClass);
      ack?.({ ok: true });
      broadcastState(io, ctx.roomId);
    } catch (err) {
      ack?.({ ok: false, reason: err.message });
    }
  });

  socket.on('game:reinforcementsChoice', ({ prisonerClass }, ack) => {
    const ctx = seatContext(socket);
    if (!ctx) return ack?.({ ok: false, reason: 'not_seated' });
    if (ctx.side !== 'prisoners') return ack?.({ ok: false, reason: 'not_your_choice' });
    try {
      resolveReinforcementsChoice(ctx.room.game, prisonerClass);
      ack?.({ ok: true });
      broadcastState(io, ctx.roomId);
    } catch (err) {
      ack?.({ ok: false, reason: err.message });
    }
  });

  socket.on('game:rematch', (_payload, ack) => {
    const ctx = seatContext(socket);
    if (!ctx) return ack?.({ ok: false, reason: 'not_seated' });
    resetRoomGame(ctx.roomId);
    ack?.({ ok: true });
    broadcastState(io, ctx.roomId);
  });

  socket.on('disconnect', () => {
    const ctx = seatContext(socket);
    if (!ctx) return;
    detachSocket(ctx.roomId, ctx.side);
    broadcastState(io, ctx.roomId);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Prison Escape server listening on http://localhost:${PORT}`);
});
