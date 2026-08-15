const express = require("express");
const {
  listUsers,
  updateUserRole,
  deleteCategory,
  setThreadFlags,
  roleValidators,
} = require("../controllers/adminController");
const { createCategory, categoryValidators } = require("../controllers/categoryController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Every route here requires ADMIN (or MODERATOR where noted).
router.get("/users", requireAuth, requireRole("ADMIN"), listUsers);
router.patch("/users/:id/role", requireAuth, requireRole("ADMIN"), roleValidators, updateUserRole);

router.post("/categories", requireAuth, requireRole("ADMIN"), categoryValidators, createCategory);
router.delete("/categories/:id", requireAuth, requireRole("ADMIN"), deleteCategory);

router.patch("/threads/:id/flags", requireAuth, requireRole("ADMIN", "MODERATOR"), setThreadFlags);

module.exports = router;
