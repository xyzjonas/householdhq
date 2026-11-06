import { describe, expect, it } from "vitest";
import { readableTextOn } from "./color";
import {
  fromLocalDateTimeInput,
  toDateInput,
  toLocalDateTimeInput,
} from "./datetime";
import { vehicleIcon, vehicleIconOptions } from "./vehicle-icons";

describe("readableTextOn", () => {
  it("uses dark text on light backgrounds and light text on dark ones", () => {
    expect(readableTextOn("#ffffff")).toBe("#000000");
    expect(readableTextOn("#facc15")).toBe("#000000");
    expect(readableTextOn("#1e3a8a")).toBe("#ffffff");
  });

  it("falls back to light text for values that are not hex colours", () => {
    expect(readableTextOn("var(--x)")).toBe("#ffffff");
    expect(readableTextOn("#fff")).toBe("#ffffff");
  });
});

describe("date inputs", () => {
  it("formats a date input in UTC", () => {
    expect(toDateInput(new Date("2026-05-01T00:00:00Z"))).toBe("2026-05-01");
    expect(toDateInput(null)).toBe("");
    expect(toDateInput("nonsense")).toBe("");
  });

  it("round-trips a local datetime", () => {
    const local = toLocalDateTimeInput(new Date(2026, 10, 6, 14, 5));
    expect(local).toBe("2026-11-06T14:05");
    expect(new Date(fromLocalDateTimeInput(local)).getTime()).toBe(
      new Date(2026, 10, 6, 14, 5).getTime(),
    );
  });

  it("returns an empty string for garbage", () => {
    expect(fromLocalDateTimeInput("")).toBe("");
    expect(toLocalDateTimeInput(undefined)).toBe("");
  });
});

describe("vehicleIcon", () => {
  it("finds the icons the picker offers", () => {
    for (const o of vehicleIconOptions) expect(vehicleIcon(o.key)).toBe(o.icon);
  });

  it("maps icons stored by the previous version", () => {
    expect(vehicleIcon("i-ic-baseline-local-shipping")).toBe(
      vehicleIcon("truck"),
    );
  });

  it("shows a car for brand logos and missing icons", () => {
    expect(vehicleIcon(null)).toBe(vehicleIcon("car"));
    expect(vehicleIcon("i-simple-icons-bmw")).toBeDefined();
  });
});
