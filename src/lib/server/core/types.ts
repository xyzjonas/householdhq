/**
 * Domain types exposed by the core layer. The rest of the app imports these
 * instead of reaching into `@prisma/client`.
 */
import type {
  AppSettings,
  Category,
  Meter,
  MeterState,
  Source,
  SourceState,
  SourceType,
  Tag,
  Transaction,
  User,
  Vehicle,
  VehicleComponent,
  VehicleFuelEntry,
  VehicleServiceEntry,
} from "@prisma/client";

export type {
  AppSettings,
  Category,
  Meter,
  SourceType,
  Tag,
  Vehicle,
  VehicleComponent,
};

/** The part of an entry's transaction the vehicle pages show. */
export type EntryTransaction = Pick<
  Transaction,
  "id" | "transactedAt" | "description" | "amount" | "currency"
>;

export type FuelEntry = VehicleFuelEntry & {
  transaction: EntryTransaction;
  /** The full tank this fill-up is measured against. */
  previousFullTankFuelEntry: Pick<
    VehicleFuelEntry,
    "id" | "fueledAt" | "odometer" | "isFullTank"
  > | null;
};

export type ServiceEntry = VehicleServiceEntry & {
  transaction: EntryTransaction;
  components: VehicleComponent[];
};

/** A vehicle with its fuel and service journals, newest first. */
export type VehicleDetail = Vehicle & {
  category: Category | null;
  fuelCategory: Category | null;
  fuelEntries: FuelEntry[];
  serviceEntries: ServiceEntry[];
};

/** A reading of a meter (electricity, water, …) at a point in time. */
export type MeterReading = MeterState;

/** A meter with its readings, newest first. */
export type MeterWithReadings = Meter & { readings: MeterReading[] };

/** A category with its activity within a date range. */
export type CategoryWithActivity = Category & {
  /** Money moved from household accounts to external ("out") accounts. */
  spent: number;
  /** Money received from external accounts. */
  received: number;
};

/** Money spent in a category during the calendar month starting `monthStart`. */
export interface MonthlySpend {
  monthStart: Date;
  spent: number;
}

/** Accounts are stored in the `Source` table. */
export type Account = Source;
export type AccountState = SourceState;
export type AccountWithBalance = Account & { balance: number };

/** One row of an account's journal: a transaction or a balance checkpoint. */
export type LedgerEntry =
  | { kind: "transaction"; at: Date; transaction: TransactionWithRelations }
  | { kind: "checkpoint"; at: Date; checkpoint: AccountState };

export interface CheckpointSuggestion {
  /** Balance according to the previous checkpoint and the transactions since. */
  balance: number;
  previous: AccountState | null;
}

export interface CheckpointResult {
  checkpoint: AccountState;
  /** The "manko" transaction covering the difference; null when there was none. */
  adjustment: TransactionWithRelations | null;
}

export interface AccountTrajectory {
  /** Closing balance per calendar month, oldest first. */
  points: { monthStart: Date; balance: number }[];
  /** Balance expected at the end of the current month. */
  projectedMonthEnd: number;
}

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
  /** Sum of all owned (non-"out") accounts, excluding retirement */
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
