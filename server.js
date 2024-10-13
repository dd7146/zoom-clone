const express = require('express');         // Express framework
const http = require('http');               // HTTP server
const { v4: uuidV4 } = require('uuid');     // For generating unique room IDs
const socket = require('socket.io');        // Real-time communication with Socket.io

const app = express();                      // Create an Express application
const server = http.createServer(app);      // Create an HTTP server using Express
const io = socket(server);                  // Bind Socket.io to the server

app.set('view engine', 'ejs');              // Set EJS as the template engine
app.use(express.static('public'));          // Serve static files from the 'public' folder

// Home route: Redirect to a new unique room
app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`);             // Generate and redirect to a unique room ID
});

// Room route: Render the room with the dynamic room ID
app.get('/:room', (req, res) => {
  res.render('index', { roomId: req.params.room });   // Pass roomId to the EJS template
});

// Socket.io connection for real-time communication
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);                    // Join the user to the specified room
    socket.broadcast.to(roomId).emit('user-connected', userId);   // Notify others in the room

    // Handle user disconnection
    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId);  // Notify when user disconnects
    });
  });
});

// Start the server on port 3000
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
