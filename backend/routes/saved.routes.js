// routes/saved.routes.js
const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  listSaved,
  isSaved,
  saveMovie,
  removeSaved,
} = require("../controllers/saved.controller");

const router = express.Router();

router.get("/", requireAuth, listSaved); // GET /saved
router.get("/:movieId", requireAuth, isSaved); // GET /saved/:movieId
router.post("/", requireAuth, saveMovie); // POST /saved
router.delete("/:movieId", requireAuth, removeSaved); // DELETE /saved/:movieId

module.exports = router;
