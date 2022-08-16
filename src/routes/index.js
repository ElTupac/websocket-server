const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

const express = require("express");
const routes = express.Router();

routes.post("/user", (req, res) => {
  const { username } = req.body;
  const token = jwt.sign({ username }, JWT_SECRET, {
    expiresIn: 1000 * 60 * 60 * 24,
  });
  console.log("Entered new user: %s", username);
  return res.status(200).json({ token });
});

module.exports = routes;
