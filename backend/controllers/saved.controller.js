// controllers/saved.controller.js
const { supabase } = require("../lib/supabase");

async function listSaved(req, res) {
  const { data, error } = await supabase
    .from("Saved")
    .select("movie_id, created_at")
    .eq("user_id", Number(req.userId))
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
}

async function isSaved(req, res) {
  const { movieId } = req.params;
  const { data, error } = await supabase
    .from("Saved")
    .select("movie_id")
    .eq("user_id", Number(req.userId))
    .eq("movie_id", String(movieId))
    .limit(1);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ saved: !!data?.length });
}

async function saveMovie(req, res) {
  const { movieId } = req.body || {};
  if (!movieId) return res.status(400).json({ error: "movieId is required" });

  const { error } = await supabase
    .from("Saved")
    .insert([{ user_id: Number(req.userId), movie_id: String(movieId) }]);
  if (error) {
    if (error.code === "23505") return res.json({ saved: true });
    return res.status(500).json({ error: error.message });
  }
  return res.status(201).json({ saved: true });
}

async function removeSaved(req, res) {
  const { movieId } = req.params;
  const { error } = await supabase
    .from("Saved")
    .delete()
    .eq("user_id", Number(req.userId))
    .eq("movie_id", String(movieId));
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).end();
}

module.exports = { listSaved, isSaved, saveMovie, removeSaved };
