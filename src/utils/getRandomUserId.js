const getRandomUserid = () =>
  "0000".concat(Math.floor(Math.random() * 9999)).slice(-4);

module.exports = getRandomUserid;
