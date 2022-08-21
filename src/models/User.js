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
    this.listeners = {
      invite: {
        send: (data) => {
          this.sendInvite(data.to);
        },
        pending: [],
      },
    };
  }

  addListener(action, value, { func, match }) {
    if (this.listeners[action] && this.listeners[action][value]) {
      if (Array.isArray(this.listeners[action][value]))
        this.listeners[action][value].push({ func, match });
      else this.listeners[action][value] = func;
    } else {
      this.listeners[action][value] = func;
    }
  }

  async removeListener(action, value, { match }) {
    if (this.listeners[action] && this.listeners[action][value]) {
      if (Array.isArray(this.listeners[action][value])) {
        const newListenersArray = this.listeners[action][value];
        this.listeners[action][value] = newListenersArray.filter(
          (element) => element.match !== match
        );
      } else delete this.listeners[action][value];
    }
  }

  newMessage(message) {
    const [action, value, data] = message.split("--");
    if (this.listeners[action] && this.listeners[action][value])
      switch (typeof this.listeners[action][value]) {
        case "function":
          this.listeners[action][value](JSON.parse(data));
          break;
        case "undefined":
          break;
        default:
          if (Array.isArray(this.listeners[action][value]))
            this.listeners[action][value].map(({ match, func }) => {
              const { query } = JSON.parse(data);
              if (query === match && typeof func === "function")
                resolver(JSON.parse(data));
            });
      }
  }

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
    this.websocket.send(`invite--fail--${JSON.stringify({ to: fullName })}`);
  }
  inviteAccepted(from) {
    this.websocket.send(`invite--accepted--${JSON.stringify({ from })}`);
  }
  inviteDeclined(from) {
    this.websocket.send(`invite--declined--${JSON.stringify({ from })}`);
  }
  receiveInvite(from, { accept, reject }) {
    this.websocket.send(`invite--received--${JSON.stringify({ from })}`);
    this.addListener("invite", "pending", {
      match: from,
      func: ({ response }) => {
        if (response) accept();
        else reject();

        this.removeListener("invite", "pending", { match: from });
      },
    });
  }
}

module.exports = User;
