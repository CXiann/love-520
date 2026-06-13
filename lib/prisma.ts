import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/app/generated/prisma/client";

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  });
  return new PrismaClient({ adapter });
}

/** Bump when SiteSettings schema changes so dev HMR drops a stale cached client. */
const PRISMA_GEN = 4;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaGen?: number;
};

function clientHasCurrentSchema(client: PrismaClient): boolean {
  if (!("memoryDoll" in client) || !("siteSettings" in client)) {
    return false;
  }

  const fields = (
    client as unknown as {
      _runtimeDataModel?: {
        models?: {
          SiteSettings?: { fields?: { name: string }[] };
        };
      };
    }
  )._runtimeDataModel?.models?.SiteSettings?.fields;

  return fields?.some((f) => f.name === "chapter1VideoUrl") ?? false;
}

/** Dev HMR can keep a stale PrismaClient after schema changes — validate before reuse. */
function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (
    cached &&
    globalForPrisma.prismaGen === PRISMA_GEN &&
    clientHasCurrentSchema(cached)
  ) {
    return cached;
  }

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaGen = PRISMA_GEN;
  }
  return client;
}

export const prisma = getPrismaClient();

export { createPrismaClient };
