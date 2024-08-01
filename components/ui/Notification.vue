<template>
  <div :class="`notification ${level}`">
    <div class="notification-row">
      <i v-if="icon" :class="icon"></i>
      <div>
        <h2 v-if="notification.title">{{ notification.title }}</h2>
        <p>{{ notification.text }}</p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Notification } from '@/composables/useNotifications';
const props = defineProps<{
  notification: Notification
}>()

const level = computed(() => props.notification.level ?? 'info')

const icon = computed(() => {
  if (props.notification.icon) {
    return props.notification.icon
  }

  switch (level.value) {
    case 'error':
      return 'i-ic-round-error-outline'
    case 'success':
      return 'i-ic-baseline-check'
    case 'warning':
      return 'i-ic-round-warning-amber'
  }
  
  return undefined
})

</script>
<style lang="css" scoped>
.notification {
  padding: .8rem;
}

.notification-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .5rem;
}


.info {
  color: var(--bg-200);
  background-color: var(--text-200);
}

.success {
  color: var(--text-over-primary);
  background-color: var(--success-100);
}

.error {
  background-color: var(--error-100);
  color: var(--text-over-danger);
}

.warning {
  background-color: #FDB750;
  color: var(--bg-200);
}

i {
  font-size: 1.2rem;
}
</style>