require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const app = express();
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");
const { adminBro, adminRoute } = require("./config/adminBro");
//socket
const socketio = require("socket.io");

app.use(adminBro.options.rootPath, adminRoute);

var corsOptions = {
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "your-secret-key",
    resave: false, // add this line to define the resave option
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

connectDB();

app.get("/", (req, res, next) => {
  res.send("Fitnest api running!");
});

// Connecting Routes

app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/question", require("./routes/question"));
app.use("/api/meal-plan", require("./routes/mealPlan"));
app.use("/api/workout", require("./routes/workout"));

app.use("/api/chat", require("./routes/chat"));
app.use("/api/message", require("./routes/message"));

// For Admin
app.use("/api/admin/user", require("./routes/admin/user"));
app.use("/api/gym", require("./routes/gym"));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`Sever running on port ${PORT}`)
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Logged Error: ${err.message}`);
  server.close(() => process.exit(1));
});

const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  //connected to correct id
  socket.on("setup", (userData) => {
    socket.join(userData._id);

    socket.emit("connected");
  });

  socket.on("join-chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop-typing", (room) => socket.in(room).emit("stop-typing"));

  socket.on("new-message", (newMessageReceived) => {
    let chat = newMessageReceived.chat;

    if (!chat.users) return console.log(`chat.users not defined`);

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message-received", newMessageReceived);
    });
  });

  socket.off("setup", () => {
    socket.leave(userData._id);
  });
});
