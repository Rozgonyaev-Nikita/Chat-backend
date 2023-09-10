const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

const roomConnections = {};

wss.on("connection", (ws) => {
  console.log("A client connected");

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "createRoom") {
      // Создание комнаты
      const roomId = data.roomId;
      roomConnections[roomId] = [];

      // Добавление подключившегося клиента в комнату
      // roomConnections[roomId].push(ws);

      console.log(`Комната ${roomId} создана`);
    } else if (data.type === "joinRoom") {
      const roomId = data.roomId;

      // Добавление подключившегося клиента в комнату
      roomConnections[roomId].push(ws);
      roomConnections[roomId].forEach((client) => {
        client.send(JSON.stringify({ type: "kl" }));
      });
      console.log(`Клиент присоединился к комнате ${roomId}`);
    }
    if (data.type === "message" && "room1") {
      const roomId = data.roomId;
      const message = data.message;
      if (roomConnections[roomId]) {
        // Проверка на наличие комнаты
        console.log(message);

        // Рассылка сообщения всем клиентам в комнате
        roomConnections[roomId].forEach((client) => {
          client.send(JSON.stringify({ type: "message", message }));
        });
      } else {
        console.log(`Комната ${roomId} не существует или пустая`);
      }
    }
  });

  ws.on("close", () => {
    console.log("A client disconnected");

    // Удаление клиента из комнаты
    for (const roomId in roomConnections) {
      const index = roomConnections[roomId].indexOf(ws);
      if (index !== -1) {
        roomConnections[roomId].splice(index, 1);
        console.log(`Клиент удален из комнаты ${roomId}`);
        break;
      }
    }
  });
});
