import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { Prisma } from "@prisma/client";
import type { Db } from "./prisma";
import { UserInput } from "./schemas";
import { ConflictError, NotFoundError, type PublicUser } from "./types";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

/** 24 url-safe characters, 144 bits of entropy. */
function generatePassword(): string {
  return randomBytes(18).toString("base64url");
}

async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = await scryptAsync(password, Buffer.from(salt, "hex"), 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export const publicUserSelect = {
  id: true,
  email: true,
  isSuperuser: true,
} as const;

// Verified against when the email is unknown, so response time does not
// reveal which emails exist.
const DUMMY_HASH = `scrypt$${"00".repeat(16)}$${"00".repeat(64)}`;

export function usersRepo(db: Db) {
  return {
    count(): Promise<number> {
      return db.user.count();
    },

    list(): Promise<PublicUser[]> {
      return db.user.findMany({
        select: publicUserSelect,
        orderBy: { id: "asc" },
      });
    },

    async get(id: number): Promise<PublicUser> {
      const user = await db.user.findUnique({
        where: { id },
        select: publicUserSelect,
      });
      if (!user) throw new NotFoundError("User", id);
      return user;
    },

    async create(
      input: UserInput,
      { isSuperuser = false }: { isSuperuser?: boolean } = {},
    ): Promise<PublicUser> {
      const { email, password } = UserInput.parse(input);
      try {
        return await db.user.create({
          data: {
            email,
            password: await hashPassword(password),
            isSuperuser,
          },
          select: publicUserSelect,
        });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002"
        ) {
          throw new ConflictError(`User '${email}' already exists`);
        }
        throw e;
      }
    },

    /**
     * Creates a user with a random one-time password. The password is only
     * returned here (and by `reissueInvite`); it is never stored in the clear.
     */
    async invite(
      email: string,
    ): Promise<{ user: PublicUser; password: string }> {
      const password = generatePassword();
      const user = await this.create({ email, password });
      return { user, password };
    },

    /** Replaces the user's password with a fresh random one-time password. */
    async reissueInvite(
      id: number,
    ): Promise<{ user: PublicUser; password: string }> {
      const password = generatePassword();
      const user = await this.setPassword(id, password);
      return { user, password };
    },

    /** Sets a new password and signs the user out everywhere. */
    async setPassword(id: number, password: string): Promise<PublicUser> {
      const parsed = UserInput.shape.password.parse(password);
      try {
        const [user] = await db.$transaction([
          db.user.update({
            where: { id },
            data: { password: await hashPassword(parsed) },
            select: publicUserSelect,
          }),
          db.session.deleteMany({ where: { userId: id } }),
        ]);
        return user;
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2025"
        ) {
          throw new NotFoundError("User", id);
        }
        throw e;
      }
    },

    /** Deletes the user and their sessions. The last superuser is kept. */
    async remove(id: number): Promise<void> {
      const target = await db.user.findUnique({
        where: { id },
        select: { isSuperuser: true },
      });
      if (!target) throw new NotFoundError("User", id);
      if (
        target.isSuperuser &&
        (await db.user.count({ where: { isSuperuser: true } })) <= 1
      ) {
        throw new ConflictError("The last superuser cannot be deleted");
      }
      try {
        await db.$transaction([
          db.session.deleteMany({ where: { userId: id } }),
          db.user.delete({ where: { id } }),
        ]);
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2025"
        ) {
          throw new NotFoundError("User", id);
        }
        throw e;
      }
    },

    /** Returns the user when the credentials match, otherwise null. */
    async authenticate(
      email: string,
      password: string,
    ): Promise<PublicUser | null> {
      const user = await db.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
      const ok = await verifyPassword(password, user?.password ?? DUMMY_HASH);
      if (!user || !ok) return null;
      return {
        id: user.id,
        email: user.email,
        isSuperuser: user.isSuperuser,
      };
    },
  };
}
