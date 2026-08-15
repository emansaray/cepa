const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

// Toggles a like from the current user on a thread or a reply.
// Voting again removes the vote (simple toggle, not up/down).
const toggleThreadVote = asyncHandler(async (req, res) => {
  const threadId = Number(req.params.id);
  const userId = req.user.id;

  const existing = await prisma.vote.findFirst({ where: { userId, threadId } });

  if (existing) {
    await prisma.vote.delete({ where: { id: existing.id } });
  } else {
    const thread = await prisma.thread.findUnique({ where: { id: threadId } });
    if (!thread) return res.status(404).json({ error: "That thread doesn't exist." });
    await prisma.vote.create({ data: { userId, threadId } });
  }

  const count = await prisma.vote.count({ where: { threadId } });
  res.json({ voteCount: count, voted: !existing });
});

const toggleReplyVote = asyncHandler(async (req, res) => {
  const replyId = Number(req.params.id);
  const userId = req.user.id;

  const existing = await prisma.vote.findFirst({ where: { userId, replyId } });

  if (existing) {
    await prisma.vote.delete({ where: { id: existing.id } });
  } else {
    const reply = await prisma.reply.findUnique({ where: { id: replyId } });
    if (!reply) return res.status(404).json({ error: "That reply doesn't exist." });
    await prisma.vote.create({ data: { userId, replyId } });
  }

  const count = await prisma.vote.count({ where: { replyId } });
  res.json({ voteCount: count, voted: !existing });
});

module.exports = { toggleThreadVote, toggleReplyVote };
