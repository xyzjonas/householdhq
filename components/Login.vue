<template lang="">
    <button>
        LOG IN
        {{domain}}
        {{clientId}}
    </button>
</template>
<script>
// import { AuthenticationClient } from 'auth0';

// const auth0 = new AuthenticationClient({
//     domain: process.env.AUTH0_DOMAIN,
//     clientId: process.env.AUTH0_CLIENT_ID,
// });

export default {
    data() {
        return {
            domain: process.env.AUTH0_DOMAIN,
            clientId: process.env.AUTH0_CLIENT_ID,
        }
    }
}
</script>
<style lang="">
    
</style>