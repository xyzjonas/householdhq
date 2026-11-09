import { Prisma } from "@prisma/client";
import { monthlyFlow, type Flow } from "./flow";
import type { Db } from "./prisma";
import { TagInput, TagPatch } from "./schemas";
import {
  ConflictError,
  NotFoundError,
  type MonthlySpend,
  type Tag,
  type TagWithActivity,
} from "./types";

function rethrow(e: unknown, name?: string | null): never {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") {
      throw new ConflictError(`Tag '${name}' already exists`);
    }
    if (e.code === "P2025") {
      throw new NotFoundError("Tag", name ?? "?");
    }
  }
  throw e;
}

export function tagsRepo(db: Db) {
  return {
    list(): Promise<Tag[]> {
      return db.tag.findMany({ orderBy: { name: "asc" } });
    },

    /**
     * All tags with the money spent / received in `[from, to)`. A transaction
     * counts towards every tag it carries, so the totals of different tags
     * overlap. Same definition of "spent" as for categories: cancelled and
     * pending transactions are ignored and transfers between household
     * accounts are neither spending nor income.
     */
    async listWithActivity(range: {
      from: Date;
      to: Date;
    }): Promise<TagWithActivity[]> {
      const [tags, transactions] = await Promise.all([
        db.tag.findMany({ orderBy: { name: "asc" } }),
        db.transaction.findMany({
          where: {
            tags: { some: {} },
            cancelled: false,
            confirmed: true,
            transactedAt: { gte: range.from, lt: range.to },
          },
          select: {
            amount: true,
            source: { select: { isOut: true } },
            target: { select: { isOut: true } },
            tags: { select: { id: true } },
          },
        }),
      ]);
      const activity = new Map<
        number,
        { spent: number; received: number; entries: number }
      >();
      for (const t of transactions) {
        const spent = !t.source.isOut && t.target.isOut;
        const received = t.source.isOut && !t.target.isOut;
        for (const { id } of t.tags) {
          const a = activity.get(id) ?? { spent: 0, received: 0, entries: 0 };
          a.entries += 1;
          if (spent) a.spent += t.amount;
          if (received) a.received += t.amount;
          activity.set(id, a);
        }
      }
      return tags.map((tag) => ({
        ...tag,
        spent: 0,
        received: 0,
        entries: 0,
        ...activity.get(tag.id),
      }));
    },

    /** Money moved by a tag's transactions per calendar month, see `categories.spendingByMonth`. */
    spendingByMonth(
      id: number,
      range: { from?: Date; to: Date },
      flow: Flow = "spent",
    ): Promise<MonthlySpend[]> {
      return monthlyFlow(db, { tags: { some: { id } } }, range, flow);
    },

    async get(id: number): Promise<Tag> {
      const tag = await db.tag.findUnique({ where: { id } });
      if (!tag) throw new NotFoundError("Tag", id);
      return tag;
    },

    async create(input: TagInput): Promise<Tag> {
      const data = TagInput.parse(input);
      try {
        return await db.tag.create({ data });
      } catch (e) {
        rethrow(e, data.name);
      }
    },

    async update(id: number, input: TagPatch): Promise<Tag> {
      const data = TagPatch.parse(input);
      try {
        return await db.tag.update({ where: { id }, data });
      } catch (e) {
        rethrow(e, data.name ?? String(id));
      }
    },

    /** Removes the tag from every transaction it was on; the transactions stay. */
    async remove(id: number): Promise<void> {
      try {
        await db.$transaction([
          // Child tags would otherwise block the delete; they become top level.
          db.tag.updateMany({
            where: { parentId: id },
            data: { parentId: null },
          }),
          db.tag.delete({ where: { id } }),
        ]);
      } catch (e) {
        rethrow(e, String(id));
      }
    },
  };
}
