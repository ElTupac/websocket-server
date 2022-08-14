require("dotenv").config();

const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: process.env.PORT || 3001 });

wss.on("connection", (ws) => {
  console.log("Conectado");
  let counter = 0;
  const messageFunction = () =>
    setTimeout(() => {
      ws.send(`Un nuevo mensaje, numero: ${counter}`);
      if (counter < 10) {
        counter++;
        messageFunction();
      } else ws.close(1000);
    }, 2000);
  messageFunction();
});
