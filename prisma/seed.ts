import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const DEFAULT_CATEGORIES = [
  { name: "Travel", icon: "plane", color: "#3b82f6", isDefault: true },
  { name: "Meals & Dining", icon: "utensils", color: "#f97316", isDefault: true },
  { name: "Transportation", icon: "car", color: "#8b5cf6", isDefault: true },
  { name: "Office Supplies", icon: "briefcase", color: "#6b7280", isDefault: true },
  { name: "Software & Tools", icon: "monitor", color: "#06b6d4", isDefault: true },
  { name: "Communication", icon: "phone", color: "#10b981", isDefault: true },
  { name: "Lodging", icon: "building", color: "#ec4899", isDefault: true },
  { name: "Entertainment", icon: "music", color: "#f59e0b", isDefault: true },
  { name: "Professional Services", icon: "users", color: "#14b8a6", isDefault: true },
  { name: "Other", icon: "circle", color: "#9ca3af", isDefault: true },
];

async function main() {
  console.log("Seeding database...");

  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories`);

  const adminExists = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        email: "admin@xpens.local",
        name: "Admin User",
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log("Created default admin user (admin@xpens.local / admin123)");
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
