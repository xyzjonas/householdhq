import { m } from "#paraglide/messages.js";
import type { Component } from "svelte";
import Ambulance from "@lucide/svelte/icons/ambulance";
import Bike from "@lucide/svelte/icons/bike";
import Bus from "@lucide/svelte/icons/bus";
import Caravan from "@lucide/svelte/icons/caravan";
import Car from "@lucide/svelte/icons/car";
import CarFront from "@lucide/svelte/icons/car-front";
import Forklift from "@lucide/svelte/icons/forklift";
import Motorbike from "@lucide/svelte/icons/motorbike";
import Scooter from "@lucide/svelte/icons/scooter";
import Tractor from "@lucide/svelte/icons/tractor";
import Truck from "@lucide/svelte/icons/truck";

export interface VehicleIconOption {
  /** What is stored in `Vehicle.icon`. */
  key: string;
  label: () => string;
  icon: Component;
}

export const vehicleIconOptions: VehicleIconOption[] = [
  { key: "car", label: () => m.vehicles_icon_car(), icon: Car },
  {
    key: "car-front",
    label: () => m.vehicles_icon_car_front(),
    icon: CarFront,
  },
  {
    key: "motorbike",
    label: () => m.vehicles_icon_motorbike(),
    icon: Motorbike,
  },
  { key: "scooter", label: () => m.vehicles_icon_scooter(), icon: Scooter },
  { key: "bike", label: () => m.vehicles_icon_bicycle(), icon: Bike },
  { key: "bus", label: () => m.vehicles_icon_van_or_bus(), icon: Bus },
  { key: "truck", label: () => m.vehicles_icon_truck(), icon: Truck },
  { key: "caravan", label: () => m.vehicles_icon_caravan(), icon: Caravan },
  { key: "tractor", label: () => m.vehicles_icon_tractor(), icon: Tractor },
  { key: "forklift", label: () => m.vehicles_icon_machinery(), icon: Forklift },
  {
    key: "ambulance",
    label: () => m.vehicles_icon_emergency(),
    icon: Ambulance,
  },
];

/** Icons the previous version stored, as icon-font class names. */
const legacyIcons: Record<string, Component> = {
  "i-ic-baseline-two-wheeler": Motorbike,
  "i-ic-baseline-directions-bike": Bike,
  "i-ic-baseline-airport-shuttle": Bus,
  "i-ic-baseline-commute": Bus,
  "i-ic-baseline-local-shipping": Truck,
  "i-ic-baseline-delivery-dining": Scooter,
  "i-ic-baseline-agriculture": Tractor,
  "i-ic-baseline-construction": Forklift,
  "i-ic-baseline-electric-car": CarFront,
  "i-ic-baseline-local-taxi": Car,
};

/**
 * The icon for a stored key. Brand logos from the previous version (and
 * anything unknown) have no counterpart here and show a car.
 */
export function vehicleIcon(key: string | null | undefined): Component {
  if (!key) return Car;
  return (
    vehicleIconOptions.find((o) => o.key === key)?.icon ??
    legacyIcons[key] ??
    CarFront
  );
}

export const fallbackVehicleColor = "#4f46e5";
