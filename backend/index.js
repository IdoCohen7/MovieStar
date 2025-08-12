// server.js
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

// --- CONFIG ---
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// --- SUPABASE ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// --- HELPERS ---
function signToken(user) {
  return jwt.sign({ sub: String(user.id), email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const [, token] = h.split(" ");
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET); // { sub, email, iat, exp }
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// --- AUTH ---
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data: users, error } = await supabase
    .from("Users")
    .select("*")
    .eq("email", email)
    .limit(1);

  if (error) return res.status(500).json({ error: error.message });
  if (!users?.length)
    return res.status(401).json({ error: "Invalid email or password" });

  const user = users[0];
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid email or password" });

  const { passwordHash, ...safeUser } = user;
  const token = signToken(safeUser);
  return res.json({ user: safeUser, token });
});

app.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { data: exists, error: exErr } = await supabase
    .from("Users")
    .select("id")
    .eq("email", email)
    .limit(1);
  if (exErr) return res.status(500).json({ error: exErr.message });
  if (exists?.length)
    return res.status(400).json({ error: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("Users")
    .insert([{ firstName, lastName, email, passwordHash }])
    .select();
  if (error) return res.status(500).json({ error: error.message });

  const { passwordHash: _, ...safeUser } = data[0];
  const token = signToken(safeUser);
  return res.status(201).json({ user: safeUser, token });
});

// --- SAVED (JWT-ONLY) ---
// רשימת סרטים שמורים של המשתמש המחובר
app.get("/saved", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("Saved")
    .select("movie_id, created_at")
    .eq("user_id", Number(req.userId))
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// האם סרט ספציפי שמור
app.get("/saved/:movieId", requireAuth, async (req, res) => {
  const { movieId } = req.params;
  const { data, error } = await supabase
    .from("Saved")
    .select("movie_id")
    .eq("user_id", Number(req.userId))
    .eq("movie_id", String(movieId))
    .limit(1);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ saved: !!data?.length });
});

// שמירת סרט
app.post("/saved", requireAuth, async (req, res) => {
  const { movieId } = req.body || {};
  if (!movieId) return res.status(400).json({ error: "movieId is required" });

  const { error } = await supabase
    .from("Saved")
    .insert([{ user_id: Number(req.userId), movie_id: String(movieId) }]);

  if (error) {
    // אם יש unique על (user_id, movie_id) תקבל 23505
    if (error.code === "23505") return res.json({ saved: true });
    return res.status(500).json({ error: error.message });
  }
  return res.status(201).json({ saved: true });
});

// ביטול שמירה
app.delete("/saved/:movieId", requireAuth, async (req, res) => {
  const { movieId } = req.params;

  const { error } = await supabase
    .from("Saved")
    .delete()
    .eq("user_id", Number(req.userId))
    .eq("movie_id", String(movieId));

  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).end();
});

// --- START ---
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
