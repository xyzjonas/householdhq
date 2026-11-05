import { describe, expect, it } from "vitest";
import type { TransactionWithRelations } from "#lib/server/core/types.ts";
import { availableToSpend, liquidImpact } from "./upcoming";

const acc = (isDisponible: boolean, isOut = false) => ({
  isDisponible,
  isOut,
});
const tx = (
  amount: number,
  source: ReturnType<typeof acc>,
  target: ReturnType<typeof acc>,
) => ({ amount, source, target }) as unknown as TransactionWithRelations;

describe("liquidImpact", () => {
  it("is negative for spending from a liquid account", () => {
    expect(liquidImpact(tx(100, acc(true), acc(false, true)))).toBe(-100);
  });
  it("is positive for income into a liquid account", () => {
    expect(liquidImpact(tx(500, acc(false, true), acc(true)))).toBe(500);
  });
  it("is neutral between two liquid accounts", () => {
    expect(liquidImpact(tx(50, acc(true), acc(true)))).toBe(0);
  });
  it("counts moves into savings as leaving liquid", () => {
    expect(liquidImpact(tx(50, acc(true), acc(false)))).toBe(-50);
  });
});

describe("availableToSpend", () => {
  it("subtracts upcoming spending from the liquid balance", () => {
    const upcoming = [
      tx(100, acc(true), acc(false, true)),
      tx(30, acc(true), acc(false, true)),
    ];
    expect(availableToSpend(1000, upcoming)).toBe(870);
  });
});
