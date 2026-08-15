const { body, validationResult } = require("express-validator");
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

function checkValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.status = 400;
    throw error;
  }
}

const replyValidators = [
  body("body").trim().isLength({ min: 2, max: 4000 }).withMessage("Reply must be 2–4000 characters."),
];

const authorSelect = { id: true, username: true, displayName: true, role: true };

const createReply = asyncHandler(async (req, res) => {
  checkValidation(req);
  const threadId = Number(req.params.threadId);
  const { body: content } = req.body;

  const thread = await prisma.thread.findUnique({ where: { id: threadId } });
  if (!thread) {
    return res.status(404).json({ error: "That thread doesn't exist." });
  }
  if (thread.isLocked) {
    return res.status(403).json({ error: "This thread is locked and no longer accepting replies." });
  }

  const [reply] = await prisma.$transaction([
    prisma.reply.create({
      data: { body: content, threadId, authorId: req.user.id },
      include: { author: { select: authorSelect } },
    }),
    prisma.thread.update({ where: { id: threadId }, data: { updatedAt: new Date() } }),
  ]);

  res.status(201).json({ reply });
});

const updateReply = asyncHandler(async (req, res) => {
  checkValidation(req);
  const id = Number(req.params.id);
  const reply = await prisma.reply.findUnique({ where: { id } });

  if (!reply) {
    return res.status(404).json({ error: "That reply doesn't exist." });
  }

  const isOwner = reply.authorId === req.user.id;
  const isStaff = ["MODERATOR", "ADMIN"].includes(req.user.role);
  if (!isOwner && !isStaff) {
    return res.status(403).json({ error: "You can only edit your own replies." });
  }

  const updated = await prisma.reply.update({
    where: { id },
    data: { body: req.body.body },
    include: { author: { select: authorSelect } },
  });

  res.json({ reply: updated });
});

const deleteReply = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const reply = await prisma.reply.findUnique({ where: { id } });

  if (!reply) {
    return res.status(404).json({ error: "That reply doesn't exist." });
  }

  const isOwner = reply.authorId === req.user.id;
  const isStaff = ["MODERATOR", "ADMIN"].includes(req.user.role);
  if (!isOwner && !isStaff) {
    return res.status(403).json({ error: "You can only delete your own replies." });
  }

  await prisma.reply.delete({ where: { id } });
  res.status(204).send();
});

module.exports = { createReply, updateReply, deleteReply, replyValidators };
