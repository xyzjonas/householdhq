import { m } from "#paraglide/messages.js";
/**
 * Domain types exposed by the core layer. The rest of the app imports these
 * instead of reaching into `@prisma/client`.
 */
import type {
  AppSettings,
  Category,
  Household,
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
  Household,
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

/** A tag with its activity within a date range. */
export type TagWithActivity = Tag & {
  /** Money moved from household accounts to external ("out") accounts. */
  spent: number;
  /** Money received from external accounts. */
  received: number;
  /** Completed transactions carrying the tag in the range, whatever their flow. */
  entries: number;
};

/** Money spent (or received, see `spendingByMonth`) in a category during the calendar month starting `monthStart`. */
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

/** A household with the users that belong to it. */
export type HouseholdWithMembers = Household & { members: PublicUser[] };

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

export type NotFoundEntity =
  | "Account"
  | "Category"
  | "Checkpoint"
  | "Component"
  | "Fuel entry"
  | "Household"
  | "Meter"
  | "Meter reading"
  | "Service entry"
  | "Tag"
  | "Transaction"
  | "User"
  | "Vehicle";

/** One message per entity: Czech agrees in gender with the noun. */
function notFoundMessage(entity: NotFoundEntity, id: string): string {
  switch (entity) {
    case "Account":
      return m.core_account_not_found({ id });
    case "Category":
      return m.core_category_not_found({ id });
    case "Checkpoint":
      return m.core_checkpoint_not_found({ id });
    case "Component":
      return m.core_component_not_found({ id });
    case "Fuel entry":
      return m.core_fuel_entry_not_found({ id });
    case "Household":
      return m.core_household_not_found({ id });
    case "Meter":
      return m.core_meter_not_found({ id });
    case "Meter reading":
      return m.core_meter_reading_not_found({ id });
    case "Service entry":
      return m.core_service_entry_not_found({ id });
    case "Tag":
      return m.core_tag_not_found({ id });
    case "Transaction":
      return m.core_transaction_not_found({ id });
    case "User":
      return m.core_user_not_found({ id });
    case "Vehicle":
      return m.core_vehicle_not_found({ id });
  }
}

export class NotFoundError extends Error {
  constructor(entity: NotFoundEntity, id: number | string) {
    super(notFoundMessage(entity, String(id)));
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}
