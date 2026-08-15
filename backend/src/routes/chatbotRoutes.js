const express = require("express");
const { chat, chatValidators } = require("../controllers/chatbotController");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Chatbot calls cost money (API usage) — keep this tightly rate limited.
const chatLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "You're sending messages too quickly. Wait a bit and try again." },
});

router.post("/", chatLimiter, chatValidators, chat);

module.exports = router;
