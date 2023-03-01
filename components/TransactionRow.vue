<template>
    <div class="transaction">
        <div class="item">
            <NuxtLink v-if="firstTag" :to="`/tags/${firstTag.id}`">
                <CategoryBadge :category="firstTag" />
            </NuxtLink>
        </div>
        <p class="item">{{ day }}.{{ month }}.</p>
        <div class="item">{{ transaction.description }}</div>
        <p class="item">{{ transaction.amount }}&nbsp;{{ transaction.currency }}</p>
    </div>
</template>
<script>
import { CategoryBadge } from '#components';

export default {

  components: { CategoryBadge },
    
    props: ['transaction'],

    computed: {
        date() {
            return new Date(this.transaction.created);
        },
        day() {
            return this.date.getDate();
        },
        month() {
            return this.date.getMonth() + 1;
        },
        firstTag() {
            if (this.transaction.tags.length > 0) {
                return this.transaction.tags[0];
            }
            return undefined;
        }
    }
}
</script>
