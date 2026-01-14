const { z } = require("zod");
const { hashPassword, verifyPassword } = require("../utils/password");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");

// In-memory demo store (replace with DB later)
const users = new Map(); // email -> { id, email, passwordHash, roles }
const refreshTokens = new Map(); // token -> userId (simple demo; in real systems store hashed token + metadata)

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

async function register({ email, password }) {
  const input = registerSchema.parse({ email, password });
  const e = normalizeEmail(input.email);

  if (users.has(e)) {
    const err = new Error("Email already exists");
    err.status = 409;
    throw err;
  }

  const passwordHash = await hashPassword(input.password);
  const id = `u_${Date.now()}`;

  // default role: user
  users.set(e, { id, email: e, passwordHash, roles: ["user"] });

  return { id, email: e };
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function login({ email, password }) {
  const input = loginSchema.parse({ email, password });
  const e = normalizeEmail(input.email);
  const u = users.get(e);

  if (!u) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const ok = await verifyPassword(input.password, u.passwordHash);
  if (!ok) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const accessToken = signAccessToken({ sub: u.id, email: u.email, roles: u.roles });
  const refreshToken = signRefreshToken({ sub: u.id });

  refreshTokens.set(refreshToken, u.id);

  return { accessToken, refreshToken };
}

async function refresh(refreshToken) {
  if (!refreshToken) {
    const err = new Error("Missing refresh token");
    err.status = 401;
    throw err;
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    const err = new Error("Invalid or expired refresh token");
    err.status = 401;
    throw err;
  }

  const userId = refreshTokens.get(refreshToken);
  if (!userId || userId !== decoded.sub) {
    const err = new Error("Refresh token not recognized");
    err.status = 401;
    throw err;
  }

  // issue new access token (optional: rotate refresh token in a real system)
  // find user by id
  const u = [...users.values()].find((x) => x.id === userId);
  if (!u) {
    const err = new Error("User not found");
    err.status = 401;
    throw err;
  }

  const accessToken = signAccessToken({ sub: u.id, email: u.email, roles: u.roles });
  return { accessToken };
}

function logout(refreshToken) {
  if (refreshToken) refreshTokens.delete(refreshToken);
}

module.exports = { register, login, refresh, logout };
