// app.js
const express = require("express");
const cors = require("cors");
const { CORS } = require("./config");

const authRoutes = require("./routes/auth.routes");
const savedRoutes = require("./routes/saved.routes");

const app = express();
app.use(cors(CORS));
app.use(express.json());

// mount routes
app.use(authRoutes); // /login, /register
app.use("/saved", savedRoutes);

// (אופציונלי) בריאות:
app.get("/health", (_, res) => res.json({ ok: true }));

module.exports = app;
