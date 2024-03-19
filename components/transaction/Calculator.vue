<template>
  <div class="calculator">
    <div class="calculator-display">
      <h1 :class="operand ? 'active' : ''">{{ modelValue }}</h1>
      <h2 v-if="operand">{{ operand }} {{ anotherNumber }}</h2>
    </div>
    <div class="calculator-numpad">
      <ui-button v-for="index in 9" @click="add(index)">{{ index }}</ui-button>
      <ui-button @click="newOperand('-')" icon="i-ic-baseline-minus" />
      <ui-button @click="add(0)">0</ui-button>
      <ui-button @click="newOperand('+')" icon="i-ic-baseline-plus" />
      <ui-button @click="remove" icon="i-ic-outline-backspace" />
      <ui-button @click="clear" icon="i-ic-baseline-delete" />
      <ui-button v-if="operand" @click="addOrSubstract" icon="i-ic-baseline-equals" />
      <ui-button v-else @click="$emit('confirm')">OK</ui-button>
    </div>
    <div class="numpad"></div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  modelValue: number;
}>();
const emit = defineEmits(["update:modelValue", "confirm"]);

const anotherNumber = ref<number>(0);
const operand = ref<string | undefined>(undefined);

// const modelValue = ref<string>("0");
// const result = ref(0);

const addNumber = (x: number, y: number): number => {
  return parseInt(`${x}${y}`);
};

const add = (amount: number) => {
  if (operand.value) {
    anotherNumber.value = addNumber(anotherNumber.value, amount);
    return;
  }
  if (props.modelValue === 0) {
    emit("update:modelValue", amount);
  } else {
    emit("update:modelValue", addNumber(props.modelValue, amount));
  }
};

const clear = () => {
  if (operand.value) {
    anotherNumber.value = 0;
  } else {
    emit("update:modelValue", 0);
  }
};

const remove = () => {
  if (operand.value) {
    if (anotherNumber.value >= 10) {
      anotherNumber.value = parseInt(`${anotherNumber.value}`.substring(0, `${anotherNumber.value}`.length - 1));
    } else {
      anotherNumber.value = 0;
    }
  } else {
    if (props.modelValue >= 10) {
      const asString = `${props.modelValue}`;
      emit("update:modelValue", parseInt(asString.substr(0, asString.length - 1)));
    } else {
      emit("update:modelValue", 0);
    }
  }
};

const addOrSubstract = () => {
  if (operand.value === "+") {
    emit("update:modelValue", props.modelValue + anotherNumber.value);
  }
  if (operand.value === "-") {
    emit("update:modelValue", props.modelValue - anotherNumber.value);
  }

  operand.value = undefined;
  anotherNumber.value = 0;
};

const newOperand = (newOperand: string) => {
  if (operand.value) {
    addOrSubstract();
  }
  operand.value = newOperand;
};
</script>
<style lang="scss" scoped>
.calculator {
  &-display {
    position: relative;
    font-size: xx-large;
    padding: 0.5em;
    background-color: #00000035;
    border-radius: 8px;
    margin-bottom: 16px;
    overflow: hidden;

    height: 6rem;

    h1 {
      font-size: 4rem;
      position: absolute;
      left: 1rem;
      top: 0;

      transition: 0.5s;

      &.active {
        // top: 2px;
        font-size: 3rem;
        color: var(--color-success);
      }
    }
    h2 {
      top: 3rem;
      font-size: 2rem;
      position: absolute;
    }
  }

  &-numpad {
    display: grid;
    grid: auto-flow dense / 1fr 1fr 1fr;
    gap: 8px;

    button {
      width: 100%;
      height: 64px;
      font-size: x-large;
      padding: 0;
    }
  }
}
</style>
