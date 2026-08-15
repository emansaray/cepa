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

const updateProfileValidators = [
  body("displayName").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Display name must be 2–100 characters."),
  body("bio").optional({ nullable: true }).trim().isLength({ max: 500 }).withMessage("Bio must be under 500 characters."),
];

// Public profile: display info plus their recent threads and replies.
const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      role: true,
      createdAt: true,
      _count: { select: { threads: true, replies: true } },
    },
  });

  if (!user) {
    return res.status(404).json({ error: "That member doesn't exist." });
  }

  const [threads, replies] = await Promise.all([
    prisma.thread.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { category: true },
    }),
    prisma.reply.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { thread: { select: { id: true, title: true } } },
    }),
  ]);

  res.json({ user, threads, replies });
});

const updateOwnProfile = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { displayName, bio } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(displayName !== undefined ? { displayName } : {}),
      ...(bio !== undefined ? { bio } : {}),
    },
    select: { id: true, username: true, email: true, displayName: true, bio: true, role: true, createdAt: true },
  });

  res.json({ user });
});

module.exports = { getPublicProfile, updateOwnProfile, updateProfileValidators };
