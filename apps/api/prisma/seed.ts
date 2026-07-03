import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 4);

  const user = await prisma.user.upsert({
    where: { email: "owner@workshop.local" },
    update: {},
    create: {
      email: "owner@workshop.local",
      passwordHash,
      name: "Workshop Owner",
      bookingSlug: "demo",
    },
  });

  await prisma.availabilityRule.deleteMany({ where: { ownerId: user.id } });

  const weekdays = [1, 2, 3, 4, 5];
  await prisma.availabilityRule.createMany({
    data: weekdays.map((dayOfWeek) => ({
      dayOfWeek,
      startTime: "09:00",
      endTime: "17:00",
      slotDurationMinutes: 30,
      ownerId: user.id,
    })),
  });

  console.log("Seeded demo owner:");
  console.log("  Email: owner@workshop.local");
  console.log("  Password: password123");
  console.log("  Booking slug: demo");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
