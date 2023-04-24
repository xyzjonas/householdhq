import doValidate from "~~/server/validators/validator";
import { CategoryDto } from "../validators/categories.dto";
import categories from "../controllers/categories";


export default defineEventHandler(async (event) => {
    const data: CategoryDto = await doValidate(CategoryDto, await readBody(event));
    const response = await categories.createCategory(data)
    setResponseStatus(event, 201);
    return {
        data: response,
        message: 'created'
    };
})