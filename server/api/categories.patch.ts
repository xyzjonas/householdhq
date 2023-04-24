import doValidate from "~~/server/validators/validator";
import { EditCategoryDto } from "../validators/categories.dto";
import categories from "../controllers/categories";


export default defineEventHandler(async (event) => {
    const data: EditCategoryDto = await doValidate(EditCategoryDto, await readBody(event));
    const response = await categories.editTag(data)
    setResponseStatus(event, 200);
    return {
        data: response,
        message: 'updated'
    };
})