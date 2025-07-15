const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const plaidTokenRoutes = require("./routes/plaidTokenRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const bankAccountRoutes = require("./routes/bankAccountRoutes");
const newsRoutes = require("./routes/newsRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const userRoutes = require("./routes/userRoutes");
const digestibilityRoutes = require("./routes/digestibilityRoutes");

const server = express();
server.use(helmet());
server.use(express.json());
server.use(cors());
server.use("/api/plaid", plaidTokenRoutes);
server.use("/api/transactions", transactionRoutes);
server.use("/api/accounts", bankAccountRoutes);
server.use("/api/news", newsRoutes);
server.use("/api/budget", budgetRoutes);
server.use("/api/user", userRoutes);
server.use("/api/digestibility", digestibilityRoutes);

server.use("*", (req, res, next) => {
  next({ status: 404, message: "Not found" });
});

server.use((err, req, res, next) => {
  const { message, status } = err;
  console.error("Error: ", message);
  res.status(status).json({ message });
});

module.exports = server;
