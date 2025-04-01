<template>
  <div class="form-wrapper">
    <ui-input v-model="date" type="date" :label="$t('t_date')" />
    <ui-input v-model="time" type="time" :label="$t('t_time')" />
    <ui-input
      v-model.number="state.amount"
      type="number"
      :label="$t('t_amount')"
    />
    <div v-if="error">
      <small class="error">{{ $t(error.statusMessage) }}</small>
    </div>
    <div class="row-simple">
      <ui-button @click="send" :loading="processing" color="primary">{{
        $t("t_send")
      }}</ui-button>
      <ui-button @click="$emit('close')" outlined>{{ $t("cancel") }}</ui-button>
    </div>
  </div>
</template>
<script>
import { Spinner } from "#components";

export default {
  components: { Spinner },

  props: ["sourceId"],

  data() {
    return {
      date: this.formatDate(new Date()),
      time: this.formatTime(new Date()),
      state: {
        created: null,
        amount: 0,
        sourceId: this.sourceId,
      },
      processing: false,
      error: undefined,
    };
  },

  async created() {
    const tok = await this.$auth0.getAccessTokenSilently();
    this.token = tok;
  },

  methods: {
    formatDate(date) {
      return `${date.getUTCFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    },
    formatTime(date) {
      return `${date.getHours()}:${date.getMinutes()}`;
    },

    send() {
      const datetime = new Date(this.date);
      if (this.time) {
        const hour = this.time.split(":")[0];
        const minute = this.time.split(":")[1];
        datetime.setHours(hour, minute);
      }
      this.state.created = datetime.toUTCString();
      this.processing = true;
      const url = "/api/sources/update";
      $fetch(url, {
        method: "PUT",
        body: this.state,
        headers: {
          Authorization: "Bearer " + this.token,
        },
      })
        .then((res) => this.$emit("created", res.data))
        .catch((err) => (this.error = err.data))
        .finally(() => {
          this.processing = false;
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.row-simple {
  gap: 4px;
}
button {
  text-transform: lowercase;
}
.form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  input {
    width: 100%;
  }
}
</style>
