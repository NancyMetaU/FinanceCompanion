const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const plaidTokenRoutes = require("./routes/plaidTokenRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const accountRoutes = require("./routes/accountRoutes");

const server = express();
server.use(helmet());
server.use(express.json());
server.use(cors());
server.use("/api/plaid", plaidTokenRoutes);
server.use("/api/transactions", transactionRoutes);
server.use("/api/accounts", accountRoutes);

server.use("*", (req, res, next) => {
  next({ status: 404, message: "Not found" });
});

server.use((err, req, res, next) => {
  const { message, status } = err;
  console.error("Error: ", message);
  res.status(status).json({ message });
});

module.exports = server;
