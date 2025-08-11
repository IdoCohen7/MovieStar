const express = require("express");
require("dotenv").config();
const cors = require("cors");

const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors({ origin: true }));

app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY // service_role בפרודקשן עדיף לא לשים בצד לקוח
);

// התחברות
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // שלב 1 – חיפוש המשתמש בטבלה
  const { data: users, error } = await supabase
    .from("Users")
    .select("*")
    .eq("email", email)
    .limit(1);

  if (error) return res.status(500).json({ error: error.message });
  if (!users || users.length === 0) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const user = users[0];

  // שלב 2 – בדיקת סיסמה
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // שלב 3 – מחזירים את פרטי המשתמש (ללא הסיסמה)
  const { passwordHash, ...safeUser } = user;
  res.json(safeUser);
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
