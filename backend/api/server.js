const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const plaidRoutes = require("./plaidRoutes");
const transactionRoutes = require("./transactionRoutes");

const server = express();
server.use(helmet());
server.use(express.json());
server.use(cors());
server.use("/api", plaidRoutes);
server.use("/api/transactions", transactionRoutes);

server.use("*", (req, res, next) => {
  next({ status: 404, message: "Not found" });
});

server.use((err, req, res, next) => {
  const { message, status } = err;
  console.error("Error: ", message);
  res.status(status).json({ message });
});

module.exports = server;
