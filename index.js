require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const routes = require("./src/routes");
const User = require("./src/models/User");
const PORT = +process.env.PORT || 3001;

// Only for storing references, not use directly or caoul lead in performances issues
const usersControllers = [new User("Jorge")];

const app = express();
app.use(cors());
app.use(express.json());
app.use("/", routes);

const server = http.createServer(app);

try {
  require("./src/websocket")(server, {
    onNewUser: (user) => {
      user.subscribeInvites((inviteTo, { accept, reject, notFound }) => {
        const foundUser = usersControllers.find((userObject) =>
          userObject.isThisUser(inviteTo)
        );
        if (foundUser) accept();
        else notFound();
      });
      usersControllers.push(user);
    },
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
