<template lang="">
    <div class="container">
        <component :is="AccessDenied" @login="auth0.loginWithRedirect" />
    </div>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';

const AccessDenied = resolveComponent('AccessDenied')
const auth0 = useAuth0()

</script>