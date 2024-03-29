import tags from "~~/server/controllers/tags";
import doValidate from "~~/server/validators/validator";
import { IdDto } from "../validators/common.dto";


export default defineEventHandler(async (event) => {
    const data: IdDto = await doValidate(IdDto, await readBody(event));
    const response = await tags.deleteTag(data)
    setResponseStatus(event, 200);
    return {
        data: response,
        message: 'deleted'
    };
})