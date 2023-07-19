import jwt from 'jsonwebtoken';

const pubKey = process.env.AUTH0_PUBKEY


export default defineEventHandler(async (event) => {
  const token = event.node.req.headers.authorization;
  if (!String(event.node.req.url).startsWith("/api")) {
    console.debug(`${String(event.node.req.url)}: this is an unprotected endpoint!`)
  } else if (token) {
    try {
      let authorization = token.split(' ');
      if (authorization[0] !== 'Bearer') {
        throw createError({ statusCode: 401, statusMessage: 'Invalid auth type.' })
      } else if (!authorization[1]) {
        throw createError({ statusCode: 401, statusMessage: 'Empty token' })
      } else {
        console.info(authorization);
        console.info(`secret: ${pubKey}`)
        const decoded = await jwt.verify(authorization[1], pubKey, {
          algorithms: ['RS256'],
        })
        console.info("!!!!!!!")
        console.info(decoded)
      }
    } catch (err) {
      console.error(err);
      throw createError({ statusCode: 403, statusMessage: String(err) });
    }
  } else {
    throw createError({ statusCode: 401, statusMessage: 'Authorization is missing.' })
  } 
})
