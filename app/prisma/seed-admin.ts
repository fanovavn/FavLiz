import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

async function main() {
    const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
    });
    const prisma = new PrismaClient({ adapter });

    const existing = await prisma.adminUser.findUnique({
        where: { username: "tientd" },
    });

    if (existing) {
        console.log("✅ Root admin 'tientd' already exists. Skipping...");
        return;
    }

    const hashedPassword = await bcrypt.hash("Ting2004*", 12);

    await prisma.adminUser.create({
        data: {
            username: "tientd",
            password: hashedPassword,
            name: "Tien TD",
            role: "ROOT",
            isActive: true,
            createdBy: null,
        },
    });

    console.log("🌱 Root admin 'tientd' seeded successfully!");
}

main().catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
});
