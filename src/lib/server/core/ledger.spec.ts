import { describe, expect, it } from "vitest";
import { placeCheckpoints } from "./ledger";
import type { AccountState, TransactionWithRelations } from "./types";

const tx = (id: number) =>
  ({
    id,
    transactedAt: new Date(2026, 10, id),
    created: new Date(2026, 10, id),
  }) as TransactionWithRelations;
const checkpoint = (id: number) =>
  ({ id, amount: 100, created: new Date(2026, 10, id) }) as AccountState;

const label = (entries: ReturnType<typeof placeCheckpoints>) =>
  entries.map((e) =>
    e.kind === "checkpoint" ? `c${e.checkpoint.id}` : `t${e.transaction.id}`,
  );

describe("placeCheckpoints", () => {
  it("interleaves checkpoints at their merged positions", () => {
    // merged order: t1 c1 t2 t3 c2
    const entries = placeCheckpoints(
      [checkpoint(1), checkpoint(2)],
      [1, 4],
      [tx(1), tx(2), tx(3)],
      0,
      10,
    );
    expect(label(entries)).toEqual(["t1", "c1", "t2", "t3", "c2"]);
  });

  it("fills a later page from the transactions that start at its first slot", () => {
    // merged order: t1 c1 t2 t3 c2 t4; page of 3 starting at slot 3
    const entries = placeCheckpoints(
      [checkpoint(1), checkpoint(2)],
      [1, 4],
      [tx(3), tx(4)],
      3,
      3,
    );
    expect(label(entries)).toEqual(["t3", "c2", "t4"]);
  });

  it("shows a leading checkpoint and tolerates running out of transactions", () => {
    const entries = placeCheckpoints([checkpoint(1)], [0], [], 0, 10);
    expect(label(entries)).toEqual(["c1"]);
  });
});
