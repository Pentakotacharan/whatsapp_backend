const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

// Import Routes
const userRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const communityRoutes = require("./routes/communityRoutes");
const statusRoutes = require("./routes/statusRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();
const app = express();

// Middleware
app.use(cors({ origin: ["http://localhost:5173", "https://whatsapp-frontend-ivory.vercel.app/"] })); // Allow Vite Frontend
app.use(express.json()); // Allow JSON data

// Mount Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/status", statusRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server
const server = app.listen(PORT, console.log(`Server started on PORT ${PORT}`));

// ---------------------------------------------------------
// SOCKET.IO SETUP (Real-time Logic)
// ---------------------------------------------------------
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: ["http://localhost:5173","https://whatsapp-frontend-ivory.vercel.app/"], // Allow Vite Frontend
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  // 1. Setup User Room
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  // 2. Join Chat Room
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  // 3. Typing Indicators
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  // 4. Real-time Messages
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message received", newMessageRecieved);
    });
  });
  socket.on("mark messages read", (room) => {
    socket.in(room).emit("message read"); // Notify others in room
  });

  // 5. Real-time Status Updates
  socket.on("new status", (statusData) => {
    socket.broadcast.emit("status received", statusData);
  });

  // 6. Real-time Group Creation
  socket.on("new group", (groupData) => {
    groupData.users.forEach((user) => {
       if (user._id === groupData.groupAdmin._id) return;
       socket.in(user._id).emit("refetch chats");
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});