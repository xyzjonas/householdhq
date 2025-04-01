<template>
  <div>
    <div v-if="editting" class="flex gap-1">
      <ui-button @click="send" color="success" class="uppercase">{{
        $t("ok").toUpperCase()
      }}</ui-button>
      <ui-button @click="editting = false" color="secondary" outlined>{{
        $t("cancel")
      }}</ui-button>
      <ui-select v-model="valueCopy">
        <option
          v-for="option in options"
          :key="'option-target-' + option"
          :value="option"
        >
          {{ option }}
        </option>
      </ui-select>
    </div>
    <p v-else @click="editting = true" style="text-align: end">
      {{ valueCopy || $t("undefined") }}
    </p>
  </div>
</template>
<script lang="ts" setup>
// const modelValue = defineModel<string>({ required: true });
const props = defineProps<{
  value?: string;
  keyName: string;
  options: string[];
}>();

const editting = ref(false);

const valueCopy = ref(props.value ?? "");
// const changed = computed(() => valueCopy !== modelValue.value);

const emit = defineEmits(["send"]);

function send() {
  const data: { [key: string]: any } = {};
  data[props.keyName] = valueCopy.value;
  emit("send", data);
  editting.value = false;
}
</script>
