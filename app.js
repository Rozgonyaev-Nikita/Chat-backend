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
const MessageSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
  },
  messages: [
    {
      name: {
        type: String,
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
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
const Messages = mongoose.model("messages", MessageSchema); //posts
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
      // console.log(result);
    } else {
      res.status(404).json({ error: "Пользователь не найден" });
    }
  });

  Users.findOne({ login: hisLogin }).then(async (user) => {
    if (user) {
      user.rooms.push(room); // Добавление значения комнаты в массив rooms
      let result = await user.save();
      // console.log(result);
    } else {
      res.status(404).json({ error: "Пользователь не найден" });
    }
  });
});

app.post("/api/createChat", async (req, res) => {
  try {
    console.log("createChat");
    const message = new Messages(req.body);
    let result = await message.save();
    result = result.toObject();
    if (result) {
      res.send(result); // Отправляем результат, а не исходное тело запроса
    } else {
      console.log("Posts already register");
    }
  } catch (e) {
    console.error(e); // Выводим ошибку в консоль для отладки
    res.status(500).send("Something Went Wrong"); // Отправляем статус ошибки и сообщение на клиент
  }
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
    socket.on("chat message", async (msg) => {
      // console.log("message: " + msg);
      io.to(room).emit("message", msg);
      console.log(msg);

      try {
        Messages.findOne({ room }).then(async (message) => {
          if (message) {
            message.messages.push(msg);
            await message.save();
            console.log("Запись успешно добавлена в базу данных");
          } else {
            console.log("Такой записи нет!");
          }
        });
      } catch (error) {
        console.error("Не удалось добавить запись в базу данных:", error);
      }
    });
  });
});

server.listen(5000, () => {
  console.log("listening on *:5000");
});
