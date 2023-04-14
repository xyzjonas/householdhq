// import { ManagementClient } from 'auth0';

// const auth0 = new ManagementClient({
//   domain: process.env.AUTH0_DOMAIN,
//   clientId: process.env.AUTH0_CLIENT_ID,
//   clientSecret: process.env.AUTH0_CLIENT_SECRET,
//   scope: 'read:users',
// });

export default defineEventHandler((event) => {
  // console.info('New request: ' + event.node.req.url)
  if (String(event.node.req.url).startsWith("/api")) {
    console.info('THIS is an API call...')
    // try {
    //   const accessToken = event.context.auth
    //   throw new Error();
    //   console.info('THIS is an API call...')
    // } catch (error) {
    //   console.error(error)
    //   event.node.res.writeHead(307, { Location: '/login' });
    // }

  }
})

// import auth0 from './auth0';

// export default defineEventHandler(async (event) => {
//   console.log('New request: ' + event.node.req.url)
//   if (event.node.req.url === '/login') {
//     console.info('/login registered')
//   } else {
//     console.info('/login NOT registered') 
//     console.info(event.node.req.url);
//   }
  // console.info(event);
  // try {
  //   const accessToken = event.context.auth
  //   // const accessToken = from.query.headers.authorization.split(' ')[1];
    
  //   return navigateTo('/login')
  // } catch (error) {
  //   console.error(error);
  //   event.node.res.writeHead(301, { Location: '/login' });
  //   event.node.res.end();
  // }
// })

// export default async function authMiddleware({ req, redirect }) {
//   try {
//     // Get the access token from the request headers
//     const accessToken = req.headers.authorization.split(' ')[1];

//     // Verify the access token and get user information
//     const user = await auth0.getUser({ id: accessToken });
//     if (!user) {
//         return redirect('/login')
//     }
//     req.session.user = user;

//   } catch (error) {
//     console.error(error);
//     return redirect('/login')
//   }
// }
