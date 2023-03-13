import tags from "~~/server/controllers/tags";
import doValidate from "~~/server/validators/validator";
import { EditTagDto } from "../validators/tags.dto";


export default defineEventHandler(async (event) => {
    const data: EditTagDto = await doValidate(EditTagDto, await readBody(event));
    const response = await tags.editTag(data)
    setResponseStatus(event, 200);
    return {
        data: response,
        message: 'updated'
    };
})