/**
 * Test data factories for E2E tests
 * These functions generate consistent test data with unique identifiers
 */

export type TestUser = {
  email: string;
  password: string;
  name: string;
};

export type TestNote = {
  title: string;
  content: string;
};

/**
 * Creates a test user with unique email
 * @param index - Unique identifier for the user (use Date.now() or workerIndex)
 */
export function createTestUser(index: number | string): TestUser {
  const timestamp = typeof index === "number" ? index : Date.now();
  const random = Math.floor(Math.random() * 1000000);
  const uniqueId = `${timestamp}.${random}`;
  return {
    email: `test.user.${uniqueId}@tech-stack.io`,
    password: "TestPassword123!",
    name: `Test User ${uniqueId}`,
  };
}

/**
 * Creates a test note with unique title
 * @param index - Unique identifier for the note
 */
export function createTestNote(index: number | string): TestNote {
  return {
    title: `Test Note ${index}`,
    content: `This is test note content ${index}. It can contain multiple lines.`,
  };
}

/**
 * Creates multiple test notes
 * @param count - Number of notes to create
 * @param startIndex - Starting index for note numbering
 */
export function createTestNotes(count: number, startIndex: number = 1): TestNote[] {
  return Array.from({ length: count }, (_, i) => createTestNote(startIndex + i));
}
