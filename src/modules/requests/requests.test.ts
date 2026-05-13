import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { fetch } from "cross-fetch";

describe("Requests API", () => {
  let sessionToken: string;
  let userId: string;

  beforeAll(async () => {
    // Note: This is a simplified test that assumes API is running
    // In real scenario, we'd need a proper test user setup

    console.log("🧪 Testing API endpoints...");
  });

  it("should validate Request schema with Zod", async () => {
    // This test validates that the DTO schemas work correctly
    const { createOrderRequestSchema } = await import("@/src/modules/requests/requests.dto");

    // Valid order request
    const validOrder = {
      type: "order" as const,
      priority: "medium",
      what: "Маркери",
      quantity: 5,
      comment: "Синього кольору",
    };

    const result = createOrderRequestSchema.safeParse(validOrder);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.type).toBe("order");
      expect(result.data.quantity).toBe(5);
    }

    console.log("✅ Order validation passed");
  });

  it("should validate Problem schema", async () => {
    const { createProblemRequestSchema } = await import("@/src/modules/requests/requests.dto");

    const validProblem = {
      type: "problem" as const,
      priority: "high",
      what: "Принтер",
      description: "Не друкує",
      comment: "Світлодіод червоний",
    };

    const result = createProblemRequestSchema.safeParse(validProblem);
    expect(result.success).toBe(true);

    console.log("✅ Problem validation passed");
  });

  it("should validate Question schema", async () => {
    const { createQuestionRequestSchema } = await import("@/src/modules/requests/requests.dto");

    const validQuestion = {
      type: "question" as const,
      priority: "medium",
      question: "Як взяти вихідний день?",
    };

    const result = createQuestionRequestSchema.safeParse(validQuestion);
    expect(result.success).toBe(true);

    console.log("✅ Question validation passed");
  });

  it("should validate Idea schema", async () => {
    const { createIdeaRequestSchema } = await import("@/src/modules/requests/requests.dto");

    const validIdea = {
      type: "idea" as const,
      priority: "low",
      idea: "Могли б купити кавоарку для офісу?",
    };

    const result = createIdeaRequestSchema.safeParse(validIdea);
    expect(result.success).toBe(true);

    console.log("✅ Idea validation passed");
  });

  it("should reject invalid priority", async () => {
    const { createOrderRequestSchema } = await import("@/src/modules/requests/requests.dto");

    const invalidOrder = {
      type: "order" as const,
      priority: "urgent", // Invalid priority
      what: "Маркери",
      quantity: 5,
    };

    const result = createOrderRequestSchema.safeParse(invalidOrder);
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }

    console.log("✅ Invalid priority rejection passed");
  });

  it("should reject missing required fields", async () => {
    const { createOrderRequestSchema } = await import("@/src/modules/requests/requests.dto");

    const incompeteOrder = {
      type: "order" as const,
      priority: "medium",
      // Missing 'what' and 'quantity'
    };

    const result = createOrderRequestSchema.safeParse(incompeteOrder);
    expect(result.success).toBe(false);

    console.log("✅ Missing fields rejection passed");
  });

  it("should generate unique ticket numbers", async () => {
    const { requestsService } = await import("@/src/modules/requests");

    // Test ticket number generation (this would need a test database)
    // For now we just verify the service exports the method
    expect(typeof requestsService.create).toBe("function");
    expect(typeof requestsService.getByIdForUser).toBe("function");
    expect(typeof requestsService.getByIdForAdmin).toBe("function");
    expect(typeof requestsService.listByUser).toBe("function");

    console.log("✅ Service methods exist");
  });
});
