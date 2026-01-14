require("dotenv").config();

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),

  // Demo secrets (use strong values locally; never commit .env)
  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),

  ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL || "10m",
  REFRESH_TOKEN_TTL: process.env.REFRESH_TOKEN_TTL || "7d",

  // cookie options
  COOKIE_NAME: process.env.COOKIE_NAME || "refresh_token",
  COOKIE_SECURE: process.env.COOKIE_SECURE === "true", // set true in prod
};

module.exports = env;