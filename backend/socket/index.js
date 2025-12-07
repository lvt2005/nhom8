const db = require('../models');
const GameRoom = db.GameRoom;
const User = db.User;

let queue = []; // Simple in-memory queue: [{ socketId, userId, username }]
let activeRooms = {}; // { roomId: { player1: { socketId, choice }, player2: { socketId, choice } } }

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join_queue', async (userData) => {
      // userData should contain userId and username
      console.log('User joined queue:', userData.username);
      
      // Check if user is already in queue
      const existing = queue.find(u => u.userId === userData.userId);
      if (existing) {
          // Update socket id if reconnected? Or just ignore.
          existing.socketId = socket.id;
          return;
      }

      queue.push({ socketId: socket.id, userId: userData.userId, username: userData.username });

      if (queue.length >= 2) {
        const player1 = queue.shift();
        const player2 = queue.shift();

        // Create GameRoom in DB
        try {
          const room = await GameRoom.create({
            player1Id: player1.userId,
            player2Id: player2.userId,
            status: 'playing'
          });

          const roomId = room.id;

          // Join sockets to room
          const socket1 = io.sockets.sockets.get(player1.socketId);
          const socket2 = io.sockets.sockets.get(player2.socketId);

          if (socket1) socket1.join(`room_${roomId}`);
          if (socket2) socket2.join(`room_${roomId}`);

          // Initialize active room state
          activeRooms[roomId] = {
            player1: { ...player1, choice: null },
            player2: { ...player2, choice: null }
          };

          // Emit matched event
          io.to(`room_${roomId}`).emit('matched', {
            roomId,
            player1: player1.username,
            player2: player2.username
          });

          console.log(`Match created: Room ${roomId} (${player1.username} vs ${player2.username})`);

        } catch (err) {
          console.error('Error creating game room:', err);
        }
      }
    });

    socket.on('player_choice', async ({ roomId, choice, userId }) => {
      console.log(`Player ${userId} chose ${choice} in room ${roomId}`);
      
      const roomState = activeRooms[roomId];
      if (!roomState) return;

      if (roomState.player1.userId === userId) {
        roomState.player1.choice = choice;
      } else if (roomState.player2.userId === userId) {
        roomState.player2.choice = choice;
      }

      // Check if both chose
      if (roomState.player1.choice && roomState.player2.choice) {
        const p1Choice = roomState.player1.choice;
        const p2Choice = roomState.player2.choice;
        let result = '';
        let winnerId = null;

        // Logic: Rock, Paper, Scissors
        // Assume: 'rock', 'paper', 'scissors'
        if (p1Choice === p2Choice) {
          result = 'draw';
        } else if (
          (p1Choice === 'rock' && p2Choice === 'scissors') ||
          (p1Choice === 'scissors' && p2Choice === 'paper') ||
          (p1Choice === 'paper' && p2Choice === 'rock')
        ) {
          result = 'p1_win';
          winnerId = roomState.player1.userId;
        } else {
          result = 'p2_win';
          winnerId = roomState.player2.userId;
        }

        // Update DB (Optional: update points)
        if (winnerId) {
             await User.increment('points', { by: 1, where: { id: winnerId }});
        }

        // Emit result
        io.to(`room_${roomId}`).emit('round_result', {
          player1: { id: roomState.player1.userId, choice: p1Choice },
          player2: { id: roomState.player2.userId, choice: p2Choice },
          result,
          winnerId
        });

        // Reset choices for next round
        roomState.player1.choice = null;
        roomState.player2.choice = null;
        
        // Save round result to DB if needed (omitted for simplicity as per prompt "Lưu kết quả (nếu cần)")
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Remove from queue if present
      queue = queue.filter(u => u.socketId !== socket.id);
    });
  });
};
