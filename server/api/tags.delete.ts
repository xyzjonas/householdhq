import tags from "~~/server/controllers/tags";
import doValidate from "~~/server/validators/validator";
import { TagIdDto } from "../validators/tags.dto";


export default defineEventHandler(async (event) => {
    const data: TagIdDto = await doValidate(TagIdDto, await readBody(event));
    const response = await tags.deleteTag(data)
    setResponseStatus(event, 200);
    return {
        data: response,
        message: 'deleted'
    };
})