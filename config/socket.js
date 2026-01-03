// config/socket.js
const socketIO = require("socket.io");

const initSocket = (server) => {
  const io = socketIO(server, {
    pingTimeout: 60000, // Close connection if no ping for 60s to save bandwidth
    cors: {
      origin: "https://whatsapp-frontend-ivory.vercel.app", // Allow connection from frontend
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    // 1. Setup: User joins their own room based on User ID
    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
    });

    // 2. Join Chat: User enters a specific chat room
    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });

    // 3. Typing Indicators
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    // 4. New Message: Broadcast to everyone in that chat room
    socket.on("new message", (newMessageRecieved) => {
      var chat = newMessageRecieved.chat;

      if (!chat.users) return console.log("chat.users not defined");

      chat.users.forEach((user) => {
        // Don't send the message back to the sender
        if (user._id == newMessageRecieved.sender._id) return;

        // Send to the specific user's room
        socket.in(user._id).emit("message received", newMessageRecieved);
      });
    });

    // 5. Cleanup
    socket.on("disconnect", () => {
      console.log("USER DISCONNECTED");
    });
  });
  
  return io;
};

module.exports = initSocket;