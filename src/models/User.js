const getRandomUserId = require("../utils/getRandomUserId");

const userInitialization = (username) => {
  const userData = {
    username,
  };
  userData.id = getRandomUserId();
  userData.fullName = `${username}#${userData.id}`;

  return userData;
};

class User {
  constructor(username, websocket) {
    Object.assign(this, userInitialization(username));
    console.log("Created user: %s", this.fullName);
    if (websocket) this.assignWebsocket(websocket);
  }

  assignWebsocket(websocket) {
    this.websocket = websocket;
    websocket.send("authenticate_ok");
  }
  newMessage(message) {
    console.log("Message in object: %s", message);
    const [action, value] = message.split("--");
    switch (action) {
      case "invite":
        this.sendInvite(value);
    }
  }

  receiveInvite(from) {}
  createRoom() {}
  assignRoom() {}

  isThisUser(fullName) {
    return this.fullName === fullName;
  }

  subscribeInvites(func) {
    if (typeof func === "function") this.inviteSub = func;
  }
  sendInvite(to) {
    if (typeof this.inviteSub === "function")
      this.inviteSub(to, {
        accept: () => this.inviteAccepted(to),
        reject: () => this.inviteDeclined(to),
        notFound: () => this.inviteUserNotFound(to),
      });
  }
  inviteUserNotFound(fullName) {
    console.log("%s not found online", fullName);
  }
  inviteAccepted(from) {
    console.log("%s accepted your invite", from);
  }
  inviteDeclined(from) {
    console.log("%s declined your invite", from);
  }
}

module.exports = User;
