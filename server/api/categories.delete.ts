import doValidate from "~~/server/validators/validator";
import { IdDto } from "../validators/common.dto";
import categories from "../controllers/categories";


export default defineEventHandler(async (event) => {
    const data: IdDto = await doValidate(IdDto, await readBody(event));
    const response = await categories.deleteCategory(data)
    setResponseStatus(event, 200);
    return {
        data: response,
        message: 'deleted'
    };
})