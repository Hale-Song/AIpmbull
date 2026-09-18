import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = "admin";
  const email = "admin@aipmbull.com";
  const password = "aipmbull2024";

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log("Admin user already exists, skipping.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      name: "AI产品牛",
      role: "ADMIN",
    },
  });

  console.log("Admin user created:");
  console.log(`  Username: ${username}`);
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  ID:       ${admin.id}`);

  await prisma.siteSettings.upsert({
    where: { id: "site" },
    update: {},
    create: {
      id: "site",
      siteName: "AI产品牛",
      siteNameEn: "AIPMBull",
    },
  });

  console.log("Site settings initialized.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
