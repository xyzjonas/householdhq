import { plainToClass, plainToInstance } from "class-transformer";
import tags from "~~/server/controllers/tags";
import { IdDto } from "~~/server/validators/common.dto";
import doValidate from "~~/server/validators/validator";


export default defineEventHandler(async (event) => {
    const data = await doValidate(IdDto, event.context.params);
    const tag = await tags.findSingle(data);
    return {
        data: tag
    };
})