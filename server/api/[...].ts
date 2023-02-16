export default defineEventHandler(() => {
    throw createError({
        statusCode: 404,
        statusMessage: 'Endpoint not found.',
    })
})