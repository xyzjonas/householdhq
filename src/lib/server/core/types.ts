/**
 * Domain types exposed by the core layer. The rest of the app imports these
 * instead of reaching into `@prisma/client`.
 */
import type {
  Category,
  Source,
  SourceState,
  SourceType,
  Tag,
  Transaction,
  User,
} from "@prisma/client";

export type { Category, SourceType, Tag };

/** Accounts are stored in the `Source` table. */
export type Account = Source;
export type AccountState = SourceState;
export type AccountWithBalance = Account & { balance: number };

/** Users never leave the core layer with their password hash attached. */
export type PublicUser = Omit<User, "password">;

export type TransactionWithRelations = Transaction & {
  category: Category | null;
  source: Account;
  target: Account;
  tags: Tag[];
};

export interface Page<T> {
  items: T[];
  total: number;
}

export interface Balances {
  /** Sum of accounts marked as available to spend */
  liquid: number;
  /** Sum of all owned (non-"out") accounts */
  total: number;
  /** Per account type totals */
  byType: Partial<Record<SourceType, number>>;
}

export class NotFoundError extends Error {
  constructor(entity: string, id: number | string) {
    super(`${entity} '${id}' not found`);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}
