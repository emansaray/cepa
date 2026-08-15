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

const threadValidators = [
  body("title").trim().isLength({ min: 5, max: 200 }).withMessage("Title must be 5–200 characters."),
  body("body").trim().isLength({ min: 10, max: 4000 }).withMessage("Post body must be 10–4000 characters."),
  body("categoryId").isInt().withMessage("Choose a valid category."),
];

const editThreadValidators = [
  body("title").optional().trim().isLength({ min: 5, max: 200 }).withMessage("Title must be 5–200 characters."),
  body("body").optional().trim().isLength({ min: 10, max: 4000 }).withMessage("Post body must be 10–4000 characters."),
];

const authorSelect = { id: true, username: true, displayName: true, role: true };

function parsePagination(req) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 20));
  return { page, pageSize, skip: (page - 1) * pageSize };
}

// Lists threads in a category, newest activity first (pinned threads always on top), paginated.
const listThreadsByCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) {
    return res.status(404).json({ error: "That category doesn't exist." });
  }

  const { page, pageSize, skip } = parsePagination(req);

  const [threads, total] = await Promise.all([
    prisma.thread.findMany({
      where: { categoryId: category.id },
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
      skip,
      take: pageSize,
      include: {
        author: { select: authorSelect },
        _count: { select: { replies: true, votes: true } },
      },
    }),
    prisma.thread.count({ where: { categoryId: category.id } }),
  ]);

  res.json({ category, threads, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 } });
});

// Searches thread titles and bodies. Simple substring search — fine for a
// community forum's scale; swap for full-text search if this ever needs to
// scale past a few thousand threads.
const searchThreads = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();
  if (q.length < 2) {
    return res.status(400).json({ error: "Search for at least 2 characters." });
  }

  const { page, pageSize, skip } = parsePagination(req);

  const where = {
    OR: [
      { title: { contains: q } },
      { body: { contains: q } },
    ],
  };

  const [threads, total] = await Promise.all([
    prisma.thread.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
      include: {
        author: { select: authorSelect },
        category: true,
        _count: { select: { replies: true, votes: true } },
      },
    }),
    prisma.thread.count({ where }),
  ]);

  res.json({ query: q, threads, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 } });
});

const getThread = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const thread = await prisma.thread.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
    include: {
      author: { select: authorSelect },
      category: true,
      _count: { select: { votes: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: authorSelect }, _count: { select: { votes: true } } },
      },
    },
  }).catch(() => null);

  if (!thread) {
    return res.status(404).json({ error: "That thread doesn't exist." });
  }

  let userVotedThread = false;
  let votedReplyIds = [];
  if (req.user) {
    const [threadVote, replyVotes] = await Promise.all([
      prisma.vote.findFirst({ where: { userId: req.user.id, threadId: id } }),
      prisma.vote.findMany({ where: { userId: req.user.id, replyId: { in: thread.replies.map((r) => r.id) } } }),
    ]);
    userVotedThread = Boolean(threadVote);
    votedReplyIds = replyVotes.map((v) => v.replyId);
  }

  res.json({ thread, userVotedThread, votedReplyIds });
});

const createThread = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { title, body: content, categoryId } = req.body;

  const category = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
  if (!category) {
    return res.status(400).json({ error: "Choose a valid category." });
  }

  const thread = await prisma.thread.create({
    data: { title, body: content, categoryId: category.id, authorId: req.user.id },
    include: { author: { select: authorSelect }, category: true },
  });

  res.status(201).json({ thread });
});

const updateThread = asyncHandler(async (req, res) => {
  checkValidation(req);
  const id = Number(req.params.id);
  const thread = await prisma.thread.findUnique({ where: { id } });

  if (!thread) {
    return res.status(404).json({ error: "That thread doesn't exist." });
  }

  const isOwner = thread.authorId === req.user.id;
  const isStaff = ["MODERATOR", "ADMIN"].includes(req.user.role);
  if (!isOwner && !isStaff) {
    return res.status(403).json({ error: "You can only edit your own threads." });
  }

  const { title, body: content } = req.body;
  const updated = await prisma.thread.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(content !== undefined ? { body: content } : {}),
    },
    include: { author: { select: authorSelect }, category: true },
  });

  res.json({ thread: updated });
});

const deleteThread = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const thread = await prisma.thread.findUnique({ where: { id } });

  if (!thread) {
    return res.status(404).json({ error: "That thread doesn't exist." });
  }

  const isOwner = thread.authorId === req.user.id;
  const isStaff = ["MODERATOR", "ADMIN"].includes(req.user.role);
  if (!isOwner && !isStaff) {
    return res.status(403).json({ error: "You can only delete your own threads." });
  }

  await prisma.thread.delete({ where: { id } });
  res.status(204).send();
});

module.exports = {
  listThreadsByCategory,
  searchThreads,
  getThread,
  createThread,
  updateThread,
  deleteThread,
  threadValidators,
  editThreadValidators,
};
