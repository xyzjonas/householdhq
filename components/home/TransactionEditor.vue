<template>
  <transaction-form
    :transaction-in="transaction"
    :start-stage="3"
    hide-close
    @send="save"
  />
</template>

<script setup lang="ts">
import type { CreateUpdateTransaction, Transaction } from "~/types";

defineProps<{ transaction: Transaction }>();

const emit = defineEmits<{ done: [] }>();

const { update } = useTransactionActions();

const save = async (data: CreateUpdateTransaction) => {
  if (await update(data)) {
    emit("done");
  }
};
</script>
