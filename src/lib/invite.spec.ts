import { describe, expect, it } from "vitest";
import { decodeInvite, encodeInvite } from "#lib/invite.ts";

describe("invite tokens", () => {
  it("round-trips the credentials", () => {
    const credentials = { email: "anna@example.com", password: "aB3-_xYz" };
    expect(decodeInvite(encodeInvite(credentials))).toEqual(credentials);
  });

  it("round-trips non-ASCII text and stays URL-safe", () => {
    const credentials = { email: "jürgen@example.com", password: "pä?ss>>~~" };
    const token = encodeInvite(credentials);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeInvite(token)).toEqual(credentials);
  });

  it("does not show the password in plain text", () => {
    const token = encodeInvite({ email: "a@b.co", password: "hunter2hunter2" });
    expect(token).not.toContain("hunter2");
  });

  it("accepts the leading # of a location hash", () => {
    const token = encodeInvite({ email: "a@b.co", password: "secret123" });
    expect(decodeInvite(`#${token}`)).not.toBeNull();
  });

  it.each(["", "!!!", "e30", btoa(JSON.stringify({ e: "a@b.co" }))])(
    "rejects malformed token %j",
    (token) => {
      expect(decodeInvite(token)).toBeNull();
    },
  );
});
