// import jwt from 'jsonwebtoken';

import { LazyFormEditableTag } from ".nuxt/components";

const EXPIRES_SECONDS = parseInt(process.env.EXPIRES_SECONDS ?? "3600");
const isDisabled = process.env.DISABLE_AUTH === "true";

const redirectOr401 = (event) => {
  try {
    console.info(`redirecting from: ${event.node.req.url}`)
    if (String(event.node.req.url).startsWith("/api")) {
      setResponseStatus(event, 401, 'invalid token');
      return;
    }
  } catch(e) {
    console.error(e)
  }

  sendRedirect(event, "/login", 302);
  return;
}

export default defineEventHandler(async (event) => {
  if (isDisabled) {
    console.info(`Auth disabled: disabled=${process.env.DISABLE_AUTH}`);
  } else if (String(event.node.req.url) === "/api/login") {
    console.info('No authorization for /api/login');
  } else if (String(event.node.req.url) === "/login") {
    console.info('No authorization for /login');
  } else {
    // try cookie first (for page loads)
    let token = getCookie(event, 'token');
    if (!token) {
      console.info('no cookie \'token\' was found')
      // ...and if not there, go for auth header (API calls)
      const authHdr = event.node.req.headers.authorization;
      const parts = authHdr?.split(" ");
      if (!parts || parts.length !== 2 || parts[0] !== "Bearer") {
        console.error("reason: invalid authorization header (missing/format)");
        return redirectOr401(event);
      } else {
        token = parts[1];
      }
    }

    try {
      const session = decodeSession(token);
      
      // if token.exp < x => generate a new one...
      const timeDelta = session.exp - (Date.now() / 1000);
      if (timeDelta < EXPIRES_SECONDS/4) {
        console.info(`Less than ${EXPIRES_SECONDS / 4}sec remaining (${timeDelta}sec), offering a new token...`)
        setHeader(event, 'X-TOKEN-RENEWAL', renewSession(session))
      }

    } catch (e) {
      console.error("!!! invalid token")
      console.error(e);
      // event.node.res.writeHead(302, { Location: "/login" });
      // event.node.res.end();
      redirectOr401(event);
      // setResponseStatus(event, 401, 'invalid token')
      // return
      // return sendRedirect(event, "/login", 307)
    }
  }
 
})
