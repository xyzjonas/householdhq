import { createHash, randomBytes } from "node:crypto";
import type { RawDb } from "./prisma";
import { publicUserSelect } from "./users";
import type { PublicUser } from "./types";

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
/** Sessions closer to expiry than this are extended on use. */
const RENEW_WITHIN_MS = SESSION_TTL_MS / 2;

const hash = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export interface ValidSession {
  user: PublicUser;
  /** The household the session last worked in; not yet checked against the user's memberships. */
  householdId: number | null;
  expiresAt: Date;
  /** True when the expiry was pushed out and the cookie should be refreshed. */
  renewed: boolean;
}

/**
 * Server-side sessions. Only a sha256 of the random token is stored, so a
 * leaked database cannot be used to hijack sessions.
 */
export function sessionsRepo(db: RawDb) {
  return {
    async create(
      userId: number,
      householdId: number | null = null,
    ): Promise<{ token: string; expiresAt: Date }> {
      const token = randomBytes(32).toString("base64url");
      const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
      await db.session.create({
        data: { id: hash(token), userId, householdId, expiresAt },
      });
      return { token, expiresAt };
    },

    async validate(token: string): Promise<ValidSession | null> {
      const id = hash(token);
      const session = await db.session.findUnique({ where: { id } });
      if (!session) return null;
      if (session.expiresAt.getTime() <= Date.now()) {
        await db.session.deleteMany({ where: { id } });
        return null;
      }
      const user = await db.user.findUnique({
        where: { id: session.userId },
        select: publicUserSelect,
      });
      if (!user) {
        await db.session.deleteMany({ where: { id } });
        return null;
      }
      let expiresAt = session.expiresAt;
      let renewed = false;
      if (expiresAt.getTime() - Date.now() < RENEW_WITHIN_MS) {
        expiresAt = new Date(Date.now() + SESSION_TTL_MS);
        await db.session.update({ where: { id }, data: { expiresAt } });
        renewed = true;
      }
      return {
        user,
        householdId: session.householdId,
        expiresAt,
        renewed,
      };
    },

    /** Remembers the household the session works in (callers verify membership first). */
    async setHousehold(
      token: string,
      householdId: number | null,
    ): Promise<void> {
      await db.session.updateMany({
        where: { id: hash(token) },
        data: { householdId },
      });
    },

    async invalidate(token: string): Promise<void> {
      await db.session.deleteMany({ where: { id: hash(token) } });
    },

    async invalidateAllForUser(userId: number): Promise<void> {
      await db.session.deleteMany({ where: { userId } });
    },

    async deleteExpired(): Promise<number> {
      const { count } = await db.session.deleteMany({
        where: { expiresAt: { lte: new Date() } },
      });
      return count;
    },
  };
}
