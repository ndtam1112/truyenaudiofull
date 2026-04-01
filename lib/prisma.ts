import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prismaClassicStories?: PrismaClient;
};

export const prisma =
  globalForPrisma.prismaClassicStories ||
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaClassicStories = prisma;
}
