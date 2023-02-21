<template>
    <div class="box">
        <p class="item">{{ day }}.{{ month }}.</p>
        <div class="item">
            <NuxtLink v-if="firstTag" :to="`/tags/${firstTag.id}`">
                <Icon :iconName="firstTag.icon" :alt="firstTag.name.slice(0, 2).toUpperCase()" />
            </NuxtLink>
        </div>
        <div class="item">{{ transaction.description }}</div>
        <p class="item">{{ transaction.amount }} {{ transaction.currency }}</p>
    </div>
</template>
<script>
import { Icon } from '#components';

export default {

  components: { Icon },
    
    props: ['transaction'],

    computed: {
        date() {
            return new Date(this.transaction.created);
        },
        day() {
            return this.date.getDate();
        },
        month() {
            return this.date.getMonth();
        },
        firstTag() {
            if (this.transaction.tags.length > 0) {
                console.info(this.transaction.tags)
                return this.transaction.tags[0];
            }
            return undefined;
        }
    }
}
</script>
