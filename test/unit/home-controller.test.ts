import { beforeEach, describe, expect, it, vi } from "vitest";
import home from "../../server/controllers/home";

const prisma = vi.hoisted(() => ({
  appSettings: { findUnique: vi.fn(), create: vi.fn() },
  source: { findMany: vi.fn() },
  transaction: { aggregate: vi.fn(), findMany: vi.fn() },
}));

vi.mock("../../server/controllers/prisma-client", () => ({ prisma }));

const NOW = new Date(2026, 10, 5, 12);

const settings = (fiscalPeriodEndDay: number) =>
  prisma.appSettings.findUnique.mockResolvedValue({
    id: 1,
    currency: "CZK",
    fiscalPeriodEndDay,
  });

beforeEach(() => {
  vi.resetAllMocks();
  settings(31);
});

describe("Home.resolvePeriod", () => {
  it("resolves the current period from the configured end day", async () => {
    settings(10);
    const { info } = await home.resolvePeriod(undefined, NOW);
    expect(info).toMatchObject({
      key: "2026-11",
      startDay: "2026-10-11",
      endDay: "2026-11-10",
      isCurrent: true,
      fiscalPeriodEndDay: 10,
    });
  });

  it("flags other periods as not current", async () => {
    const { info } = await home.resolvePeriod("2026-09", NOW);
    expect(info).toMatchObject({ key: "2026-09", isCurrent: false });
  });
});

describe("Home.getBalance", () => {
  it("projects the balance to month and fiscal period ends", async () => {
    settings(10);
    prisma.source.findMany.mockResolvedValue([
      {
        id: 1,
        states: [{ created: new Date(2026, 10, 1), amount: 1000 }],
      },
    ]);
    // 200 earned and 50 spent since the last recorded state
    prisma.transaction.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 200 } })
      .mockResolvedValueOnce({ _sum: { amount: 50 } });
    prisma.transaction.findMany.mockResolvedValue([
      // due before the fiscal period ends (10 Nov)
      {
        amount: 100,
        sourceId: 1,
        targetId: 99,
        transactedAt: new Date(2026, 10, 8),
      },
      // overdue, never confirmed
      {
        amount: 10,
        sourceId: 1,
        targetId: 99,
        transactedAt: new Date(2026, 10, 2),
      },
      // after the fiscal period, within the calendar month
      {
        amount: 300,
        sourceId: 1,
        targetId: 99,
        transactedAt: new Date(2026, 10, 20),
      },
    ]);

    const result = await home.getBalance(NOW);

    expect(result.balance).toBe(1150);
    expect(result.fiscalPeriodEnd).toEqual({
      date: "2026-11-10",
      projected: 1040,
      pendingTotal: -110,
      pendingCount: 2,
    });
    expect(result.calendarMonthEnd).toEqual({
      date: "2026-11-30",
      projected: 740,
      pendingTotal: -410,
      pendingCount: 3,
    });
  });

  it("handles having no available accounts", async () => {
    prisma.source.findMany.mockResolvedValue([]);
    const result = await home.getBalance(NOW);
    expect(result.balance).toBe(0);
    expect(result.calendarMonthEnd.pendingCount).toBe(0);
    expect(prisma.transaction.findMany).not.toHaveBeenCalled();
  });
});

describe("Home.getPortfolio", () => {
  it("groups accounts by type and flags stale balances", async () => {
    prisma.source.findMany.mockResolvedValue([
      {
        id: 1,
        name: "Main",
        color: null,
        type: "ACCOUNT",
        states: [{ created: new Date(2026, 10, 1), amount: 100 }],
      },
      {
        id: 2,
        name: "Fund",
        color: "#fff",
        type: "INVESTMENT",
        states: [{ created: new Date(2026, 8, 1), amount: 500 }],
      },
      { id: 3, name: "Second", color: null, type: "ACCOUNT", states: [] },
    ]);
    prisma.transaction.aggregate.mockResolvedValue({ _sum: { amount: null } });

    const { groups } = await home.getPortfolio(NOW);

    expect(groups.map((group) => group.type)).toEqual([
      "ACCOUNT",
      "INVESTMENT",
    ]);
    expect(groups[0]).toMatchObject({ total: 100 });
    expect(groups[0]?.sources.map((s) => [s.id, s.stale])).toEqual([
      [1, false],
      [3, true],
    ]);
    expect(groups[1]?.sources[0]).toMatchObject({ balance: 500, stale: true });
  });
});
