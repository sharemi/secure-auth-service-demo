const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const errorHandler = require("./middleware/error");
const healthRoutes = require("./health/routes");
const authRoutes = require("./auth/routes");
const userRoutes = require("./users/routes");

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// basic rate limit (tune per route in real systems)
app.use(
  rateLimit({
    windowMs: 30 * 1000,
    limit: 50,
  })
);

app.get("/", (req, res) => res.json({ name: "secure-auth-service-demo" }));
app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.use(errorHandler);

module.exports = app;
