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

const roleValidators = [
  body("role").isIn(["MEMBER", "MODERATOR", "ADMIN"]).withMessage("Role must be MEMBER, MODERATOR, or ADMIN."),
];

// Lists all members for the admin dashboard — no passwords, ever.
const listUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, username: true, displayName: true, email: true, role: true, createdAt: true },
  });
  res.json({ users });
});

const updateUserRole = asyncHandler(async (req, res) => {
  checkValidation(req);
  const targetId = Number(req.params.id);

  if (targetId === req.user.id) {
    return res.status(400).json({ error: "You can't change your own role." });
  }

  const user = await prisma.user.update({
    where: { id: targetId },
    data: { role: req.body.role },
    select: { id: true, username: true, displayName: true, role: true },
  });

  res.json({ user });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await prisma.category.delete({ where: { id } });
  res.status(204).send();
});

const setThreadFlags = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { isPinned, isLocked } = req.body;

  const thread = await prisma.thread.update({
    where: { id },
    data: {
      ...(typeof isPinned === "boolean" ? { isPinned } : {}),
      ...(typeof isLocked === "boolean" ? { isLocked } : {}),
    },
  });

  res.json({ thread });
});

module.exports = { listUsers, updateUserRole, deleteCategory, setThreadFlags, roleValidators };
