import { describe, expect, it } from "vitest";
import { CreateProjectSchema, EditProjectSchema } from "../../types/project";
import {
  CreateSourceSchema,
  EditSourceSchema,
  SourceTypeSchema,
} from "../../types/source";
import { CreateTagSchema, EditTagSchema } from "../../types/tag";
import {
  CreateTransactionSchema,
  TransactionMonthSchema,
  TransactionFiltersSchema,
} from "../../types/transaction";

describe("Project API validation", () => {
  it("validates create project payload", () => {
    const valid = {
      name: "New Project",
      estimate: 100,
    };
    const result = CreateProjectSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects project with missing name", () => {
    const invalid = { estimate: 100 };
    const result = CreateProjectSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("validates edit project payload", () => {
    const valid = {
      id: 1,
      name: "Updated Project",
      isCompleted: true,
    };
    const result = EditProjectSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});

describe("Source API validation", () => {
  it("validates create source payload", () => {
    const valid = { name: "Checking Account" };
    const result = CreateSourceSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("validates source type enum", () => {
    const validTypes = [
      "ACCOUNT",
      "CASH",
      "SAVINGS",
      "DEBT",
      "INVESTMENT",
      "OUT",
    ];
    validTypes.forEach((type) => {
      const result = SourceTypeSchema.safeParse(type);
      expect(result.success).toBe(true);
    });
  });

  it("rejects invalid source type", () => {
    const result = SourceTypeSchema.safeParse("INVALID_TYPE");
    expect(result.success).toBe(false);
  });

  it("validates edit source with string position coercion", () => {
    const valid = {
      id: "1",
      name: "Updated Account",
      position: "5",
    };
    const result = EditSourceSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});

describe("Tag API validation", () => {
  it("validates create tag payload", () => {
    const valid = { name: "Important" };
    const result = CreateTagSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("validates edit tag with optional fields", () => {
    const valid = {
      id: 1,
      description: "Budget-related tag",
      color: "#FF5733",
    };
    const result = EditTagSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects tag missing id in edit", () => {
    const invalid = { name: "Updated Tag" };
    const result = EditTagSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe("Transaction API validation", () => {
  it("validates create transaction payload", () => {
    const valid = {
      description: "Groceries",
      amount: 50.5,
      sourceId: 1,
      targetId: 2,
    };
    const result = CreateTransactionSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("validates transaction month filters with coercion", () => {
    const valid = {
      month: "3",
      year: "2026",
    };
    const result = TransactionMonthSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.month).toBe(3);
      expect(result.data.year).toBe(2026);
    }
  });

  it("validates transaction filters with boolean coercion", () => {
    const testCases = [
      { value: "true", expected: true },
      { value: "false", expected: false },
      { value: "1", expected: true },
      { value: "0", expected: false },
    ];

    testCases.forEach(({ value, expected }) => {
      const result = TransactionFiltersSchema.safeParse({
        important: value,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.important).toBe(expected);
      }
    });
  });

  it("validates transaction filters with category id", () => {
    const valid = {
      categoryId: "5",
      important: true,
    };
    const result = TransactionFiltersSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categoryId).toBe(5);
    }
  });
});
