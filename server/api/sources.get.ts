import sources from "../controllers/sources";


export default defineEventHandler(async (event) => {
    const data = await sources.findAll();

    return {
        count: data.length,
        data: data,
        message: 'findAll'
    };
})