import { captureException, flush } from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DomainError, serializeError } from "./errors";
import { logger } from "./logger";

const log = logger.child({ module: "api" });

// ============================================================================
// Types
// ============================================================================

type RouteContext = {
  params: Promise<Record<string, string>>;
};

type ApiHandlerFn<T = unknown> = (req: Request, context: RouteContext) => Promise<T | Response>;

// ============================================================================
// API Handler Wrapper
// ============================================================================

/**
 * Unified API route wrapper that provides:
 * - Request/response logging with timing
 * - Automatic error handling (DomainError, ZodError, unexpected)
 * - Automatic JSON response wrapping
 **/
export function apiHandler<T = unknown>(
  handler: ApiHandlerFn<T>
): (req: Request, context: RouteContext) => Promise<Response> {
  return async (req: Request, context: RouteContext) => {
    const startTime = Date.now();
    const url = new URL(req.url);
    const requestId = crypto.randomUUID().slice(0, 8);

    // Build query string object (exclude empty values)
    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      if (value) query[key] = value;
    });

    log.info(
      {
        requestId,
        method: req.method,
        path: url.pathname,
        query: Object.keys(query).length > 0 ? query : undefined,
      },
      "Request"
    );

    try {
      const result = await handler(req, context);
      const duration = Date.now() - startTime;

      // If handler returns Response, use it directly
      if (result instanceof Response) {
        log.info({ requestId, status: result.status, duration }, "Response");
        return result;
      }

      // Otherwise wrap in JSON response
      const response = NextResponse.json(result);
      log.info({ requestId, status: 200, duration }, "Response");
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const response = await handleError(error, requestId);

      log.info({ requestId, status: response.status, duration }, "Response");

      return response;
    }
  };
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Maps errors to HTTP responses.
 * Used internally by apiHandler, but exported for edge cases.
 */
async function handleError(error: unknown, requestId?: string): Promise<NextResponse> {
  // Handle domain errors (expected business logic errors)
  if (error instanceof DomainError) {
    if (error.statusCode >= 500) {
      captureException(error);
      await flush(2000);
    }

    log.warn(
      {
        requestId,
        error: serializeError(error),
      },
      error.message
    );

    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error.details && { details: error.details }),
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    log.warn({ requestId, issues: error.issues }, "Validation error");
    return NextResponse.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 }
    );
  }

  // Handle unexpected errors
  captureException(error);
  log.error({ requestId, err: serializeError(error) }, "Unexpected error");
  await flush(2000);
  return NextResponse.json(
    {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    },
    { status: 500 }
  );
}
