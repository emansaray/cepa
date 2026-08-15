const express = require("express");
const { register, login, me, registerValidators, loginValidators } = require("../controllers/authController");
const { updateOwnProfile, updateProfileValidators } = require("../controllers/userController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", registerValidators, register);
router.post("/login", loginValidators, login);
router.get("/me", requireAuth, me);
router.patch("/me", requireAuth, updateProfileValidators, updateOwnProfile);

module.exports = router;
