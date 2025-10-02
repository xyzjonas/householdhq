const EXPIRES_SECONDS = parseInt(process.env.EXPIRES_SECONDS ?? "3600");
const isDisabled = process.env.DISABLE_AUTH === "true";

const redirectOr401 = async (event: any) => {
  if (String(event.node.req.url).startsWith("/api")) {
    setResponseStatus(event, 401, "invalid token");
  } else {
    console.info(`redirecting to login page from: ${event.node.req.url}`);
    await sendRedirect(event, "/login", 302);
  }
};

export default defineEventHandler(async (event) => {
  if (isDisabled) {
    console.info(`Auth disabled: disabled=${process.env.DISABLE_AUTH}`);
  } else if (String(event.node.req.url) === "/api/login") {
  } else if (String(event.node.req.url) === "/login") {
  } else {
    // try cookie first (for page loads)
    let token = getCookie(event, "token");
    if (!token) {
      console.info("no cookie 'token' was found");
      // ...and if not there, go for auth header (API calls)
      const authHdr = event.node.req.headers.authorization;
      const parts = authHdr?.split(" ");
      if (!parts || parts.length !== 2 || parts[0] !== "Bearer") {
        console.error("reason: invalid authorization header (missing/format)");
        await redirectOr401(event);
        return 
      } else {
        token = parts[1] as string;
      }
    }

    try {
      const session = decodeSession(token);

      // if token.exp < x => generate a new one...
      const timeDelta = session.exp - Date.now() / 1000;
      if (timeDelta < EXPIRES_SECONDS / 4) {
        console.info(`Less than ${EXPIRES_SECONDS / 4}sec remaining (${timeDelta}sec), offering a new token...`);
        setHeader(event, "X-TOKEN-RENEWAL", renewSession(session));
      }
    } catch (e) {
      console.error("!!! invalid token");
      console.error(e);
      await redirectOr401(event);
    }
  }
});
