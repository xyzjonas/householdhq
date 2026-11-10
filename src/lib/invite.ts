/**
 * Invite links carry the new user's email and one-time password in the URL
 * *fragment* (`/invite#<token>`), so neither reaches server logs or Referer
 * headers. The token is base64url-encoded JSON: obfuscation, not encryption.
 */
export interface InviteCredentials {
  email: string;
  password: string;
}

const toBase64Url = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
};

const fromBase64Url = (token: string) => {
  const binary = atob(token.replaceAll("-", "+").replaceAll("_", "/"));
  return new TextDecoder().decode(
    Uint8Array.from(binary, (c) => c.charCodeAt(0)),
  );
};

export function encodeInvite({ email, password }: InviteCredentials): string {
  return toBase64Url(JSON.stringify({ e: email, p: password }));
}

/** Returns null for anything that is not a well-formed invite token. */
export function decodeInvite(token: string): InviteCredentials | null {
  try {
    const { e, p } = JSON.parse(fromBase64Url(token.replace(/^#/, "")));
    if (typeof e !== "string" || typeof p !== "string" || !e || !p) return null;
    return { email: e, password: p };
  } catch {
    return null;
  }
}
