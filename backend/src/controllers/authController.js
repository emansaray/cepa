const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const prisma = require("../config/db");
const { signToken } = require("../utils/jwt");
const asyncHandler = require("../utils/asyncHandler");

const registerValidators = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be 3–30 characters.")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores."),
  body("email").trim().isEmail().withMessage("Enter a valid email address."),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
  body("displayName").trim().isLength({ min: 2, max: 100 }).withMessage("Display name must be 2–100 characters."),
];

const loginValidators = [
  body("identifier").trim().notEmpty().withMessage("Enter your username or email."),
  body("password").notEmpty().withMessage("Enter your password."),
];

function checkValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.status = 400;
    throw error;
  }
}

const register = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { username, email, password, displayName } = req.body;

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { username, email, passwordHash, displayName },
    select: { id: true, username: true, email: true, displayName: true, role: true, createdAt: true },
  });

  const token = signToken(user);
  res.status(201).json({ user, token });
});

const login = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { identifier, password } = req.body;

  const user = await prisma.user.findFirst({
    where: { OR: [{ username: identifier }, { email: identifier }] },
  });

  if (!user) {
    return res.status(401).json({ error: "Incorrect username/email or password." });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return res.status(401).json({ error: "Incorrect username/email or password." });
  }

  const token = signToken(user);
  const { passwordHash, ...publicUser } = user;
  res.json({ user: publicUser, token });
});

const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, username: true, email: true, displayName: true, bio: true, role: true, createdAt: true },
  });
  res.json({ user });
});

module.exports = { register, login, me, registerValidators, loginValidators };
