const express = require("express");
const verifyFirebaseToken = require("../config/auth");
const { createUser } = require("../services/userService");

const router = express.Router();

router.post("/init", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email } = req;

    const user = await createUser(uid, email);
    res.json({ message: "User created", user });
  } catch (err) {
    console.error("Init error:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

module.exports = router;
