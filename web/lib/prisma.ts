import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Falta DATABASE_URL en el entorno.");
}

function sanitizeDatabaseUrl(url: string) {
  try {
    const u = new URL(url);
    // Evita que pg-connection-string derive opciones SSL que sobrescriban
    // la configuración explícita de `ssl` en el Pool.
    u.searchParams.delete("sslmode");
    u.searchParams.delete("ssl");
    u.searchParams.delete("uselibpqcompat");
    return u.toString();
  } catch {
    return url;
  }
}

const pool = new Pool({
  connectionString: sanitizeDatabaseUrl(databaseUrl),
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

