import { describe, expect, it } from "vitest";
import {
  MODULE_KEYS,
  parseEnabledModules,
  serializeEnabledModules,
} from "#lib/modules.ts";

describe("parseEnabledModules", () => {
  it("enables everything until a household chooses", () => {
    expect(parseEnabledModules(null)).toEqual(MODULE_KEYS);
  });

  it("reads an explicit list, including an empty one", () => {
    expect(parseEnabledModules("vehicles,energy")).toEqual([
      "vehicles",
      "energy",
    ]);
    expect(parseEnabledModules("")).toEqual([]);
  });

  it("drops unknown names", () => {
    expect(parseEnabledModules("energy,bogus")).toEqual(["energy"]);
  });
});

describe("serializeEnabledModules", () => {
  it("round-trips in a stable order and ignores unknown names", () => {
    const stored = serializeEnabledModules(["energy", "bogus", "accounting"]);
    expect(stored).toBe("accounting,energy");
    expect(parseEnabledModules(stored)).toEqual(["accounting", "energy"]);
  });
});
