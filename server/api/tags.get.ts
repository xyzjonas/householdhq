import { plainToClass, plainToInstance } from "class-transformer";
import tags from "~~/server/controllers/tags";
import { IdDto } from "~~/server/validators/transactions.dto";
import doValidate from "~~/server/validators/validator";


export default defineEventHandler(async (event) => {
    const data = await tags.findAllTags();
    return {
        count: data.length,
        data: data,
        message: 'findAll'
    };
})