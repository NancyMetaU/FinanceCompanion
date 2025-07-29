const express = require("express");
const verifyFirebaseToken = require("../config/auth");
const {
  createUser,
  updateUserPreferences,
  getUserPreferences,
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
  const {
    monthlyIncome,
    employmentType,
    savingsPriority,
    debtPriority,
    spendingFocus,
  } = req.body;

  try {
    const updatedUser = await updateUserPreferences(userId, {
      monthlyIncome,
      employmentType,
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

router.get("/preferences", verifyFirebaseToken, async (req, res) => {
  const userId = req.uid;

  try {
    const preferences = await getUserPreferences(userId);
    res.json(preferences);
  } catch (err) {
    console.error("Get preferences error:", err);
    res.status(500).json({ error: "Failed to retrieve user preferences" });
  }
});

module.exports = router;
