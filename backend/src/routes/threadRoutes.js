const express = require("express");
const {
  listThreadsByCategory,
  searchThreads,
  getThread,
  createThread,
  updateThread,
  deleteThread,
  threadValidators,
  editThreadValidators,
} = require("../controllers/threadController");
const { createReply, replyValidators } = require("../controllers/replyController");
const { toggleThreadVote } = require("../controllers/voteController");
const { requireAuth, optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/search", searchThreads);
router.get("/category/:slug", listThreadsByCategory);
router.get("/:id", optionalAuth, getThread);
router.post("/", requireAuth, threadValidators, createThread);
router.patch("/:id", requireAuth, editThreadValidators, updateThread);
router.delete("/:id", requireAuth, deleteThread);

router.post("/:threadId/replies", requireAuth, replyValidators, createReply);
router.post("/:id/vote", requireAuth, toggleThreadVote);

module.exports = router;
