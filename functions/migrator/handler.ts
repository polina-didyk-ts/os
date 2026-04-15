/**
 * Migrator Lambda Handler
 *
 * Executes Prisma database migrations on the target database.
 * Designed to be invoked from CI/CD pipelines after deployment.
 *
 * This handler runs `prisma migrate deploy` which:
 * - Applies all pending migrations
 * - Is safe for production (no interactive prompts)
 * - Does NOT create new migrations or modify the schema
 */

import { execSync } from "node:child_process";

/**
 * Migration event payload (optional).
 * Can include configuration or be empty for simple invocation.
 */
export interface MigrationEvent {
  /** Optional: run in dry-run mode (just check, don't apply) */
  dryRun?: boolean;
}

/**
 * Migration result returned by the handler.
 */
export interface MigrationResult {
  success: boolean;
  message: string;
  output?: string;
  error?: string;
  durationMs: number;
}

/**
 * Lambda handler for database migrations.
 *
 * Invocation examples:
 * - AWS CLI: aws lambda invoke --function-name MigratorFunction --payload '{}' response.json
 * - SST CLI: sst shell -- node -e "require('./functions/migrator/handler').handler({})"
 */
export const handler = async (event: MigrationEvent = {}): Promise<MigrationResult> => {
  const startTime = Date.now();
  const { dryRun = false } = event;

  console.info({ dryRun }, "Starting database migration");

  try {
    // Ensure DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // Build the prisma command
    // - migrate deploy: applies pending migrations (safe for production)
    // - No interactive prompts
    const command = dryRun
      ? "./node_modules/.bin/prisma migrate status"
      : "./node_modules/.bin/prisma migrate deploy";

    console.info({ command }, "Executing Prisma command");

    // Execute the migration command
    const output = execSync(command, {
      encoding: "utf-8",
      env: {
        ...process.env,
        // Ensure Prisma can find the schema
        PRISMA_SCHEMA_PATH: "./prisma/schema.prisma",
      },
      // Increase timeout for large migrations
      timeout: 300_000, // 5 minutes
      stdio: ["pipe", "pipe", "pipe"],
    });

    const durationMs = Date.now() - startTime;

    console.info({ output, durationMs }, "Migration completed successfully");

    return {
      success: true,
      message: dryRun ? "Migration status checked" : "Migrations applied successfully",
      output: output.trim(),
      durationMs,
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorOutput =
      error instanceof Error && "stdout" in error
        ? String((error as { stdout?: unknown }).stdout)
        : undefined;

    console.error({ error: errorMessage, durationMs }, "Migration failed");

    return {
      success: false,
      message: "Migration failed",
      error: errorMessage,
      output: errorOutput,
      durationMs,
    };
  }
};
