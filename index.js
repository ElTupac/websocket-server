require("dotenv").config();

const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

const http = require("http");
const WebSocketServer = require("ws").Server;
const express = require("express");
const cors = require("cors");
const routes = require("./src/routes");
const PORT = +process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());
app.use("/", routes);

const server = http.createServer(app);

try {
  const wss = new WebSocketServer({
    server,
  });

  wss.on("connection", (ws) => {
    let authenticationStep = "no_authenticated";

    let counter = 0;
    const messageFunction = () =>
      setTimeout(() => {
        ws.send(`Un mensaje para ${authenticationStep}, numero: ${counter}`);
        if (counter < 10) {
          counter++;
          messageFunction();
        } else ws.close(1000);
      }, 2000);

    ws.on("message", (data) => {
      const message = new String(data);
      switch (authenticationStep) {
        case "no_authenticated":
          try {
            const { token } = JSON.parse(message);
            jwt.verify(token, JWT_SECRET, (err, decoded) => {
              if (err) ws.close(3000, "Unauthorized");
              else {
                authenticationStep = decoded.username;
                ws.send("authenticate_ok");
                messageFunction();
              }
            });
          } catch (error) {
            ws.close(3000, "Unauthorized");
          }
          break;
        default:
          console.log(authenticationStep);
          console.log("Message: %s", message);
      }
    });
    ws.on("close", (code, reason) => {
      console.log("Closed because: %s", reason);
      console.log("Close code: ", code);
    });
    ws.send("authenticate");
  });
} catch (error) {
  console.error("There was a problem setting the web socket");
}

try {
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
} catch (error) {
  console.error("There was a problem starting the server on port: %d", PORT);
}
