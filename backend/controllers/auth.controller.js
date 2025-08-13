// controllers/auth.controller.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { supabase } = require("../lib/supabase");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config");

function signToken(user) {
  return jwt.sign({ sub: String(user.id), email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

async function login(req, res) {
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
}

async function register(req, res) {
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
}

module.exports = { login, register };
