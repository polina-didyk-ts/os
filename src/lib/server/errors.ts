/**
 * Base error class for domain errors
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "DomainError";
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

/**
 * Common error factory methods
 */
export const Errors = {
  notFound: (resource: string) => new DomainError(`${resource} not found`, "NOT_FOUND", 404),

  forbidden: (reason?: string) => new DomainError(reason || "Access forbidden", "FORBIDDEN", 403),

  unauthorized: (reason?: string) => new DomainError(reason || "Unauthorized", "UNAUTHORIZED", 401),

  badRequest: (message: string, details?: Record<string, unknown>) =>
    new DomainError(message, "BAD_REQUEST", 400, details),

  conflict: (message: string) => new DomainError(message, "CONFLICT", 409),

  limitReached: (resource: string, limit: number) =>
    new DomainError(`${resource} limit of ${limit} reached`, "LIMIT_REACHED", 429, {
      resource,
      limit,
    }),

  internal: (message: string = "Internal server error") =>
    new DomainError(message, "INTERNAL_ERROR", 500),
};

/**
 * Serialized error object for logging.
 * Contains all error details in a format that pino can properly serialize.
 */
export interface SerializedError {
  message: string;
  name?: string;
  code?: string;
  stack?: string;
  cause?: SerializedError;
  [key: string]: unknown;
}

/** Serialize non-Error values */
function serializeNonError(error: unknown): SerializedError {
  if (error === null) {
    return { message: "null" };
  }
  if (error === undefined) {
    return { message: "undefined" };
  }
  if (typeof error === "string") {
    return { message: error };
  }
  if (typeof error === "number" || typeof error === "boolean") {
    return { message: String(error) };
  }
  // For objects (including arrays), try JSON serialization
  try {
    return { message: JSON.stringify(error) };
  } catch {
    return { message: "[Unserializable object]" };
  }
}

/** Add DomainError-specific properties */
function addDomainErrorProps(serialized: SerializedError, error: DomainError): void {
  serialized.code = error.code;
  serialized.statusCode = error.statusCode;
  if (error.details) {
    serialized.details = error.details;
  }
}

/**
 * Serialize an error for logging.
 * Extracts message, name, stack, code, and any additional properties.
 * Handles nested cause chains recursively.
 */
export function serializeError(error: unknown): SerializedError {
  if (!(error instanceof Error)) {
    return serializeNonError(error);
  }

  const serialized: SerializedError = {
    message: error.message,
    name: error.name,
    stack: error.stack,
  };

  if (error instanceof DomainError) {
    addDomainErrorProps(serialized, error);
  }

  // Handle error cause chain (ES2022+)
  if ("cause" in error && error.cause) {
    serialized.cause = serializeError(error.cause);
  }

  // Copy any additional enumerable properties
  for (const key of Object.keys(error)) {
    if (!(key in serialized)) {
      serialized[key] = (error as unknown as Record<string, unknown>)[key];
    }
  }

  return serialized;
}
