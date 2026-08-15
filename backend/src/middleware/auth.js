const { verifyToken } = require("../utils/jwt");

// Requires a valid Bearer token. Attaches { id, username, role } to req.user.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Sign in to continue." });
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, username: payload.username, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Your session has expired. Sign in again." });
  }
}

// Attaches req.user if a valid token is present, but does not block the request.
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme === "Bearer" && token) {
    try {
      const payload = verifyToken(token);
      req.user = { id: payload.sub, username: payload.username, role: payload.role };
    } catch (err) {
      // Invalid token on an optional route just means the user is anonymous.
    }
  }
  next();
}

// Restricts a route to specific roles, e.g. requireRole("MODERATOR", "ADMIN")
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You don't have permission to do that." });
    }
    next();
  };
}

module.exports = { requireAuth, optionalAuth, requireRole };
