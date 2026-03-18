import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Falta DATABASE_URL en el entorno.");
}

const pool = new Pool({
  connectionString: databaseUrl,
  // Supabase (y su pooler) puede presentar una cadena de certificados que
  // Node/pg considera "self-signed". En serverless (Vercel) es común forzar
  // no verificar el CA para evitar P1011.
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

