<template>
  <div :style="transparent && !details ? transparentStyle : ''">
    <div class="wrapper">
      <div
        :class="`transaction ${transaction.target.isOut ? '' : 'income'}`"
        :style="`width: ${details ? 60 : 100}%`"
        @click="
          details = !details;
          confirmDelete = false;
        "
      >
        <div class="item">
          <DateTile :date="date" />
        </div>
        <div class="item">
          {{ transaction.description }}
          <br />
          <small style="font-size: xx-small"
            >{{ transaction.source.name }} <i class="fa-solid fa-arrow-right"></i> {{ transaction.target.name }}</small
          >
        </div>
        <p class="item">
          <ui-price :amount="transaction.amount" :currency="transaction.currency" />
        </p>
      </div>
      <div class="panel" :style="`width: ${details ? 40 : 0}%`">
        <ui-button v-if="!confirmDelete" icon="fa-solid fa-trash" @click="confirmDelete = !confirmDelete">{{
          $t("delete")
        }}</ui-button>
        <ui-button
          v-else
          icon="fa-solid fa-trash"
          color="danger"
          :loading="loading"
          @click="emit('delete', { id: transaction.id })"
          >{{ $t("confirm") }}</ui-button
        >
        <ui-button @click="edit = !edit" :icon="edit ? 'fa-solid fa-xmark' : 'fa-solid fa-pen'">{{
          edit ? $t("cancel") : $t("edit")
        }}</ui-button>
      </div>
      <div class="panel y" :style="`width: ${confirmable ? 20 : 0}%`">
        <ui-button
          color="success"
          :loading="patching"
          @click="patchTransaction({ id: transaction.id, confirmed: true, created: transaction.created })"
        >
          {{ $t("confirm") }}
          <span v-if="transaction.recurring > 0">
            <br />
            <small>{{ $t("t_new_recurring") }} {{ transaction.recurring }} {{ $t("months") }}</small>
          </span>
        </ui-button>
      </div>
    </div>
    <transition name="page" mode="in-out">
      <div v-if="edit && details">
        <TransactionForm
          :transactionIn="transaction"
          :startStage="2"
          :processing="patching"
          :error="patchingError"
          @cancel="edit = false"
          @send="patchTransaction"
        />
      </div>
    </transition>
  </div>
</template>
<script setup lang="ts">
import type { Transaction } from "@/stores/types";
import { useTokenStore } from "@/stores/tokenStore";
import { useTransactionStore } from "@/stores/transactions";
import { storeToRefs } from "pinia";

const { loading } = storeToRefs(useTransactionStore());

const props = defineProps<{
  transaction: Transaction;
  transparent?: boolean;
}>();

const details = ref(false);
const edit = ref(false);
const patching = ref(false);
const patchingError = ref("");

const confirmDelete = ref(false);

const transparentStyle = ref("");
if (props.transparent) {
  transparentStyle.value = "filter: opacity(0.3);";
}

const { token } = storeToRefs(useTokenStore());

const emit = defineEmits(["patched", "delete"]);

const patchTransaction = (transactionData: any) => {
  patching.value = true;
  const url = "/api/transactions";
  $fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: "Bearer " + token.value,
    },
    body: transactionData,
  })
    .then((res) => {
      emit("patched", res.data);
      edit.value = false;
      details.value = false;
    })
    // .catch(err => {
    //     console.info(err)
    //     patchingError.value = err.statusMessage;
    // })
    .finally(() => {
      patching.value = false;
    });
};

const date = computed(() => {
  return new Date(props.transaction.created);
});

const firstTag = computed(() => {
  if (props.transaction.tags.length > 0) {
    return props.transaction.tags[0];
  }
  return undefined;
});

const tagColor = computed(() => {
  if (firstTag.value && firstTag.value.color) {
    return `${firstTag.value.color}aa`;
  }
  return "#00000000";
});

const confirmable = computed(() => {
  return !props.transaction.confirmed && date.value <= new Date();
});
</script>
<style lang="scss" scoped>
.transaction {
  border-right: solid 10px;
  border-right-color: v-bind("tagColor");
  transition: 250ms;

  &:hover {
    transition: 250ms;
    border-right-color: v-bind("tagColor");
  }
}

.wrapper {
  display: flex;
  flex-direction: row;

  .panel {
    overflow: hidden;
    display: flex;
    align-items: center;
    transition: 250ms;
    padding-top: 0.25em;
    padding-bottom: 0.25em;

    .y {
      flex-direction: column;
    }

    button {
      height: 100%;
      width: 4em;
      margin-left: 5px;
      flex: auto;
    }
  }
}

.income {
  border-color: var(--color-success);
}
</style>
