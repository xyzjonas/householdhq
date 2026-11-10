import type { Component } from "svelte";
import { m } from "#paraglide/messages.js";
import Droplet from "@lucide/svelte/icons/droplet";
import Droplets from "@lucide/svelte/icons/droplets";
import Flame from "@lucide/svelte/icons/flame";
import Fuel from "@lucide/svelte/icons/fuel";
import Gauge from "@lucide/svelte/icons/gauge";
import GlassWater from "@lucide/svelte/icons/glass-water";
import Lightbulb from "@lucide/svelte/icons/lightbulb";
import Plug from "@lucide/svelte/icons/plug";
import Refrigerator from "@lucide/svelte/icons/refrigerator";
import Sun from "@lucide/svelte/icons/sun";
import Thermometer from "@lucide/svelte/icons/thermometer";
import Waves from "@lucide/svelte/icons/waves";
import Wind from "@lucide/svelte/icons/wind";
import Zap from "@lucide/svelte/icons/zap";

export interface MeterIcon {
  name: string;
  label: string;
  component: Component;
}

export const meterIcons = (): MeterIcon[] => [
  { name: "gauge", label: m.energy_icon_meter(), component: Gauge },
  { name: "zap", label: m.energy_icon_electricity(), component: Zap },
  { name: "plug", label: m.energy_icon_socket(), component: Plug },
  { name: "lightbulb", label: m.energy_icon_lighting(), component: Lightbulb },
  { name: "sun", label: m.energy_icon_solar(), component: Sun },
  { name: "flame", label: m.energy_icon_gas(), component: Flame },
  {
    name: "thermometer",
    label: m.energy_icon_heating(),
    component: Thermometer,
  },
  { name: "droplet", label: m.energy_icon_water(), component: Droplet },
  { name: "droplets", label: m.energy_icon_hot_water(), component: Droplets },
  { name: "waves", label: m.energy_icon_sewage(), component: Waves },
  {
    name: "glass-water",
    label: m.energy_icon_drinking_water(),
    component: GlassWater,
  },
  {
    name: "refrigerator",
    label: m.energy_icon_appliance(),
    component: Refrigerator,
  },
  { name: "wind", label: m.energy_icon_air(), component: Wind },
  { name: "fuel", label: m.energy_icon_fuel(), component: Fuel },
];

/** Icon names stored by the legacy app (Iconify classes) -> current names. */
const legacy: Record<string, string> = {
  "i-ic-baseline-electric-meter": "gauge",
  "i-ic-baseline-electric-bolt": "zap",
  "i-ic-baseline-bolt": "zap",
  "i-ic-baseline-flash-on": "zap",
  "i-ic-baseline-gas-meter": "gauge",
  "i-ic-baseline-local-fire-department": "flame",
  "i-ic-baseline-water-drop": "droplet",
  "i-ic-baseline-opacity": "droplets",
  "i-ic-baseline-water": "waves",
  "i-ic-baseline-local-drink": "glass-water",
  "i-ic-baseline-kitchen": "refrigerator",
  "i-ic-baseline-bubble-chart": "droplets",
};

/** The catalog name for a stored icon, translating legacy names. */
export function normalizeMeterIcon(name: string | null): string | null {
  if (!name) return null;
  return legacy[name] ?? name;
}

/** Meter icons are free text in the DB; unknown names fall back to a gauge. */
export function meterIcon(name: string | null): Component {
  const key = normalizeMeterIcon(name);
  return meterIcons().find((i) => i.name === key)?.component ?? Gauge;
}

export const meterFallbackColor = "#38c089";
