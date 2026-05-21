import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../prisma/generated/client";

const connectionString = process.env.DATABASE_URL!;
const schema = new URL(connectionString).searchParams.get("schema") ?? "public";

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

// Pass schema as second arg — adapter exposes it via getConnectionInfo(),
// which Prisma's WASM query engine reads to set search_path before queries.
const adapter = new PrismaPg(pool, { schema });
export const prisma = new PrismaClient({ adapter });
