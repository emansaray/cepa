const express = require("express");
const {
  listCategories,
  getCategory,
  createCategory,
  categoryValidators,
} = require("../controllers/categoryController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", listCategories);
router.get("/:slug", getCategory);
router.post("/", requireAuth, requireRole("ADMIN", "MODERATOR"), categoryValidators, createCategory);

module.exports = router;
