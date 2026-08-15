require("dotenv").config();
// Seeds a starter set of categories so the forum isn't empty on first run.
// Run with: npm run seed
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const categories = [
  { name: "Community Health", description: "Evidence and organizing around local health access and outcomes.", sortOrder: 1 },
  { name: "Education & Youth", description: "Data-driven discussion on schools, literacy, and youth programs.", sortOrder: 2 },
  { name: "Environment & Infrastructure", description: "Roads, water, sanitation, and environmental accountability.", sortOrder: 3 },
  { name: "Governance & Accountability", description: "Civic oversight, budgets, and public records.", sortOrder: 4 },
  { name: "General Discussion", description: "Everything else CEPA members want to raise.", sortOrder: 5 },
];

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: slugify(c.name) },
      update: {},
      create: { ...c, slug: slugify(c.name) },
    });
  }
  console.log(`Seeded ${categories.length} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
