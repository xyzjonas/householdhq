// import { TAlgorithm, decode, encode } from "jwt-simple";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY as string;

const EXPIRES_SECONDS = parseInt(process.env.EXPIRES_SECONDS ?? "30");

export interface User {
  id: number;
  email: string;
  password: string;
}

export interface Session {
  id: number;
  username: string;
  /**
   * Timestamp indicating when the session was created, in Unix milliseconds.
   */
  iat: number;
  /**
   * Timestamp indicating when the session should expire, in Unix milliseconds.
   */
  exp: number;
}

/**
 * Identical to the Session type, but without the `issued` and `expires` properties.
 */
export type PartialSession = Omit<Session, "iat" | "exp">;

export type ExpirationStatus = "expired" | "active" | "grace";

export const encodeSession = (partialSession: PartialSession): string => {
  // const algorithm: TAlgorithm = "HS512";
  // const issued = Date.now();
  // const expires = Math.floor(Date.now() / 1000) + (60 * 60);
  // const session: Session = {
  //     ...partialSession,
  //     exp: expires,
  // }
  return jwt.sign(partialSession, SECRET_KEY, { expiresIn: EXPIRES_SECONDS });
};

export const renewSession = (session: Session): string => {
  // const algorithm: TAlgorithm = "HS512";
  // const issued = Date.now();
  // const expires = Math.floor(Date.now() / 1000) + (60 * 60);
  // const session: Session = {
  //     ...partialSession,
  //     exp: expires,
  // }
  const newSession: any = { ...session };
  delete newSession.exp;
  delete newSession.iat;
  console.info(newSession);
  return jwt.sign(newSession, SECRET_KEY, { expiresIn: EXPIRES_SECONDS });
};

export const decodeSession = (tokenString: string): Session => {
  // Always use HS512 to decode the token
  // const algorithm: TAlgorithm = "HS512";
  return jwt.verify(tokenString, SECRET_KEY) as Session;
};

// export function checkExpirationStatus(token: Session): ExpirationStatus {
//     const now = Date.now();

//     if (token.expires > now) return "active";

//     // Find the timestamp for the end of the token's grace period
//     const threeHoursInMs = 3 * 60 * 60 * 1000;
//     const threeHoursAfterExpiration = token.expires + threeHoursInMs;

//     if (threeHoursAfterExpiration > now) return "grace";

//     return "expired";
// }

// todo: users in database
const passwordDatabase: { [username: string]: string | undefined } = {};
passwordDatabase["admin"] = process.env.MASTER_PASSWORD;

export const validatePassword = (username: string, password: string): boolean => {
  if (passwordDatabase[username] && passwordDatabase[username] === password) {
    return true;
  }
  return false;
};
