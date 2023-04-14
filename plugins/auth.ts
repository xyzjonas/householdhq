import { createAuth0 } from '@auth0/auth0-vue'

export default defineNuxtPlugin((nuxtApp) => {
  const auth0 = createAuth0({
    // domain: env.process.AUTH0_DOMAIN,
    // client_id: env.process.AUTH0_CLIENT_ID,
    domain: 'dev-511shcuyr384s201.us.auth0.com',
    clientId: '0YBNFT96gUrKRQe1kUyFvJ0qDHnmY7rH',
    authorizationParams: {
      redirect_uri: 'https://householdhq-git-auth0-jonasbrauer.vercel.app/',
      audience: "https://householdhq-git-auth0-jonasbrauer.vercel.app/api",
    }
  })

  if (process.client) {
    nuxtApp.vueApp.use(auth0)
  }

  // addRouteMiddleware('auth', () => {
  //   if (process.client) {
  //     auth0.checkSession()
  //     if (!auth0.isAuthenticated.value) {
  //       auth0.loginWithRedirect({
  //         // appState: {
  //         //   target: useRoute().path,
  //         // },
  //       })
  //     }
  //   }
  // })
})
