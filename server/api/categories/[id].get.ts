import categories from "~~/server/controllers/categories";
import { IdDto } from "~~/server/validators/common.dto";
import doValidate from "~~/server/validators/validator";


export default defineEventHandler(async (event) => {
    const data = await doValidate(IdDto, event.context.params);
    const category = await categories.findSingle(data);
    return {
        data: category
    };
})