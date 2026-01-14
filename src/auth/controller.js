const env = require("../config/env");
const authService = require("./service");

function setRefreshCookie(res, token) {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax",
    path: "/auth/refresh",
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(env.COOKIE_NAME, { path: "/auth/refresh" });
}

async function register(req, res, next) {
  try {
    const out = await authService.register(req.body);
    res.status(201).json(out);
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const { accessToken, refreshToken } = await authService.login(req.body);
    setRefreshCookie(res, refreshToken);
    res.json({ accessToken });
  } catch (e) {
    next(e);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies?.[env.COOKIE_NAME];
    const out = await authService.refresh(token);
    res.json(out);
  } catch (e) {
    next(e);
  }
}

async function logout(req, res, next) {
  try {
    const token = req.cookies?.[env.COOKIE_NAME];
    authService.logout(token);
    clearRefreshCookie(res);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = { register, login, refresh, logout };
