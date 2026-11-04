import { describe, expect, it } from "vitest";
import {
  evaluate,
  hasOperator,
  press,
  prettyTape,
  type Key,
} from "./calculator";

const type = (keys: string, from = "") =>
  [...keys].reduce((tape, k) => press(tape, k as Key), from);

describe("press", () => {
  it("appends digits and avoids leading zeros", () => {
    expect(type("123")).toBe("123");
    expect(type("007")).toBe("7");
    expect(type("0.5")).toBe("0.5");
  });

  it("allows a single decimal point per number, capped at two decimals", () => {
    expect(type("1..2")).toBe("1.2");
    expect(type("1.234")).toBe("1.23");
    expect(type("1.5+2.5")).toBe("1.5+2.5");
  });

  it("prefixes a bare decimal point with zero", () => {
    expect(type(".")).toBe("0.");
    expect(type("5+.")).toBe("5+0.");
  });

  it("rejects a leading operator and replaces a doubled one", () => {
    expect(type("+-")).toBe("");
    expect(type("5+-")).toBe("5-");
  });

  it("removes the last char on back and resets on clear", () => {
    expect(press("12+3", "back")).toBe("12+");
    expect(press("12+3", "clear")).toBe("");
  });

  it("evaluates on =", () => {
    expect(type("1200+250=")).toBe("1450");
    expect(type("10-3.5=")).toBe("6.5");
    expect(type("5-9=")).toBe("");
    expect(type("42=")).toBe("42");
  });

  it("caps the tape length", () => {
    expect(type("1".repeat(30))).toHaveLength(14);
  });
});

describe("evaluate", () => {
  it("sums and subtracts", () => {
    expect(evaluate("1200+250-50")).toBe(1400);
  });
  it("ignores a trailing operator", () => {
    expect(evaluate("12+")).toBe(12);
  });
  it("avoids float noise", () => {
    expect(evaluate("0.1+0.2")).toBe(0.3);
  });
  it("is 0 for an empty tape", () => {
    expect(evaluate("")).toBe(0);
  });
});

describe("helpers", () => {
  it("detects operators", () => {
    expect(hasOperator("1+2")).toBe(true);
    expect(hasOperator("12")).toBe(false);
  });
  it("pretty prints", () => {
    expect(prettyTape("")).toBe("0");
    expect(prettyTape("1+2")).toBe("1 + 2");
  });
});
