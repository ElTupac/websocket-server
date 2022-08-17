const WebSocketServer = require("ws").Server;
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = process.env;

const websocket = (httpServer, { onNewUser }) => {
  const webSocketServer = new WebSocketServer({ server: httpServer });

  webSocketServer.on("connection", (ws) => {
    let userObject;
    let authenticationStep = "no_authenticated";

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
                userObject = new User(decoded.username, ws);
                if (typeof onNewUser === "function") onNewUser(userObject);
              }
            });
          } catch (error) {
            console.log(error);
            ws.close(3000, "Unauthorized");
          }
          break;
        default:
          if (userObject) userObject.newMessage(message);
      }
    });
    ws.on("close", (code, reason) => {
      console.log("Closed because: %s", reason);
      console.log("Close code: ", code);
    });
    ws.send("authenticate");
  });
};

module.exports = websocket;
