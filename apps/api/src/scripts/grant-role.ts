// Bootstrap staff access from a trusted shell (there is deliberately no HTTP path to become the first admin).
// Usage: DATABASE_URL=... pnpm --filter @bleusim/api grant-role <email> <ROLE>
import { createDb } from "@bleusim/database";

const ROLES = ["CUSTOMER", "SUPPORT", "CATALOG_MANAGER", "FINANCE", "ADMIN"] as const;
const [email, role] = process.argv.slice(2);
if (!email || !role || !ROLES.includes(role as (typeof ROLES)[number])) {
  console.error(`Usage: grant-role <email> <${ROLES.join("|")}>`);
  process.exit(1);
}
const db = createDb();
const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
if (!user) { console.error("No user with that email. Register first."); process.exit(1); }
await db.user.update({ where: { id: user.id }, data: { role: role as (typeof ROLES)[number] } });
await db.session.deleteMany({ where: { userId: user.id } });
await db.auditLog.create({ data: { action: "cli.user.role", target: `user:${user.id}`, meta: { from: user.role, to: role } } });
console.log(`${user.email}: ${user.role} -> ${role} (signed out everywhere)`);
await db.$disconnect();
