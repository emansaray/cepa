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

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const categoryValidators = [
  body("name").trim().isLength({ min: 2, max: 120 }).withMessage("Category name must be 2–120 characters."),
  body("description").trim().isLength({ min: 2, max: 400 }).withMessage("Description must be 2–400 characters."),
];

// Lists all categories along with thread and reply counts for the forum index.
const listCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { threads: true } } },
  });
  res.json({ categories });
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { slug: req.params.slug },
    include: { _count: { select: { threads: true } } },
  });
  if (!category) {
    return res.status(404).json({ error: "That category doesn't exist." });
  }
  res.json({ category });
});

const createCategory = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { name, description, sortOrder } = req.body;
  const category = await prisma.category.create({
    data: { name, description, slug: slugify(name), sortOrder: sortOrder ?? 0 },
  });
  res.status(201).json({ category });
});

module.exports = { listCategories, getCategory, createCategory, categoryValidators };
