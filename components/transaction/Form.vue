<template>
  <div ref="focusDiv" class="card">
    <div class="row-simple min-h-10">
      <transition name="slide" mode="out-in">
        <ui-button
          v-if="stage === 2"
          icon="i-ic-baseline-new-label"
          icon-size="1rem"
          squared
          outlined
          @click="showNewCategory = !showNewCategory"
        />
      </transition>
      <ui-button
        v-if="!hideClose"
        id="close-t-form"
        width="2rem"
        color="light"
        link
        squared
        icon="i-ic-baseline-close"
        @click="$emit('close')"
      />
    </div>
    <transition name="slide" mode="out-in" class="navigation-container">
      <!-- ENTIRE FORM -->
      <div v-if="stage === 3" class="form">
        <ui-input
          :label="$t('t_amount')"
          v-model.number="transaction.amount"
          type="number"
          :required="true"
        />
        <ui-input
          :label="$t('t_date')"
          v-model="date"
          type="date"
          :required="true"
        />
        <ui-input
          :label="$t('t_time')"
          v-model="time"
          type="time"
          :required="true"
        />
        <ui-input
          :label="$t('t_desc')"
          v-model="transaction.description"
          type="text"
          :required="true"
        />

        <ui-select v-model.number="transaction.sourceId" :label="$t('t_from')">
          <option
            v-for="source in allSources"
            :key="'option-source-' + source.id"
            :value="source.id"
          >
            {{ source.name }}
          </option>
        </ui-select>

        <ui-select v-model.number="transaction.targetId" :label="$t('t_to')">
          <option
            v-for="source in allSources"
            :key="'option-target-' + source.id"
            :value="source.id"
          >
            {{ source.name }}
          </option>
        </ui-select>
        <ui-select v-model.number="transaction.categoryId" :label="$t('t_tag')">
          <option
            v-for="category in categories"
            :key="category.id + '-event'"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </ui-select>

        <div class="flex items-center gap-4 min-h-[3rem]">
          <ui-toggle v-model="isRecurring"></ui-toggle>
          <ui-input
            v-if="isRecurring"
            :label="$t('t_recurring_label')"
            v-model.number="transaction.recurring"
            type="number"
            class="w-20 text-center ml-auto flex-1"
          />
          <p v-else>{{ $t("t_recurring_desc") }}</p>
          <i class="i-ic-baseline-rotate-right ml-auto"></i>
        </div>

        <div class="flex items-center gap-4 min-h-[3rem]w">
          <ui-toggle v-model="transaction.isImportant"></ui-toggle>
          <p>{{ $t("t_important") }}</p>
          <i class="i-ic-round-warning text-amber ml-auto"></i>
        </div>

        <ui-button
          @click="send"
          :loading="loading"
          color="primary"
          width="100%"
          height="5rem"
        >
          {{ $t("t_send") }}
        </ui-button>
      </div>

      <!-- CATEGORY SELECTION -->
      <div v-else-if="stage === 2">
        <transition name="slide" mode="out-in">
          <div class="new-category" v-if="showNewCategory">
            <h3 class="mb-3 text-xl uppercase">{{ $t("c_new") }}</h3>
            <ui-input :label="$t('c_name')" v-model="newCategoryName" />
            <div class="flex gap-1">
              <ui-button
                @click="createCategory()"
                :loading="categoryLoading"
                :disabled="!newCategoryName"
                color="primary"
                class="flex-1"
                >{{ $t("confirm") }}</ui-button
              >
              <ui-button @click="showNewCategory = false" height="3rem">{{
                $t("cancel")
              }}</ui-button>
            </div>
          </div>
          <div v-else class="categories">
            <CategoryBadge
              v-for="category in categories"
              :category="category"
              @selected="categorySelected(category)"
            />
          </div>
        </transition>
      </div>

      <!-- NUMPAD  -->
      <transaction-calculator
        v-else-if="stage === 1"
        v-model="transaction.amount"
        @confirm="stage = stage + 1"
      />

      <div v-else class="income-expense">
        <ui-button
          color="success"
          icon="fa-solid fa-arrow-trend-up"
          @click="makeIncome"
          width="8rem"
          height="8rem"
          rounded
        >
          {{ $t("t_add_in") }}
        </ui-button>
        <ui-button
          color="danger"
          icon="fa-solid fa-arrow-trend-down"
          rounded
          width="8rem"
          height="8rem"
          @click="makeExpense"
        >
          {{ $t("t_add_out") }}
        </ui-button>
      </div>
    </transition>
    <div class="navigation">
      <ui-button
        @click="stage = stage - 1"
        :disabled="stage <= 0"
        rounded
        color="primary"
        icon="i-ic-baseline-arrow-back"
      />
      <a
        v-for="index in stages"
        :class="
          stage === index - 1 ? 'navigation-stage active' : 'navigation-stage'
        "
        @click="stage = index - 1"
      />
      <ui-button
        @click="stage = stage + 1"
        :disabled="stage >= stages - 1"
        rounded
        color="primary"
        icon="i-ic-baseline-arrow-forward"
      />
    </div>
    <p class="error" style="text-align: right">{{ error }}</p>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useCategoriesStore } from "@/stores/categories";
import { useSourcesStore } from "@/stores/sources";
import type { Transaction, CreateUpdateTransaction, Category } from "@/types";
import { transactionToUpdateTransaction } from "@/stores/utils";

const focusDiv = ref<any>(null);

const props = defineProps<{
  transactionIn?: Transaction;
  startStage?: number;
  noFrame?: boolean;
  error?: string;
  hideClose?: boolean;
}>();

const stage = ref(0);
const stages = 4;
const transaction = ref<CreateUpdateTransaction>({
  transactedAt: undefined,
  amount: 0,
  description: "",
  sourceId: 1,
  targetId: 2,
  recurring: 0,
  isImportant: false,
});
const date = ref<string>();
const time = ref<string>();

const boxColor = ref<string>();
const borderColor = ref<string>();

onMounted(() => {
  sourcesStore.fetchAllSources();
  categoriesStore.fetchCategories();

  date.value = formatDate(new Date());
  time.value = formatTime(new Date());
  // transaction.value = ;

  if (props.transactionIn) {
    transaction.value = transactionToUpdateTransaction(props.transactionIn);
    transaction.value.tags = props.transactionIn.tags
      .map((t) => t.name)
      .join(",");
    delete transaction.value.confirmed; // discard explicit confirmed property - only for confirm action
    date.value = formatDate(
      new Date(transaction.value.transactedAt ?? new Date())
    );
    time.value = formatTime(
      new Date(transaction.value.transactedAt ?? new Date())
    );
  }

  if (props.startStage) {
    stage.value = props.startStage;
  }
  if (props.noFrame) {
    boxColor.value = "var(--color-background-dark)";
    borderColor.value = "#00000000";
  }

  isRecurring.value = transaction.value.recurring !== 0;

  focusDiv.value.scrollIntoView({ block: "center", behavior: "smooth" });
});

const makeIncome = () => {
  transaction.value.sourceId = allSources.value.find((s) => s.isOut)?.id ?? 2;
  transaction.value.targetId = allSources.value.find((s) => !s.isOut)?.id ?? 1;
  stage.value++;
};

const makeExpense = () => {
  transaction.value.sourceId = allSources.value.find((s) => !s.isOut)?.id ?? 1;
  transaction.value.targetId = allSources.value.find((s) => s.isOut)?.id ?? 2;
  stage.value++;
};

const isRecurring = ref(false);
watch(isRecurring, (value) => {
  if (value) {
    transaction.value.recurring = 1
  } else {
    transaction.value.recurring = 0
  }
})

const categoriesStore = useCategoriesStore();
const { categories, categoryLoading } = storeToRefs(categoriesStore);

const sourcesStore = useSourcesStore();
const { allSources } = storeToRefs(sourcesStore);

const transactionStore = useTransactionStore();
const { loading } = storeToRefs(transactionStore);

const { t } = useI18n();
const emit = defineEmits(["send", "close"]);

const send = () => {
  if (!transaction.value.description) {
    transaction.value.description = t("t_placeholder");
  }
  const datetime = date.value ? new Date(date.value) : new Date();
  if (time.value) {
    const hour = parseInt(time.value.split(":")[0]);
    const minute = parseInt(time.value.split(":")[1]);
    datetime.setHours(hour, minute);
  }
  transaction.value.transactedAt = datetime.toUTCString();

  emit("send", transaction.value);
};

const formatDate = (date: Date) => {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${m}-${d}`;
};

const formatTime = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return hours + ":" + minutes;
};

const categorySelected = (category: Category) => {
  transaction.value.categoryId = category.id;
  stage.value++;
};

const showNewCategory = ref(false);
const newCategoryName = ref();
const createCategory = () => {
  categoriesStore
    .createCategory({ name: newCategoryName.value })
    .then(() => (newCategoryName.value = undefined));
};
</script>

<style lang="scss" scoped>
.navigation-container {
  height: 580px;
  // overflow: scroll;
}

.collapsed {
  transition: 250ms;
  border-color: #00000000;
  padding-top: 0;
  padding-bottom: 0;
}

.navigation {
  display: flex;
  justify-content: center;
  gap: 32px;
  align-items: center;
  margin-top: auto;
  padding-top: 32px;
  margin-bottom: 16px;

  &-stage {
    width: 1rem;
    aspect-ratio: 1;
    border: 1px solid var(--secondary-100);
    border-radius: 50%;
    cursor: pointer;

    &:hover {
      background-color: var(--secondary-100);
    }
  }
}

.active {
  border-color: var(--primary-100);
  background-color: var(--primary-100);
}

.button-sm {
  min-height: 3em;
  margin-left: 5px;
  padding-left: 10px;
  padding-right: 10px;
}

.row {
  display: flex;
  min-height: 2.5em;

  p {
    // margin-right: 1em;
    // width: 30%;
    padding-right: 1em;
    // text-align: right;
  }

  textarea,
  input,
  select {
    width: 70%;
    margin-left: auto;
  }
}

.save-btn {
  width: 100%;
  padding: 8px 0;
  height: 64px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.income-expense {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

#close-t-form {
  margin-left: auto;
}

.row-simple {
  align-items: center;
  margin-bottom: 0.5rem;
}

.categories {
  height: 100%;
  overflow: auto;
}

.new-category {
  box-sizing: content-box;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  max-height: 7rem;
  padding: 0.5rem;
}
</style>
