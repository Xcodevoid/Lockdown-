import { customAlphabet } from 'nanoid';
import { createGame, publicState } from './game/gameEngine.js';

const makeRoomId = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 5); // no 0/O/1/I to avoid confusion

// roomId -> {
//   game,
//   seats: { prisoners: { token, name, socketId }, guards: { token, name, socketId } }
// }
const rooms = new Map();

export function createRoom(side, name, token) {
  let roomId = makeRoomId();
  while (rooms.has(roomId)) roomId = makeRoomId();

  const room = {
    game: createGame(roomId),
    seats: { prisoners: null, guards: null },
  };
  room.seats[side] = { token, name, socketId: null };
  room.game.players[side] = { name, connected: false };
  rooms.set(roomId, room);
  return roomId;
}

export function getRoom(roomId) {
  return rooms.get(roomId);
}

// Attempts to seat (or reseat, via matching token) a player into a room.
// Returns { ok: true, side } or { ok: false, reason }.
export function joinRoom(roomId, name, token, preferredSide) {
  const room = rooms.get(roomId);
  if (!room) return { ok: false, reason: 'room_not_found' };

  for (const side of ['prisoners', 'guards']) {
    if (room.seats[side] && room.seats[side].token === token) {
      room.seats[side].socketId = null;
      room.seats[side].name = name;
      room.game.players[side] = { name, connected: false };
      return { ok: true, side };
    }
  }

  const openSides = ['prisoners', 'guards'].filter((s) => !room.seats[s]);
  if (openSides.length === 0) return { ok: false, reason: 'room_full' };

  const side = preferredSide && openSides.includes(preferredSide) ? preferredSide : openSides[0];
  room.seats[side] = { token, name, socketId: null };
  room.game.players[side] = { name, connected: false };
  return { ok: true, side };
}

export function attachSocket(roomId, side, socketId) {
  const room = rooms.get(roomId);
  if (!room) return;
  room.seats[side].socketId = socketId;
  room.game.players[side].connected = true;
}

export function detachSocket(roomId, side) {
  const room = rooms.get(roomId);
  if (!room) return;
  if (room.seats[side]) room.seats[side].socketId = null;
  if (room.game.players[side]) room.game.players[side].connected = false;
}

export function findSeatBySocket(socketId) {
  for (const [roomId, room] of rooms.entries()) {
    for (const side of ['prisoners', 'guards']) {
      if (room.seats[side]?.socketId === socketId) return { roomId, side };
    }
  }
  return null;
}

export function broadcastState(io, roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  for (const side of ['prisoners', 'guards']) {
    const seat = room.seats[side];
    if (seat && seat.socketId) {
      io.to(seat.socketId).emit('state:update', publicState(room.game, side));
    }
  }
}

export function resetRoomGame(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  const oldPlayers = room.game.players;
  room.game = createGame(roomId);
  room.game.players = oldPlayers;
  room.game.status = 'choosing';
}

// Housekeeping: drop rooms that have had nobody connected for a while.
setInterval(() => {
  const now = Date.now();
  for (const [roomId, room] of rooms.entries()) {
    const anyConnected = ['prisoners', 'guards'].some((s) => room.seats[s]?.socketId);
    if (!anyConnected) {
      room.emptySince = room.emptySince || now;
      if (now - room.emptySince > 1000 * 60 * 60 * 6) rooms.delete(roomId); // 6h
    } else {
      room.emptySince = null;
    }
  }
}, 1000 * 60 * 30).unref();
