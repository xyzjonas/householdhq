<template>
    <tr>
        <td>{{ new Date(transaction.created).toLocaleDateString() }}</td>
        <td>{{ transaction.amount }} {{ transaction.currency }}</td>
        <td>{{ transaction.description }}</td>
    </tr>
</template>
<script>
export default {
    props: ['transaction']
}
</script>
