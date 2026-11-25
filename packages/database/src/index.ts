import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";
export * from "./generated/client";

export function createDb(url = process.env.DATABASE_URL ?? "postgresql://bleusim:bleusim_dev@localhost:5432/bleusim") {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
}
export type Db = ReturnType<typeof createDb>;
