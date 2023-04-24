import categories from "../controllers/categories";



export default defineEventHandler(async () => {
    const data = await categories.findAllCategories();
    return {
        count: data.length,
        data: data,
        message: 'findAll'
    };
})