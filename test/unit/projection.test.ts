import { describe, expect, it } from "vitest";
import { balanceDelta, projectBalance } from "../../server/utils/projection";

const accounts = new Set([1, 2]);
const EXTERNAL = 99;

describe("balanceDelta", () => {
  it("adds money flowing in", () => {
    expect(
      balanceDelta({ amount: 100, sourceId: EXTERNAL, targetId: 1 }, accounts),
    ).toBe(100);
  });

  it("subtracts money flowing out", () => {
    expect(
      balanceDelta({ amount: 40, sourceId: 2, targetId: EXTERNAL }, accounts),
    ).toBe(-40);
  });

  it("ignores transfers between tracked accounts", () => {
    expect(
      balanceDelta({ amount: 40, sourceId: 1, targetId: 2 }, accounts),
    ).toBe(0);
  });

  it("ignores transactions between untracked accounts", () => {
    expect(
      balanceDelta({ amount: 40, sourceId: EXTERNAL, targetId: 3 }, accounts),
    ).toBe(0);
  });
});

describe("projectBalance", () => {
  const pending = [
    { amount: 50, sourceId: 1, targetId: EXTERNAL, at: new Date(2026, 10, 12) },
    { amount: 30, sourceId: 1, targetId: EXTERNAL, at: new Date(2026, 10, 25) },
    { amount: 900, sourceId: EXTERNAL, targetId: 1, at: new Date(2026, 11, 3) },
  ];

  it("only applies transactions before the cut-off", () => {
    const result = projectBalance(
      1000,
      pending,
      accounts,
      new Date(2026, 10, 30),
    );
    expect(result).toEqual({
      projected: 920,
      pendingTotal: -80,
      pendingCount: 2,
    });
  });

  it("treats the cut-off as exclusive", () => {
    const result = projectBalance(
      1000,
      pending,
      accounts,
      new Date(2026, 10, 12),
    );
    expect(result.pendingCount).toBe(0);
    expect(result.projected).toBe(1000);
  });

  it("includes later income for later cut-offs", () => {
    const result = projectBalance(
      1000,
      pending,
      accounts,
      new Date(2026, 11, 11),
    );
    expect(result.projected).toBe(1820);
  });
});
