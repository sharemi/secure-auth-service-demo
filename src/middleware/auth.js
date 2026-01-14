const { verifyAccessToken } = require("../utils/jwt");

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  try {
    const claims = verifyAccessToken(token);
    req.user = claims; // { sub, email, roles }
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
}

module.exports = auth;
