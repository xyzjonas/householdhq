<template>
  <div>
    <ui-button
      v-if="loggedUser"
      squared
      icon="i-ic-baseline-logout"
      color="primary"
      @click="session.logout"
    />
    <ui-button
      v-else-if="!loggedUser && router.currentRoute.value.path !== '/login'"
      icon="i-ic-round-person"
      rounded
      color="primary"
      @click="navigateTo('/login')"
    />
  </div>
</template>
<script setup lang="ts">
const session = useTokenStore();
const { loggedUser } = storeToRefs(session);

const router = useRouter();
</script>
