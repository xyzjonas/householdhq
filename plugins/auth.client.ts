import { createAuth0 } from '@auth0/auth0-vue'

export default defineNuxtPlugin(async (nuxtApp) => {
  const auth0 = createAuth0({
    domain: useRuntimeConfig().public.auth0_domain,
    clientId: useRuntimeConfig().public.auth0_clientId,
    authorizationParams: {
      redirect_uri: useRuntimeConfig().public.auth0_redirectUri,
      audience: useRuntimeConfig().public.auth0_audience,
    }
  })
  nuxtApp.vueApp.use(auth0)
  
  console.info("Checking session...")
  const aaa = await auth0.checkSession();
  console.info("Done")
})
