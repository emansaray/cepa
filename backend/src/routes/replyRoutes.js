const express = require("express");
const { updateReply, deleteReply, replyValidators } = require("../controllers/replyController");
const { toggleReplyVote } = require("../controllers/voteController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.patch("/:id", requireAuth, replyValidators, updateReply);
router.delete("/:id", requireAuth, deleteReply);
router.post("/:id/vote", requireAuth, toggleReplyVote);

module.exports = router;
