// const express = require("express");
// const app = express();
// const http = require("http");
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//     allowedHeaders: ["my-custom-header"],
//     credentials: true,
//   },
// });
// const cors = require("cors");

// app.use(cors({ origin: "*" }));

// app.get("/", (req, res) => {
//   res.send("kl");
// });

// io.on("connection", (socket) => {
//   console.log("a user connected");
//   socket.on("chat message", (msg) => {
//     // console.log("message: " + msg);
//     io.to("kl").emit("message", msg);
//   });
//   socket.on("join", (room) => {
//     socket.join(room);
//     console.log("Вход");
//   });
// });

// server.listen(5000, () => {
//   console.log("listening on *:5000");
// });

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

mongoose
  .connect("mongodb://127.0.0.1:27017/", {
    dbName: "chat",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to yourDB-name database"))
  .catch((err) => console.log(err));

// Schema for posts of app
const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    //required: true,
    default: "netu",
    // unique: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
const UserSchema = new mongoose.Schema({
  login: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  rooms: [
    {
      type: String,
    },
  ],
});
const Posts = mongoose.model("karp", PostSchema); //posts
const Users = mongoose.model("users", UserSchema);
async function cazan() {
  const posts = await Posts.find();
  console.log(posts);
}
app.use(express.json());
const cors = require("cors");

app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.send("kl");
});

app.post("/api/registration", async (req, res) => {
  try {
    const users = new Users(req.body);
    console.log("users", req.body);
    let result = await users.save();
    result = result.toObject();
    if (result) {
      delete result.password;
      res.send(req.body);
      console.log(result);
    } else {
      console.log("Posts already register");
    }
  } catch (e) {
    res.send("Something Went Wrong");
  }
});

app.get("/api/getUser", ({ query: { login, password } }, res) => {
  Users.findOne({ login, password }).then((user) => {
    if (user !== null) {
      res.json(user);
      // console.log(user)
      // res.json(true);
    } else {
      res.json(false);
    }
  });
  console.log(login, password);
});

app.post("/api/users/rooms", (req, res) => {
  const { myLogin, hisLogin, room } = req.body; // Получение ID пользователя из URL
  // const { room } = req.body; // Получение значения комнаты из тела запроса
  console.log(myLogin, hisLogin, room);

  Users.findOne({ login: myLogin }).then(async (user) => {
    if (user) {
      user.rooms.push(room); // Добавление значения комнаты в массив rooms
      let result = await user.save();
      console.log(result);
    } else {
      res.status(404).json({ error: "Пользователь не найден" });
    }
  });

  Users.findOne({ login: hisLogin }).then(async (user) => {
    if (user) {
      user.rooms.push(room); // Добавление значения комнаты в массив rooms
      let result = await user.save();
      console.log(result);
    } else {
      res.status(404).json({ error: "Пользователь не найден" });
    }
  });
});

io.on("connection", (socket) => {
  console.log("a user connected");
  // socket.on("chat message", (msg) => {
  //   // console.log("message: " + msg);
  //   io.to("123").emit("message", msg);
  // });
  socket.on("join", (room) => {
    socket.join(room);
    console.log("Вход");
    socket.on("chat message", (msg) => {
      // console.log("message: " + msg);
      io.to(room).emit("message", msg);
    });
  });
});

server.listen(5000, () => {
  console.log("listening on *:5000");
});
