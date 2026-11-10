import { m } from "#paraglide/messages.js";
import { Prisma } from "@prisma/client";
import { roundMoney } from "./balance";
import type { Db } from "./prisma";
import { requireCategories } from "./refs";
import {
  FuelEntryInput,
  FuelEntryPatch,
  ServiceEntryInput,
  ServiceEntryPatch,
  VehicleComponentInput,
  VehicleComponentPatch,
  VehicleInput,
  VehiclePatch,
} from "./schemas";
import type { settingsRepo } from "./settings";
import {
  ConflictError,
  NotFoundError,
  type FuelEntry,
  type ServiceEntry,
  type Vehicle,
  type VehicleComponent,
  type VehicleDetail,
} from "./types";

/** What the vehicle pages show of an entry's transaction. */
const transactionSummary = {
  select: {
    id: true,
    transactedAt: true,
    description: true,
    amount: true,
    currency: true,
  },
} as const;

const fuelInclude = {
  transaction: transactionSummary,
  previousFullTankFuelEntry: {
    select: { id: true, fueledAt: true, odometer: true, isFullTank: true },
  },
} satisfies Prisma.VehicleFuelEntryInclude;

const serviceInclude = {
  transaction: transactionSummary,
  components: { orderBy: { name: "asc" } },
} satisfies Prisma.VehicleServiceEntryInclude;

/** Localized name of the column a unique-constraint violation was about. */
function uniqueField(e: Prisma.PrismaClientKnownRequestError): string {
  const meta = e.meta as
    | { target?: string | string[]; constraint?: { fields?: string[] } }
    | undefined;
  const target = meta?.target ?? meta?.constraint?.fields;
  const name = Array.isArray(target) ? target[0] : target;
  // MySQL reports the index name (`vehicle_vin_key`), not the column.
  switch (name?.replace(/^vehicle_(householdId_)?|_key$/g, "")) {
    case "vin":
      return m.core_vehicle_field_vin();
    case "registration":
      return m.core_vehicle_field_registration();
    default:
      return m.core_vehicle_field_unknown();
  }
}

function isCode(e: unknown, code: string): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === code;
}

export function vehiclesRepo(
  db: Db,
  settings: ReturnType<typeof settingsRepo>,
) {
  async function requireVehicle(id: number) {
    const vehicle = await db.vehicle.findFirst({
      where: { id, deletedAt: null },
    });
    if (!vehicle) throw new NotFoundError("Vehicle", id);
    return vehicle;
  }

  /**
   * The accounts an entry's transaction moves money between: from the first
   * account available to spend to the default external account.
   */
  async function entryRoute() {
    const [{ defaultOutAccountId }, from] = await Promise.all([
      settings.get(),
      db.source
        .findFirst({
          where: { isOut: false, isDisponible: true },
          orderBy: [{ position: "asc" }, { id: "asc" }],
        })
        .then(
          (source) =>
            source ??
            db.source.findFirst({
              where: { isOut: false },
              orderBy: [{ position: "asc" }, { id: "asc" }],
            }),
        ),
    ]);
    const to =
      (defaultOutAccountId
        ? await db.source.findFirst({
            where: { id: defaultOutAccountId, isOut: true },
          })
        : null) ??
      (await db.source.findFirst({
        where: { isOut: true },
        orderBy: [{ position: "asc" }, { id: "asc" }],
      }));
    if (!from || !to) {
      throw new ConflictError(m.core_vehicle_needs_accounts());
    }
    return { sourceId: from.id, targetId: to.id };
  }

  /**
   * Picks (or validates) the full tank a fill-up at `fueledAt` is measured
   * against. `undefined` means the latest earlier full tank.
   */
  async function resolvePreviousFullTank(
    vehicleId: number,
    fueledAt: Date,
    requested: number | null | undefined,
    selfId?: number,
  ): Promise<number | null> {
    if (requested === null) return null;
    if (requested === undefined) {
      const latest = await db.vehicleFuelEntry.findFirst({
        where: {
          vehicleId,
          isFullTank: true,
          fueledAt: { lt: fueledAt },
          ...(selfId ? { id: { not: selfId } } : {}),
        },
        orderBy: [{ fueledAt: "desc" }, { id: "desc" }],
        select: { id: true },
      });
      return latest?.id ?? null;
    }

    if (requested === selfId) {
      throw new ConflictError(m.core_fuel_follows_itself());
    }
    const previous = await db.vehicleFuelEntry.findUnique({
      where: { id: requested },
    });
    if (!previous || previous.vehicleId !== vehicleId) {
      throw new ConflictError(m.core_fuel_previous_other_vehicle());
    }
    if (!previous.isFullTank) {
      throw new ConflictError(m.core_fuel_previous_not_full());
    }
    if (previous.fueledAt >= fueledAt) {
      throw new ConflictError(m.core_fuel_previous_not_older());
    }
    return previous.id;
  }

  const fuel = {
    /** The vehicle's fill-ups, newest first. */
    async list(vehicleId: number): Promise<FuelEntry[]> {
      await requireVehicle(vehicleId);
      return db.vehicleFuelEntry.findMany({
        where: { vehicleId },
        include: fuelInclude,
        orderBy: [{ fueledAt: "desc" }, { id: "desc" }],
      });
    },

    /**
     * Records a fill-up together with the transaction paying for it (in the
     * vehicle's fuel category, titled by its default fuel title).
     */
    async create(vehicleId: number, input: FuelEntryInput): Promise<FuelEntry> {
      const data = FuelEntryInput.parse(input);
      const vehicle = await requireVehicle(vehicleId);
      const [{ currency }, route, previousId] = await Promise.all([
        settings.get(),
        entryRoute(),
        resolvePreviousFullTank(
          vehicleId,
          data.fueledAt,
          data.previousFullTankFuelEntryId,
        ),
      ]);
      return db.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            transactedAt: data.fueledAt,
            description: vehicle.defaultFuelTransactionTitle.trim() || "Fuel",
            amount: roundMoney(data.fuelAmount * data.unitPrice),
            currency,
            confirmed: data.fueledAt <= new Date(),
            source: { connect: { id: route.sourceId } },
            target: { connect: { id: route.targetId } },
            category: vehicle.fuelCategoryId
              ? { connect: { id: vehicle.fuelCategoryId } }
              : undefined,
          },
        });
        return tx.vehicleFuelEntry.create({
          data: {
            fueledAt: data.fueledAt,
            odometer: data.odometer,
            fuelAmount: data.fuelAmount,
            unitPrice: data.unitPrice,
            isFullTank: data.isFullTank,
            vehicleId,
            transactionId: transaction.id,
            previousFullTankFuelEntryId: previousId,
          },
          include: fuelInclude,
        });
      });
    },

    /** Edits a fill-up and keeps its transaction's date and amount in step. */
    async update(
      vehicleId: number,
      entryId: number,
      input: FuelEntryPatch,
    ): Promise<FuelEntry> {
      const patch = FuelEntryPatch.parse(input);
      const current = await db.vehicleFuelEntry.findFirst({
        where: { id: entryId, vehicleId },
      });
      if (!current) throw new NotFoundError("Fuel entry", entryId);

      const fueledAt = patch.fueledAt ?? current.fueledAt;
      const fuelAmount = patch.fuelAmount ?? current.fuelAmount;
      const unitPrice = patch.unitPrice ?? current.unitPrice;

      // Left alone, the previous full tank stays — unless the fill-up moved
      // to before it, in which case the closest earlier one applies.
      let requested = patch.previousFullTankFuelEntryId;
      if (requested === undefined && current.previousFullTankFuelEntryId) {
        const kept = await db.vehicleFuelEntry.findUnique({
          where: { id: current.previousFullTankFuelEntryId },
        });
        requested = kept && kept.fueledAt < fueledAt ? kept.id : undefined;
      }
      const previousId = await resolvePreviousFullTank(
        vehicleId,
        fueledAt,
        requested,
        entryId,
      );

      return db.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: current.transactionId },
          data: {
            transactedAt: fueledAt,
            amount: roundMoney(fuelAmount * unitPrice),
            confirmed: fueledAt <= new Date(),
          },
        });
        return tx.vehicleFuelEntry.update({
          where: { id: entryId },
          data: {
            fueledAt,
            fuelAmount,
            unitPrice,
            ...(patch.odometer !== undefined
              ? { odometer: patch.odometer }
              : {}),
            ...(patch.isFullTank !== undefined
              ? { isFullTank: patch.isFullTank }
              : {}),
            previousFullTankFuelEntryId: previousId,
          },
          include: fuelInclude,
        });
      });
    },

    /** Deletes a fill-up and its transaction. */
    async remove(vehicleId: number, entryId: number): Promise<void> {
      const current = await db.vehicleFuelEntry.findFirst({
        where: { id: entryId, vehicleId },
      });
      if (!current) throw new NotFoundError("Fuel entry", entryId);
      await db.$transaction(async (tx) => {
        // Later fill-ups measured against this one now follow its predecessor.
        await tx.vehicleFuelEntry.updateMany({
          where: { previousFullTankFuelEntryId: entryId },
          data: {
            previousFullTankFuelEntryId: current.previousFullTankFuelEntryId,
          },
        });
        await tx.vehicleFuelEntry.delete({ where: { id: entryId } });
        await tx.transaction.delete({ where: { id: current.transactionId } });
      });
    },
  };

  async function requireComponents(ids: number[]) {
    if (!ids.length) return;
    const found = await db.vehicleComponent.count({
      where: { id: { in: ids } },
    });
    if (found !== new Set(ids).size) {
      throw new NotFoundError("Component", ids.join(", "));
    }
  }

  const service = {
    /** The vehicle's service entries, newest first. */
    async list(vehicleId: number): Promise<ServiceEntry[]> {
      await requireVehicle(vehicleId);
      return db.vehicleServiceEntry.findMany({
        where: { vehicleId },
        include: serviceInclude,
        orderBy: [{ servicedAt: "desc" }, { id: "desc" }],
      });
    },

    /**
     * Records a service together with the transaction paying for it (in the
     * vehicle's maintenance category).
     */
    async create(
      vehicleId: number,
      input: ServiceEntryInput,
    ): Promise<ServiceEntry> {
      const { componentIds, price, ...data } = ServiceEntryInput.parse(input);
      const vehicle = await requireVehicle(vehicleId);
      await requireComponents(componentIds);
      const [{ currency }, route] = await Promise.all([
        settings.get(),
        entryRoute(),
      ]);
      return db.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            transactedAt: data.servicedAt,
            description: `Service: ${data.title}`,
            amount: roundMoney(price ?? 0),
            currency,
            confirmed: data.servicedAt <= new Date(),
            source: { connect: { id: route.sourceId } },
            target: { connect: { id: route.targetId } },
            category: vehicle.categoryId
              ? { connect: { id: vehicle.categoryId } }
              : undefined,
          },
        });
        return tx.vehicleServiceEntry.create({
          data: {
            ...data,
            vehicleId,
            transactionId: transaction.id,
            components: { connect: componentIds.map((id) => ({ id })) },
          },
          include: serviceInclude,
        });
      });
    },

    /** Edits a service and keeps its transaction's date, title and cost in step. */
    async update(
      vehicleId: number,
      entryId: number,
      input: ServiceEntryPatch,
    ): Promise<ServiceEntry> {
      const { componentIds, price, ...patch } = ServiceEntryPatch.parse(input);
      const current = await db.vehicleServiceEntry.findFirst({
        where: { id: entryId, vehicleId },
      });
      if (!current) throw new NotFoundError("Service entry", entryId);
      if (componentIds) await requireComponents(componentIds);

      return db.$transaction(async (tx) => {
        const servicedAt = patch.servicedAt ?? current.servicedAt;
        await tx.transaction.update({
          where: { id: current.transactionId },
          data: {
            transactedAt: servicedAt,
            confirmed: servicedAt <= new Date(),
            ...(patch.title ? { description: `Service: ${patch.title}` } : {}),
            ...(price !== undefined ? { amount: roundMoney(price ?? 0) } : {}),
          },
        });
        return tx.vehicleServiceEntry.update({
          where: { id: entryId },
          data: {
            ...patch,
            ...(componentIds
              ? { components: { set: componentIds.map((id) => ({ id })) } }
              : {}),
          },
          include: serviceInclude,
        });
      });
    },

    /** Deletes a service and its transaction. */
    async remove(vehicleId: number, entryId: number): Promise<void> {
      const current = await db.vehicleServiceEntry.findFirst({
        where: { id: entryId, vehicleId },
      });
      if (!current) throw new NotFoundError("Service entry", entryId);
      await db.$transaction(async (tx) => {
        // No foreign keys here: unlink the components explicitly.
        await tx.vehicleServiceEntry.update({
          where: { id: entryId },
          data: { components: { set: [] } },
        });
        await tx.vehicleServiceEntry.delete({ where: { id: entryId } });
        await tx.transaction.delete({ where: { id: current.transactionId } });
      });
    },
  };

  /** Parts a service touched (brakes, oil, …), shared by all vehicles. */
  const components = {
    list(): Promise<VehicleComponent[]> {
      return db.vehicleComponent.findMany({ orderBy: { name: "asc" } });
    },

    async create(input: VehicleComponentInput): Promise<VehicleComponent> {
      const data = VehicleComponentInput.parse(input);
      try {
        return await db.vehicleComponent.create({ data });
      } catch (e) {
        if (isCode(e, "P2002")) {
          throw new ConflictError(m.core_component_exists({ name: data.name }));
        }
        throw e;
      }
    },

    async update(
      id: number,
      input: VehicleComponentPatch,
    ): Promise<VehicleComponent> {
      const data = VehicleComponentPatch.parse(input);
      try {
        return await db.vehicleComponent.update({ where: { id }, data });
      } catch (e) {
        if (isCode(e, "P2025")) throw new NotFoundError("Component", id);
        if (isCode(e, "P2002")) {
          throw new ConflictError(
            m.core_component_exists({ name: data.name ?? "?" }),
          );
        }
        throw e;
      }
    },

    async remove(id: number): Promise<void> {
      try {
        await db.vehicleComponent.delete({ where: { id } });
      } catch (e) {
        if (isCode(e, "P2025")) throw new NotFoundError("Component", id);
        throw e;
      }
    },
  };

  return {
    /** Most recently changed first. */
    list(): Promise<Vehicle[]> {
      return db.vehicle.findMany({
        where: { deletedAt: null },
        orderBy: { updatedAt: "desc" },
      });
    },

    async get(id: number): Promise<VehicleDetail> {
      const vehicle = await db.vehicle.findFirst({
        where: { id, deletedAt: null },
        include: {
          category: true,
          fuelCategory: true,
          fuelEntries: {
            include: fuelInclude,
            orderBy: [{ fueledAt: "desc" }, { id: "desc" }],
          },
          serviceEntries: {
            include: serviceInclude,
            orderBy: [{ servicedAt: "desc" }, { id: "desc" }],
          },
        },
      });
      if (!vehicle) throw new NotFoundError("Vehicle", id);
      return vehicle;
    },

    async create(input: VehicleInput): Promise<Vehicle> {
      const data = VehicleInput.parse(input);
      await requireCategories(db, data.categoryId, data.fuelCategoryId);
      try {
        return await db.vehicle.create({ data });
      } catch (e) {
        if (isCode(e, "P2002")) {
          throw new ConflictError(
            m.core_vehicle_unique_exists({
              field: uniqueField(e as Prisma.PrismaClientKnownRequestError),
            }),
          );
        }
        throw e;
      }
    },

    async update(id: number, input: VehiclePatch): Promise<Vehicle> {
      const data = VehiclePatch.parse(input);
      await requireCategories(db, data.categoryId, data.fuelCategoryId);
      try {
        await requireVehicle(id);
        return await db.vehicle.update({ where: { id }, data });
      } catch (e) {
        if (isCode(e, "P2002")) {
          throw new ConflictError(
            m.core_vehicle_unique_exists({
              field: uniqueField(e as Prisma.PrismaClientKnownRequestError),
            }),
          );
        }
        throw e;
      }
    },

    /**
     * Soft-deletes the vehicle: it is marked as deleted and disappears from
     * the app, but it, its entries and their transactions stay in the
     * database so an admin can restore it.
     */
    async remove(id: number): Promise<void> {
      await requireVehicle(id);
      await db.vehicle.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    },

    fuel,
    service,
    components,
  };
}
