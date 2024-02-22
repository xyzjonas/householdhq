<template>
  <div class="indicator">
    <span id="spent"></span>
    <span id="forecast"></span>
    <span id="available"></span>
  </div>
</template>
<script lang="ts" setup>
const props = defineProps<{
  spent: number;
  forecast: number;
  totalIncome: number;
}>();

const spentR = computed(() => props.spent / (props.totalIncome + 0.1))
const forecastR = computed(() => props.forecast / (props.totalIncome + 0.1))
const availableR = computed(() => (props.totalIncome - props.spent) / (props.totalIncome + 0.1))

</script>
<style lang="scss" scoped>
.indicator {
  width: 100%;
  display: flex;
  flex-direction: row;
  height: 1rem;
  background-color: var(--bg-200);
  border-radius: 3px;

  span {
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
  }

  span:nth-child(2) {
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
  }
}

#spent {
  flex: v-bind("spentR");
  background-color: var(--primary-100);
}

#forecast {
  flex: v-bind("forecastR");
  background-color: var(--accent-100);
}

#available {
  flex: v-bind("availableR");
}
</style>
