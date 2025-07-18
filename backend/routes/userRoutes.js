const express = require("express");
const verifyFirebaseToken = require("../config/auth");
const {
  createUser,
  updateUserPreferences,
} = require("../services/userService");

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

router.post("/preferences", verifyFirebaseToken, async (req, res) => {
  const userId = req.uid;
  const { monthlyIncome, savingsPriority, debtPriority, spendingFocus } =
    req.body;

  try {
    const updatedUser = await updateUserPreferences(userId, {
      monthlyIncome,
      savingsPriority,
      debtPriority,
      spendingFocus,
    });

    res.json(updatedUser);
  } catch (err) {
    console.error("Update preferences error:", err);
    res.status(500).json({ error: "Failed to update user preferences" });
  }
});

module.exports = router;
