<template>
  <div>
    <div v-if="editting" class="flex gap-1">
      <ui-button color="success" class="uppercase" @click="send">{{
        $t("ok").toUpperCase()
      }}</ui-button>
      <ui-button color="secondary" outlined @click="editting = false">{{
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
    <p v-else style="text-align: end" @click="editting = true">
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
  const data: Record<string, string> = {};
  data[props.keyName] = valueCopy.value;
  emit("send", data);
  editting.value = false;
}
</script>
