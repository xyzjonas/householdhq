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

async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = await scryptAsync(password, Buffer.from(salt, "hex"), 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

const publicSelect = { id: true, email: true } as const;

export function usersRepo(db: Db) {
  return {
    list(): Promise<PublicUser[]> {
      return db.user.findMany({ select: publicSelect, orderBy: { id: "asc" } });
    },

    async get(id: number): Promise<PublicUser> {
      const user = await db.user.findUnique({
        where: { id },
        select: publicSelect,
      });
      if (!user) throw new NotFoundError("User", id);
      return user;
    },

    async create(input: UserInput): Promise<PublicUser> {
      const { email, password } = UserInput.parse(input);
      try {
        return await db.user.create({
          data: { email, password: await hashPassword(password) },
          select: publicSelect,
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

    async remove(id: number): Promise<void> {
      try {
        await db.user.delete({ where: { id } });
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
      const user = await db.user.findUnique({ where: { email } });
      if (!user || !(await verifyPassword(password, user.password))) {
        return null;
      }
      return { id: user.id, email: user.email };
    },
  };
}
