import { createHash, randomBytes } from "node:crypto";
import type { Db } from "./prisma";
import type { PublicUser } from "./types";

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
/** Sessions closer to expiry than this are extended on use. */
const RENEW_WITHIN_MS = SESSION_TTL_MS / 2;

const hash = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export interface ValidSession {
  user: PublicUser;
  expiresAt: Date;
  /** True when the expiry was pushed out and the cookie should be refreshed. */
  renewed: boolean;
}

/**
 * Server-side sessions. Only a sha256 of the random token is stored, so a
 * leaked database cannot be used to hijack sessions.
 */
export function sessionsRepo(db: Db) {
  return {
    async create(userId: number): Promise<{ token: string; expiresAt: Date }> {
      const token = randomBytes(32).toString("base64url");
      const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
      await db.session.create({ data: { id: hash(token), userId, expiresAt } });
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
        select: { id: true, email: true },
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
      return { user, expiresAt, renewed };
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
