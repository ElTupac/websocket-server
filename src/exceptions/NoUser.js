const NoUser = (callbackFunction) => {
  console.info("Connection rejected");
  if (typeof callbackFunction === "function")
    return callbackFunction(false, 403, "Unauthorized");
};

module.exports = NoUser;
