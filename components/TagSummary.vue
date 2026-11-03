<template>
  <NuxtLink
    :to="`/tags/${tagInfo.tag.id}`"
    class="card center"
    :style="colorStyle"
  >
    <div>
      <div>{{ tagInfo.tag.name.toUpperCase() }}</div>
      <ui-price :amount="sum" :currency="tagInfo.transactions[0].currency" />
    </div>
  </NuxtLink>
</template>

<script>
export default {
  props: {
    tagInfo: { type: Object, required: true },
  },

  computed: {
    sum() {
      let total = 0;
      this.tagInfo.transactions.forEach((t) => (total += t.amount));
      return total;
    },
    tagColor() {
      if (this.tagInfo && this.tagInfo.tag && this.tagInfo.tag.color) {
        return `${this.tagInfo.tag.color}52`;
      }
      return null;
    },
    tagBorderColor() {
      if (this.tagColor) {
        return `${this.tagInfo.tag.color}55`;
      }
      return "#555";
    },
    colorStyle() {
      if (this.tagColor) {
        return `background-color: ${this.tagColor};`;
      }
      return null;
    },
  },
};
</script>
<style scoped lang="scss">
.card {
  text-decoration: none;
  color: var(--color-grey-light-1);
  border: 1px solid transparent;
  max-height: 4em;
}

.card:hover {
  border: solid 1px;
  border-color: v-bind("tagBorderColor");
}
</style>
