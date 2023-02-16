import transactions from "~~/server/controllers/transactions";

export default defineEventHandler(async (event) => {
    const data = await transactions.findRecent({
        month: parseInt(event.context.params.month),
        year: parseInt(event.context.params.year)
    })
    return {
        count: data.length,
        message: `findMany`,
        data: data,
    }
})