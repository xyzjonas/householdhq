// import jwt from 'jsonwebtoken';

const EXPIRES_SECONDS = parseInt(process.env.EXPIRES_SECONDS ?? "30");
const isDisabled = process.env.DISABLE_AUTH === "true";

export default defineEventHandler(async (event) => {
  if (isDisabled) {
    console.info(`Auth disabled: disabled=${process.env.DISABLE_AUTH}`)
  } else if (String(event.node.req.url) === "/api/login") {
    console.info('No authorization for /api/login')
  } else if (String(event.node.req.url) === "/login") {
    console.info('No authorization for /login')
  } else {
    // try cookie first (for page loads)
    let token = getCookie(event, 'token');
    if (!token) {
      // ...and if not there, go for auth header (API calls)
      const authHdr = event.node.req.headers.authorization;
      const parts = authHdr?.split(" ")
      if (!parts || parts.length !== 2 || parts[0] !== "Bearer") {
        console.error("reason: invalid authorization header (missing/format)");
        return sendRedirect(event, "/login", 303)
      }
      token = parts[1];
    }

    try {
      const session = decodeSession(token);
      
      // if token.exp < x => generate a new one...
      const timeDelta = session.exp - (Date.now() / 1000);
      if (timeDelta < EXPIRES_SECONDS / 4) {
        console.info(`Less than ${EXPIRES_SECONDS / 4} remaining (${timeDelta}sec), offering a new token...`)
        setHeader(event, 'X-TOKEN-RENEWAL', encodeSession(session))
      }

    } catch (e) {
      console.error("invalid token")
      console.error(e);
      return sendRedirect(event, "/login", 303)
    }
  }
 
})
