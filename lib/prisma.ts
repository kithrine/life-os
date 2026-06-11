// import { PrismaClient } from "@/lib/generated/prisma/client";
// import { PrismaPg } from "@prisma/adapter-pg";

// const globalForPrisma = globalThis as unknown as {
//   prisma?: PrismaClient;
// };

// function createPrismaClient(): PrismaClient {
//   if (!process.env.DATABASE_URL) {
//     throw new Error("DATABASE_URL is required to initialize Prisma.");
//   }

//   return new PrismaClient({
//     adapter: new PrismaPg(process.env.DATABASE_URL),
//   });
// }

// export function getPrisma() {
//   if (!globalForPrisma.prisma) {
//     globalForPrisma.prisma = createPrismaClient();
//   }

//   return globalForPrisma.prisma;
// }

// export const prisma = new Proxy({} as PrismaClient, {
//   get(_target, prop, receiver) {
//     const client = getPrisma();
//     const value = Reflect.get(client, prop, receiver);

//     return typeof value === "function" ? value.bind(client) : value;
//   },
// });
