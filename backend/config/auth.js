const admin = require("./firebaseAdmin");

async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.uid = decodedToken.uid;
    req.email = decodedToken.email;
    next();
  } catch (err) {
    console.error("Firebase token verification failed:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = verifyFirebaseToken;
